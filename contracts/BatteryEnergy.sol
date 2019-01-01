pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";
// import "./BatteryLibrary.sol";
import "https://github.com/yan-man/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "https://github.com/yan-man/openzeppelin-solidity/contracts/math/Math.sol";

contract BatteryEnergy {

    // Type declarations
    VirtualPowerPlant VirtualPowerPlantContract;

    // State variables
    address public virtualPowerPlantAddress;
    uint public purchaseInterval = 3600; //in sec
     // Battery[] public tempBattery;
    // uint public temp;
    uint private totalInvestment;

    // Events
    // event Log(uint counter);
    event LogBatteryCheck(uint batteryID);
    event LogEnergyPurchased(string serialNumber, uint energyPurchased, uint energyRate, uint remainingInvestment);


    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    }


    function checkBatteryEnergy () public returns (uint) {
        uint batteryIDMax = VirtualPowerPlantContract.getBatteryIDMax();
        uint energyRate = getRealTimeEnergyPrice();

        for (uint batteryID = 0; batteryID < batteryIDMax; i++) {
            // uint capacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            // uint threshold = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            emit LogBatteryCheck(batteryID);
            require(VirtualPowerPlantContract.batteryInvestmentContract()).totalInvestment() > 0);
            (
                uint capacity,
                uint currentFilled,
                uint dateAdded,
                uint cost,
                string memory serialNumber,
                uint priceThreshold,
                uint chargeRate,
                bool active
            ) = VirtualPowerPlantContract.batteries(i);

            uint emptyCapacity = capacity - currentFilled;
            if (emptyCapacity <= 0 || active == false) {
                //revert("Not enough Ether provided.");
                continue;
            }

            if (energyRate < priceThreshold) {
                uint energyAmountToPurchase = calculateEnergyToPurchase(chargeRate, energyRate, emptyCapacity);
                if (buyEnergy(energyAmountToPurchase, energyRate)){
                    emit LogEnergyPurchased(
                        serialNumber,
                        energyAmountToPurchase,
                        energyRate,
                        (VirtualPowerPlantContract.batteryInvestmentContract()).totalInvestment()
                    );
                }
            }
            // return (VirtualPowerPlantContract.BatteryInvestmentContract()).totalInvestment();
        }
        // return tempBattery[0];


    }


    function calculateEnergyToPurchase (uint _chargeRate, uint _energyRate, uint _emptyCapacity) private returns (uint energyAmountToPurchase) {
        uint purchaseIntervalHours = SafeMath.div(purchaseInterval, 3600);
        energyAmountToPurchase = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), _emptyCapacity);
        totalInvestment = (VirtualPowerPlantContract.batteryInvestmentContract()).totalInvestment();
        uint costOfEnergyPurchase = SafeMath.mul(energyAmountToPurchase, _energyRate);
        if (costOfEnergyPurchase > totalInvestment) {
            costOfEnergyPurchase = totalInvestment;
            energyAmountToPurchase = SafeMath.div(totalInvestment, _energyRate);
        }
    }

    function getRealTimeEnergyPrice () private returns (uint) {
        return 1;
    }

    function buyEnergy (uint _energyAmountToPurchase) public returns (bool) {
        require(totalInvestment - _energyAmountToPurchase >= 0, "Not enough money to make this purchase");
        (VirtualPowerPlantContract.batteryInvestmentContract()).updateTotalInvestment(totalInvestment - _energyAmountToPurchase);
        return true;
    }


}
