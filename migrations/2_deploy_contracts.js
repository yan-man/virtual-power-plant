var VirtualPowerPlant = artifacts.require("./VirtualPowerPlant.sol");

module.exports = function(deployer) {
  deployer.deploy(VirtualPowerPlant);
};
