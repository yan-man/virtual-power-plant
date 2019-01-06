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

        uint energyAmountToPurchase;
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
        uint emptyCapacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(_batteryID);

        require(emptyCapacity > 0, "Battery should have empty capacity for charge");
        require(isActive == true, "Battery should be active");

        if (energyDecisionAlgorithm(priceThreshold, energyPrice) == true) {
            energyAmountToPurchase = calculateEnergyToPurchase(chargeRate, energyPrice, emptyCapacity);
            if (buyEnergy(_batteryID, energyAmountToPurchase, energyPrice) == true){
                emit LogEnergyPurchased(
                    serialNumber,
                    energyAmountToPurchase,
                    energyPrice,
                    (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
                );

                return energyAmountToPurchase;
            }
        } else {
            emit LogEnergySold(
                serialNumber,
                energyAmountToPurchase,
                energyPrice,
                (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
            );
        }
        return 0;
    }


    function energyDecisionAlgorithm (uint _priceThreshold, uint _energyPrice) private pure returns (bool chargeBattery) {
        chargeBattery = _priceThreshold > _energyPrice;
    }

    function calculateEnergyToPurchase
    (
        uint _chargeRate,
        uint _energyPrice,
        uint _emptyCapacity
    )
    private
    view
    returns (uint energyAmountToPurchase)
    {
        uint purchaseIntervalHours = SafeMath.div(purchaseInterval, 3600);  // convert seconds to hours
        energyAmountToPurchase = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), _emptyCapacity);
        uint remainingInvestment = (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment();
        uint costOfEnergyPurchase = SafeMath.mul(energyAmountToPurchase, _energyPrice);
        if (costOfEnergyPurchase > remainingInvestment) {
            costOfEnergyPurchase = remainingInvestment;
            energyAmountToPurchase = SafeMath.div(remainingInvestment, _energyPrice);
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


}
