const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

/// @author Yan Man
/// @title Test functionality for VirtualPowerPlant contract & other deployed contracts
contract("BatteryInvestment contract", function (accounts) {
  // set to true to show additional info within tests
  const showConsoleLog = false;

  const virtualPowerPlantOwner = accounts[0]; // by default, contract deployer
  const virtualPowerPlantAdmin = accounts[1]; // set to admin

  // set of test investors
  const investor1 = accounts[2];
  const investor2 = accounts[3];
  const investor3 = accounts[4];
  const investor4 = accounts[5];

  // sample investment amounts in wei
  let investmentAmount1 = 10e6;
  let investmentAmount2 = 15e6;
  let investmentAmount3 = 5e6;
  let investmentAmount4 = 8e6;

  // batteries to add to batt array
  let battery1 = {
    capacity: 100,
    currentFilled: 20,
    cost: 13e5,
    serialNumber: "0x1",
    priceThreshold: 7e3,
    chargeRate: 4,
  };

  let battery2 = {
    capacity: 110,
    currentFilled: 25,
    cost: 12e5,
    serialNumber: "0x2",
    priceThreshold: 10e3,
    chargeRate: 6,
  };

  let battery3 = {
    capacity: 90,
    currentFilled: 22,
    cost: 11e5,
    serialNumber: "0x3",
    priceThreshold: 5e3,
    chargeRate: 8,
  };

  let battery4 = {
    capacity: 80,
    currentFilled: 30,
    cost: 10e5,
    serialNumber: "0x4",
    priceThreshold: 4e3,
    chargeRate: 20,
  };

  let battery5 = {
    capacity: 70,
    currentFilled: 26,
    cost: 9e5,
    serialNumber: "0x5",
    priceThreshold: 3e3,
    chargeRate: 11,
  };

  // before each test, retrieve deployed contract addresses
  beforeEach(async () => {
    virtualPowerPlant = await VirtualPowerPlant.deployed();

    batteryInvestmentAddress =
      await virtualPowerPlant.batteryInvestmentContract();
    batteryEnergyAddress = await virtualPowerPlant.batteryEnergyContract();

    batteryInvestmentContract = await BatteryInvestment.at(
      batteryInvestmentAddress
    );
    batteryEnergyContract = await BatteryEnergy.at(batteryEnergyAddress);
  });

  // preliminary tests - check contract deployment
  it("1)...check contract addresses are correct", async () => {
    // const val = batteryInvestmentAddress.remainingInvestment();
    // const val = await virtualPowerPlant.numBatteries.call().toNumber();
    // console.log(val);

    const batteryInvestmenttest = await BatteryInvestment.deployed();

    const vals = (
      await batteryInvestmenttest.remainingInvestment.call()
    ).toNumber();
    console.log(vals);

    const investment = await batteryInvestmenttest.investMoney({
      from: investor1,
      value: 2500000,
    });
    // console.log(investment);

    const vals2 = (
      await batteryInvestmenttest.remainingInvestment.call()
    ).toNumber();
    console.log(vals2);

    // virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner();
    // if (showConsoleLog) {
    //   new Promise(() =>
    //     console.log(
    //       "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
    //     )
    //   );
    // }
    // assert.equal(
    //   virtualPowerPlantOwner,
    //   virtualPowerPlantOwnerCheck,
    //   "Owner address does not match accounts[0] from ganache"
    // );
    // // check contracts deployed by VPP
    // let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
    // if (showConsoleLog) {
    //   new Promise(() =>
    //     console.log("BatteryInvestment address: " + batteryInvestmentAddress)
    //   );
    // }
    // assert.equal(
    //   batteryInvestmentAddress,
    //   batteryInvestmentAddressCheck,
    //   "BatteryInvestment contract address incorrect"
    // );
    // let batteryEnergyAddressCheck = await batteryEnergyContract.address;
    // if (showConsoleLog) {
    //   new Promise(() =>
    //     console.log("BatteryEnergy address: " + batteryEnergyAddress)
    //   );
    // }
    // assert.equal(
    //   batteryEnergyAddress,
    //   batteryEnergyAddressCheck,
    //   "BatteryEnergy contract address incorrect"
    // );
  });
});
