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


    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    }


    function checkBatteryEnergy () public returns (uint totalEnergyPurchase) {
        // uint batteryIDMax = VirtualPowerPlantContract.getBatteryIDMax();
        uint energyPrice = getRealTimeEnergyPrice();

        for (uint i = 0; i < VirtualPowerPlantContract.numBatteries(); i++) {
            uint batteryID = VirtualPowerPlantContract.batteryMapping(i);
            // uint capacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            // uint threshold = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            emit LogBatteryCheck(batteryID);
            require((VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment() > 0);
            (
                uint capacity,
                uint currentFilled,
                bytes32 serialNumber,
                uint priceThreshold,
                uint chargeRate,
                bool isActive,
                uint mapIndex
            ) = VirtualPowerPlantContract.getRelevantBatteryInfo(batteryID);

            require(mapIndex == i, "Error mapping from batteries array to batteryMapping");

            uint emptyCapacity = capacity - currentFilled;
            if (emptyCapacity <= 0 || isActive == false) {
                //revert("Not enough Ether provided.");
                continue;
            }

            if (energyDecisionAlgorithm(priceThreshold, energyPrice)) {
                uint energyAmountToPurchase = calculateEnergyToPurchase(chargeRate, energyPrice, emptyCapacity);
                if (buyEnergy(batteryID, energyAmountToPurchase, energyPrice)){
                    emit LogEnergyPurchased(
                        serialNumber,
                        energyAmountToPurchase,
                        energyPrice,
                        (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment()
                    );
                    totalEnergyPurchase += energyAmountToPurchase;
                }
            } else {
                // totalEnergyPurchase = 88;
            }
        }
        // remainingInvestment = (VirtualPowerPlantContract.BatteryInvestmentContract()).remainingInvestment();
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
