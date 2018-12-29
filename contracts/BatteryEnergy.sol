pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryLibrary.sol";

contract BatteryEnergy is BatteryInvestment{

    using BatteryLibrary for *;

    BatteryInvestment BatteryInvestmentContract;

    constructor () public {

    }

    function setAddress(address _address) public{
        BatteryInvestmentContract = BatteryInvestment(_address);
    }

    function getBatteryIDs() public view returns(uint) {
        return BatteryInvestmentContract.numBatteries();
    }



    function checkBatteryEnergy() public view returns(uint) {
        uint batteryIDMax = getBatteryIDs();
        // for (uint i = 0; i < batteryIDMax; i++) {
        //     BatteryLibrary.Battery memory tempBattery = BatteryInvestmentContract.batteries(i);
        // }
        return batteryIDMax;
    }

}
