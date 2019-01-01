pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";
// import "./BatteryLibrary.sol";

contract BatteryEnergy {

    // Type declarations
    VirtualPowerPlant VirtualPowerPlantContract;

    // State variables
    address public VirtualPowerPlantAddress;
    uint public purchaseInterval; //in sec
     // Battery[] public tempBattery;
    uint public temp;
    uint public batteryIDMax;

    // Events
    // event Log(uint counter);
    event LogBatteryCheck(uint batteryID);
    event energyPurchased(uint energyPurchased, uint remainingInvestment);


    constructor (address _VirtualPowerPlantAddress) public {
        VirtualPowerPlantAddress = _VirtualPowerPlantAddress;
        VirtualPowerPlantContract = VirtualPowerPlant(_VirtualPowerPlantAddress);
    }


    function checkBatteryEnergy () public returns (uint) {
        batteryIDMax = VirtualPowerPlantContract.getBatteryIDMax();
        uint energyRate = getRealTimeEnergyPrice();

        for (uint i = 0; i < batteryIDMax; i++) {
            // uint capacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            // uint threshold = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);

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
                uint energyAmountToPurchase = calculateEnergyToPurchase(chargeRate);
                if (buyEnergy(energyAmountToPurchase)){
                    emit energyPurchased(energyAmountToPurchase, energyRate, (VirtualPowerPlantContract.BatteryInvestmentContract()).totalInvestment());
                }
            }
            // return (VirtualPowerPlantContract.BatteryInvestmentContract()).totalInvestment();
        }
        // return tempBattery[0];


    }


    function calculateEnergyToPurchase (uint _chargeRate) private returns (uint energyAmount) {
        uint purchaseIntervalHours = purchaseInterval / 3600;
        uint energyAmount = (_chargeRate * purchaseIntervalHours);
    }

    function getRealTimeEnergyPrice () private returns (uint) {
        return 1;
    }

    function buyEnergy (uint energyAmountToPurchase) public returns (bool) {
        return true;
    }


}
