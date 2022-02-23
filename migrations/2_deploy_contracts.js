const VirtualPowerPlant = artifacts.require("./VirtualPowerPlant.sol");
const BatteryInvestment = artifacts.require("./BatteryInvestment.sol");
const BatteryEnergy = artifacts.require("./BatteryEnergy.sol");

module.exports = function (deployer) {
  deployer.deploy(VirtualPowerPlant).then(() => {
    deployer.deploy(BatteryInvestment, VirtualPowerPlant.address, 2);
    deployer.deploy(BatteryEnergy, VirtualPowerPlant.address);
  });
};
