var VirtualPowerPlant = artifacts.require("./VirtualPowerPlant.sol");
var BatteryInvestment = artifacts.require("./BatteryInvestment.sol");

module.exports = function (deployer) {
  deployer.deploy(VirtualPowerPlant).then(function () {
    return deployer.deploy(BatteryInvestment, VirtualPowerPlant.address, 2);
  });
};
