var VirtualPowerPlant = artifacts.require("./VirtualPowerPlant.sol");
// var BatteryInvestment = artifacts.require("./BatteryInvestment.sol");

module.exports = function(deployer) {
  deployer.deploy(VirtualPowerPlant);
};

// module.exports = function(deployer) {
//   deployer.deploy(BatteryInvestment);
// };
