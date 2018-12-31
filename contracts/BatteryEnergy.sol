pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";
// import "./BatteryLibrary.sol";

contract BatteryEnergy {

    VirtualPowerPlant VirtualPowerPlantContract;


    address public VirtualPowerPlantAddress;

     // Battery[] public tempBattery;
    uint public temp;
    uint public batteryIDMax;

    event Log(uint counter);
    event LogBatteryCheck(uint batteryID);




    constructor (address _VirtualPowerPlantAddress) public {
      VirtualPowerPlantAddress = _VirtualPowerPlantAddress;
      VirtualPowerPlantContract = VirtualPowerPlant(_VirtualPowerPlantAddress);
  }


    function checkBatteryEnergy() public returns (uint){
        batteryIDMax = VirtualPowerPlantContract.getBatteryIDMax();
        uint energyRate = getRealTimeEnergyPrice();

        for (uint i = 0; i < batteryIDMax; i++) {
            // uint capacity = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);
            // uint threshold = VirtualPowerPlantContract.getBatteryCapacityRemaining(i);

            (uint capacity, uint currentFilled, uint dateAdded, uint cost,
            string memory serialNumber, uint priceThreshold, uint chargeRate, bool active)
            = VirtualPowerPlantContract.batteries(i);

            uint EnergyAmt = capacity - currentFilled;
            if (EnergyAmt <= 0 || active == false) {
                //revert("Not enough Ether provided.");
                continue;
            }

            if (getRealTimeEnergyPrice() < priceThreshold) {
                // emit Log((VirtualPowerPlantContract.BatteryInvestmentContract()).totalInvestment());
                buyEnergy(EnergyAmt);
            }
            // return (VirtualPowerPlantContract.BatteryInvestmentContract()).totalInvestment();
        }
        // return tempBattery[0];


    }

    function getRealTimeEnergyPrice() private returns (uint) {
        return 10;
    }

    function buyEnergy (uint EnergyAmt) public returns (bool) {
        return true;
    }


}
