pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";
// import "./BatteryLibrary.sol";
import "./SafeMath.sol";
import "./Math.sol";

contract BatteryEnergy {

    // Type declarations
    VirtualPowerPlant VirtualPowerPlantContract;

    // State variables
    address public virtualPowerPlantAddress; // address of parent contract deploying battery investment
    uint public purchaseInterval = 3600; // in sec,
     // Battery[] public tempBattery;
    // uint public temp;
    // uint private remainingInvestment;  //

    // Events
    // event Log(uint counter);
    event LogBatteryCheck(uint batteryID);
    event LogEnergyPurchased(bytes32 serialNumber, uint energyPurchased, uint energyPrice, uint remainingInvestment);
    event LogEnergySold(bytes32 serialNumber, uint energyPurchased, uint energyPrice, uint remainingInvestment);


    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    }


    function checkBatteryEnergy () public returns (uint) {
        // uint batteryIDMax = VirtualPowerPlantContract.getBatteryIDMax();
        // uint energyPrice = getRealTimeEnergyPrice();
        // totalEnergyPurchase = 88;
        uint batteryID;
        uint totalEnergyPurchase;

        for (uint i = 0; i < VirtualPowerPlantContract.numBatteries(); i++) {
            batteryID = VirtualPowerPlantContract.batteryMapping(i);
            totalEnergyPurchase += executeBatteryTransaction(batteryID);
        }

        return totalEnergyPurchase;
        // remainingInvestment = (VirtualPowerPlantContract.BatteryInvestmentContract()).remainingInvestment();
    }

    function executeBatteryTransaction (uint _batteryID) public returns (uint) {

        uint energyAmountToTransact;
        uint energyPrice = getRealTimeEnergyPrice();

        emit LogBatteryCheck(_batteryID);
        require((VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment() > 0);
        (
            uint capacity,
            uint currentFilled,
            bytes32 serialNumber,
            uint priceThreshold,
            uint chargeRate,
            bool isActive,
            uint mapIndex
        ) = VirtualPowerPlantContract.getRelevantBatteryInfo(_batteryID);
        // uint emptyCapacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(_batteryID);

        // require(emptyCapacity > 0, "Battery should have empty capacity for charge");
        require(isActive == true, "Battery should be active");
        bool chargeBattery = energyDecisionAlgorithm(priceThreshold, energyPrice);
        energyAmountToTransact = transactEnergy(
            _batteryID,
            capacity,
            currentFilled,
            serialNumber,
            chargeRate,
            energyPrice,
            chargeBattery
        );

        // if (chargeBattery == true) {
        //
        //     buyEnergy(_batteryID, energyAmountToTransact, energyPrice);
        //
        //     // emit LogEnergyPurchased(
        //     //     serialNumber,
        //     //     energyAmountToPurchase,
        //     //     energyPrice,
        //     //     (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
        //     // );
        //     // return energyAmountToPurchase;
        // } else {
        //     // energyToSell = calculateEnergyToTransact(chargeRate, energyPrice, emptyCapacity);
        //     sellEnergy(_batteryID, energyAmountToTransact, energyPrice);
        //     // emit LogEnergySold(
        //     //     serialNumber,
        //     //     energyAmountToPurchase,
        //     //     energyPrice,
        //     //     (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
        //     // );
        // }
        // return 0;


    }


    function energyDecisionAlgorithm (uint _priceThreshold, uint _energyPrice) private pure returns (bool) {
        if (_priceThreshold > _energyPrice) {
            return true;
        } else{
            return false;
        }
    }

    function transactEnergy
    (
        uint _batteryID,
        uint _capacity,
        uint _currentFilled,
        bytes32 _serialNumber,
        uint _chargeRate,
        uint _energyPrice,
        bool _chargeBattery
    )
    private
    returns (uint calculateEnergyToTransact)
    {
        uint purchaseIntervalHours = SafeMath.div(purchaseInterval, 3600);  // convert seconds to hours
        uint emptyCapacity = _capacity - _currentFilled;

        if (_chargeBattery == true) {
            require(emptyCapacity > 0, "Battery should have empty capacity for charge");

            calculateEnergyToTransact = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), emptyCapacity);
            uint remainingInvestment = (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment();
            uint costOfEnergyPurchase = SafeMath.mul(calculateEnergyToTransact, _energyPrice);
            if (costOfEnergyPurchase > remainingInvestment) {
                costOfEnergyPurchase = remainingInvestment;
                calculateEnergyToTransact = SafeMath.div(remainingInvestment, _energyPrice);
            }

            buyEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
            emit LogEnergyPurchased(
                _serialNumber,
                calculateEnergyToTransact,
                _energyPrice,
                (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
            );
        } else {
            calculateEnergyToTransact = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), _currentFilled);
            sellEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
            emit LogEnergySold(
                _serialNumber,
                calculateEnergyToTransact,
                _energyPrice,
                (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
            );
        }
    }

    function getRealTimeEnergyPrice () private pure returns (uint realTimePrice) {
        realTimePrice = 5;
    }

    function buyEnergy (uint _batteryID, uint _energyAmountToPurchase, uint _energyPrice) private returns (bool) {
        uint newRemainingInvestment = SafeMath.sub(
            (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment(),
            SafeMath.mul(
                _energyAmountToPurchase,
                _energyPrice
            )
        );
        require(newRemainingInvestment >= 0, "Not enough money to make this purchase");
        if ((VirtualPowerPlantContract.batteryInvestmentContract()).updateRemainingInvestment(newRemainingInvestment)) {
            // remainingInvestment = newRemainingInvestment;
            VirtualPowerPlantContract.chargeBattery(_batteryID, _energyAmountToPurchase);
            return true;
        }
        return false;
    }

    function sellEnergy (uint _batteryID, uint _energyAmountToSell, uint _energyPrice) private returns (bool) {
        uint newRemainingInvestment = SafeMath.add(
            (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment(),
            SafeMath.mul(
                _energyAmountToSell,
                _energyPrice
            )
        );
        if ((VirtualPowerPlantContract.batteryInvestmentContract()).updateRemainingInvestment(newRemainingInvestment)) {
            VirtualPowerPlantContract.chargeBattery(_batteryID, -_energyAmountToSell);
            return true;
        }
        return false;
    }


}
