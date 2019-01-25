// var Adoption = artifacts.require("Adoption");
//
// module.exports = function(deployer) {
//   deployer.deploy(Adoption);
// };

var VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
// var SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(VirtualPowerPlant);
};
