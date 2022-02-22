const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

// set to true to log additional info within tests
const showConsoleLog = true;

//  @title Test functionality for VirtualPowerPlant contract & 2 other deployed contracts
//  @author Yan Man
contract("BatteryInvestment contract test", function (accounts) {
  let contracts = {
    VirtualPowerPlant: { owner: accounts[0], admin: accounts[1] }, // set to admin later
    BatteryInvestment: {},
    BatteryEnergy: {},
  };

  // sample batteries array to add to VPP
  let batteries = [
    {
      capacity: 100,
      currentFilled: 20,
      cost: 13e5,
      serialNumber: 0x6164643100000000000000000000000000000000000000000000000000000000, // add1
      priceThreshold: 7e3,
      chargeRate: 4,
    },
    {
      capacity: 110,
      currentFilled: 25,
      cost: 12e5,
      serialNumber: 0x6164643200000000000000000000000000000000000000000000000000000000, // add2
      priceThreshold: 10e3,
      chargeRate: 6,
    },
    {
      capacity: 90,
      currentFilled: 22,
      cost: 11e5,
      serialNumber: 0x6164643300000000000000000000000000000000000000000000000000000000, // add3
      priceThreshold: 5e3,
      chargeRate: 8,
    },
    {
      capacity: 80,
      currentFilled: 30,
      cost: 10e5,
      serialNumber: 0x6164643400000000000000000000000000000000000000000000000000000000, // add4
      priceThreshold: 4e3,
      chargeRate: 20,
    },
    {
      capacity: 70,
      currentFilled: 26,
      cost: 9e5,
      serialNumber: 0x6164643500000000000000000000000000000000000000000000000000000000, // add5
      priceThreshold: 3e3,
      chargeRate: 11,
    },
  ];

  // set of test investors, amounts in wei
  const investments = [
    { investor: accounts[2], amount: 10e12 },
    { investor: accounts[3], amount: 15e12 },
    { investor: accounts[4], amount: 5e12 },
    { investor: accounts[5], amount: 8e12 },
  ];

  beforeEach(async () => {
    contracts.VirtualPowerPlant.contract = await VirtualPowerPlant.deployed();

    // deploy initial VPP contract, which in turn deploys following 2 contracts
    contracts.VirtualPowerPlant.address = await contracts.VirtualPowerPlant
      .contract.address;

    // get contracts and contract addresses
    contracts.BatteryInvestment.address =
      await contracts.VirtualPowerPlant.contract.batteryInvestmentContract();
    contracts.BatteryEnergy.address =
      await contracts.VirtualPowerPlant.contract.batteryEnergyContract();

    contracts.BatteryInvestment.contract = await BatteryInvestment.at(
      contracts.BatteryInvestment.address
    );
    contracts.BatteryEnergy.contract = await BatteryEnergy.at(
      contracts.BatteryEnergy.address
    );
  });

  // preliminary tests - check contract deployment
  it("1)...check contract addresses are correct", async () => {
    // console.log(contracts.VirtualPowerPlant.address);

    // const atcon = await VirtualPowerPlant.address;
    // console.log(atcon);
    const deploycon = await VirtualPowerPlant.deployed();
    // console.log(deploycon.address);
    // // console.log(await deploycon.contract);
    // // console.log(await deploycon.virtualPowerPlantAddress.call());
    // // console.log(atcon);

    const BIaddress = await deploycon.batteryInvestmentAddress.call();
    // console.log(BIaddress);
    // console.log(await BatteryInvestment.address);

    // const BIdeploy = await BatteryInvestment.deployed();

    // // console.log(BIdeploy);
    // console.log((await BIdeploy.totalInvestment()).toNumber());
    // console.log(await BIdeploy.virtualPowerPlantAddress());
    // console.log(await BIdeploy.address);

    // const batteryInvestmenttest = await BatteryInvestment.deployed();
    const batteryInvestmenttest = await BatteryInvestment.at(BIaddress);
    const vals = (
      await batteryInvestmenttest.remainingInvestment.call()
    ).toNumber();
    console.log(vals);

    const investment = await batteryInvestmenttest.investMoney({
      from: investments[3].investor,
      value: 2500000,
    });
    console.log(investment);

    const vals2 = (
      await batteryInvestmenttest.remainingInvestment.call()
    ).toNumber();
    console.log(vals2);

    console.log(await batteryInvestmenttest.investorsList.call(0));
    console.log(investments);

    const vpp = await VirtualPowerPlant.deployed();

    await vpp.addBattery(
      100,
      20,
      100000,
      "0x7465737400000000000000000000000000000000000000000000000000000000",
      1000,
      20
    );
    console.log((await vpp.numBatteries.call()).toNumber());

    let batt = await vpp.getBattery.call(0);
    console.log(batt.capacity.toNumber());
    console.log(batt.currentFilled.toNumber());
    console.log(batt.dateAdded.toNumber());
    console.log(batt.cost.toNumber());
    console.log(batt.serialNumber);
    console.log(batt.priceThreshold.toNumber());
    console.log(batt.chargeRate.toNumber());
    console.log(batt.isActive);
    console.log(batt.mapIndex.toNumber());

    await vpp.addBattery(
      90,
      25,
      102000,
      "0x7465737100000000000000000000000000000000000000000000000000000000",
      1200,
      22
    );
    console.log((await vpp.numBatteries.call()).toNumber());

    batt = await vpp.getBattery.call(1);
    console.log(batt.capacity.toNumber());
    console.log(batt.currentFilled.toNumber());
    console.log(batt.dateAdded.toNumber());
    console.log(batt.cost.toNumber());
    console.log(batt.serialNumber);
    console.log(batt.priceThreshold.toNumber());
    console.log(batt.chargeRate.toNumber());
    console.log(batt.isActive);
    console.log(batt.mapIndex.toNumber());

    // const y = await BatteryEnergy.deployed();
    // console.log(y.address);

    // console.log(
    //   await contracts.VirtualPowerPlant.contract.batteryInvestmentContract.call()
    // );
    // console.log(
    //   await contracts.VirtualPowerPlant.contract.batteryEnergyContract.call()
    // );

    // // check deployed main contract
    // virtualPowerPlantOwnerCheck =
    //   await contracts.VirtualPowerPlant.contract.owner();
    // if (showConsoleLog) {
    //   console.log(
    //     "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
    //   );
    // }
    // assert.equal(
    //   contracts.VirtualPowerPlant.owner,
    //   virtualPowerPlantOwnerCheck,
    //   "Owner address does not match accounts[0] from ganache"
    // );

    // // check secondary contracts deployed by VPP
    // let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
    // if (showConsoleLog) {
    //   console.log("BatteryInvestment address: " + batteryInvestmentAddress);
    // }
    // assert.equal(
    //   contracts.BatteryInvestment.address,
    //   batteryInvestmentAddressCheck,
    //   "BatteryInvestment contract address incorrect"
    // );

    // let batteryEnergyAddressCheck = await batteryEnergyContract.address;
    // if (showConsoleLog) {
    //   console.log("BatteryEnergy address: " + batteryEnergyAddress);
    // }
    // assert.equal(
    //   batteryEnergyAddress,
    //   batteryEnergyAddressCheck,
    //   "BatteryEnergy contract address incorrect"
    // );
  });

  // it("2)...check contract addresses are correct", async () => {
  //   // const val = batteryInvestmentAddress.remainingInvestment();
  //   // const val = await virtualPowerPlant.numBatteries.call().toNumber();
  //   // console.log(val);
  //   // const batteryInvestmenttest = await BatteryInvestment.deployed();
  //   // const vals = (
  //   //   await batteryInvestmenttest.remainingInvestment.call()
  //   // ).toNumber();
  //   // console.log(vals);
  //   // const investment = await batteryInvestmenttest.investMoney({
  //   //   from: investor1,
  //   //   value: 2500000,
  //   // });
  //   // console.log(investment);
  //   // const vals2 = (
  //   //   await batteryInvestmenttest.remainingInvestment.call()
  //   // ).toNumber();
  //   // console.log(vals2);
  //   // virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner();
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log(
  //   //       "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
  //   //     )
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   virtualPowerPlantOwner,
  //   //   virtualPowerPlantOwnerCheck,
  //   //   "Owner address does not match accounts[0] from ganache"
  //   // );
  //   // // check contracts deployed by VPP
  //   // let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log("BatteryInvestment address: " + batteryInvestmentAddress)
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   batteryInvestmentAddress,
  //   //   batteryInvestmentAddressCheck,
  //   //   "BatteryInvestment contract address incorrect"
  //   // );
  //   // let batteryEnergyAddressCheck = await batteryEnergyContract.address;
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log("BatteryEnergy address: " + batteryEnergyAddress)
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   batteryEnergyAddress,
  //   //   batteryEnergyAddressCheck,
  //   //   "BatteryEnergy contract address incorrect"
  //   // );
  // });

  // // preliminary tests - check contract deployment
  // it("1)...check contract addresses are correct", async () => {
  //   // const val = batteryInvestmentAddress.remainingInvestment();
  //   // const val = await virtualPowerPlant.numBatteries.call().toNumber();
  //   // console.log(val);

  //   const batteryInvestmenttest = await BatteryInvestment.deployed();

  //   const vals = (
  //     await batteryInvestmenttest.remainingInvestment.call()
  //   ).toNumber();
  //   console.log(vals);

  //   const investment = await batteryInvestmenttest.investMoney({
  //     from: investor1,
  //     value: 2500000,
  //   });
  //   console.log(investment);

  //   const vals2 = (
  //     await batteryInvestmenttest.remainingInvestment.call()
  //   ).toNumber();
  //   console.log(vals2);

  //   // virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner();
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log(
  //   //       "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
  //   //     )
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   virtualPowerPlantOwner,
  //   //   virtualPowerPlantOwnerCheck,
  //   //   "Owner address does not match accounts[0] from ganache"
  //   // );
  //   // // check contracts deployed by VPP
  //   // let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log("BatteryInvestment address: " + batteryInvestmentAddress)
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   batteryInvestmentAddress,
  //   //   batteryInvestmentAddressCheck,
  //   //   "BatteryInvestment contract address incorrect"
  //   // );
  //   // let batteryEnergyAddressCheck = await batteryEnergyContract.address;
  //   // if (showConsoleLog) {
  //   //   new Promise(() =>
  //   //     console.log("BatteryEnergy address: " + batteryEnergyAddress)
  //   //   );
  //   // }
  //   // assert.equal(
  //   //   batteryEnergyAddress,
  //   //   batteryEnergyAddressCheck,
  //   //   "BatteryEnergy contract address incorrect"
  //   // );
  // });
});
