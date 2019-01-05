pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/VirtualPowerPlant.sol";

contract TestVirtualPowerPlant {

    VirtualPowerPlant public virtualPowerPlant = VirtualPowerPlant(DeployedAddresses.VirtualPowerPlant());
    BatteryInvestment public batteryInvestment = BatteryInvestment(virtualPowerPlant.batteryInvestmentAddress());

    event LogValue(address value);


    // function testVirtualPowerPlantContractDeployment() public {
    //
    //     uint dividendPercentage = virtualPowerPlant.dividendPercentage();
    //     uint expected = 1;
    //
    //     Assert.equal(dividendPercentage, expected, "Dividend percentage should default to 1.");
    // }

    function testBatteryInvestmentContractDeployment() public {

        // address expectedAddress = accounts[0];
        // emit LogValue(address(batteryInvestment));
        Assert.equal(address(batteryInvestment), virtualPowerPlant.batteryInvestmentAddress(), "Deployed battery investment address should match.");
    }

    function testBatteryInvestmentContractDeployment2() public {

        // address expectedAddress = accounts[0];
        // emit LogValue(address(batteryInvestment));
        Assert.equal(address(virtualPowerPlant), batteryInvestment.virtualPowerPlantAddress(), "Deployed battery investment address should match.");
    }



    // function testBatteryInvestmentContractDeployment() public {
    //     VirtualPowerPlant virtualPowerPlant = VirtualPowerPlant(DeployedAddresses.VirtualPowerPlant());
    //     BatteryInvestment batteryInvestment = BatteryInvestment(virtualPowerPlant.batteryInvestmentAddress());
    //
    //     uint temp = batteryInvestment.temp();
    //
    //     Assert.equal(temp, uint(5), "check deployed contract");
    // }

}
