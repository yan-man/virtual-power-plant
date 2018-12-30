pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryLibrary.sol";

contract BatteryEnergy {

    // using BatteryLibrary for *;

    event Log(uint counter);

    BatteryInvestment BatteryInvestmentContract;
    address BatteryInvestmentAddress;

    // Battery[] public tempBattery;
    uint public temp;
    uint public batteryIDMax;

    constructor () public {

    }

    function setAddress(address _address) public{
        BatteryInvestmentAddress = _address;
        BatteryInvestmentContract = BatteryInvestment(_address);
    }

    // function getBatteryIDs() public view returns(uint) {
    //     return BatteryInvestmentContract.numBatteries();
    // }



    function checkBatteryEnergy() public  {
        batteryIDMax = BatteryInvestmentContract.getBatteryIDs();

        // tempBattery = super.getBattery(0);
        // temp = batteries[0].capacity;
        for (uint i = 0; i < batteryIDMax; i++) {
            // emit Log(i);
            uint capacity = BatteryInvestmentContract.getBatteryCapacityRemaining(i);
        }
        // return tempBattery[0];


    }

}
