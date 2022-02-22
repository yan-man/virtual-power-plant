const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

// set to true to log detailed test results
const showConsoleLog = false;

//  @title Test functionality for VirtualPowerPlant contract & 2 other deployed contracts
//  @author Yan Man
contract("BatteryInvestment contract test", function (accounts) {
  const contracts = {
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
    contracts.VirtualPowerPlant.deployed = await VirtualPowerPlant.deployed();

    // deploy initial VPP contract, which in turn deploys following 2 contracts
    contracts.VirtualPowerPlant.address = await contracts.VirtualPowerPlant
      .deployed.address;

    // get contracts and contract addresses
    contracts.BatteryInvestment.address =
      await contracts.VirtualPowerPlant.deployed.batteryInvestmentAddress.call();
    contracts.BatteryEnergy.address =
      await contracts.VirtualPowerPlant.deployed.batteryEnergyAddress.call();

    contracts.BatteryInvestment.deployed = await BatteryInvestment.at(
      contracts.BatteryInvestment.address
    );
    contracts.BatteryEnergy.deployed = await BatteryEnergy.at(
      contracts.BatteryEnergy.address
    );
  });

  it("...check deployed contract addresses are correct", async () => {
    // check deployed main contract
    const virtualPowerPlantOwnerCheck =
      await contracts.VirtualPowerPlant.deployed.owner();

    assert.equal(
      contracts.VirtualPowerPlant.owner,
      virtualPowerPlantOwnerCheck,
      "Owner address does not match accounts[0] from ganache"
    );

    const virtualPowerPlantAddressCheck =
      contracts.VirtualPowerPlant.deployed.address;

    assert.equal(
      contracts.VirtualPowerPlant.address,
      virtualPowerPlantAddressCheck,
      "Owner address does not match accounts[0] from ganache"
    );

    // check secondary contracts deployed by VPP
    const batteryInvestmentAddressCheck =
      await contracts.VirtualPowerPlant.deployed.batteryInvestmentAddress.call();

    // we've set this manually, so it should match
    assert.equal(
      contracts.BatteryInvestment.address,
      batteryInvestmentAddressCheck,
      "BatteryInvestment contract address incorrect"
    );
    const batteryEnergyAddressCheck =
      await contracts.VirtualPowerPlant.deployed.batteryEnergyAddress.call();
    // we've set this manually, so it should match
    assert.equal(
      contracts.BatteryEnergy.address,
      batteryEnergyAddressCheck,
      "BatteryEnergy contract address incorrect"
    );

    if (showConsoleLog) {
      console.log(
        "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
      );
      console.log(
        "BatteryInvestment contract address: " + batteryInvestmentAddressCheck
      );
      console.log("BatteryEnergy address: " + batteryEnergyAddressCheck);
    }
  });

  it("...check BatteryInvestment public vars are set properly", async () => {
    // secondary deployed contracts' initialized public vars should be accessible
    // just need to be called bc its just the getter, not a tx
    const investmentPercentage = (
      await contracts.BatteryInvestment.deployed.investmentPercentage.call()
    ).toNumber();
    const numInvestorsWithdraw = (
      await contracts.BatteryInvestment.deployed.numInvestorsWithdraw.call()
    ).toNumber();
    // set from vpp contract
    const dividendPercentage = (
      await contracts.BatteryInvestment.deployed.dividendPercentage.call()
    ).toNumber();

    assert.equal(investmentPercentage, 3, "investmentPercentage incorrect");
    assert.equal(numInvestorsWithdraw, 0, "numInvestorsWithdraw incorrect");
    assert.equal(dividendPercentage, 1, "dividendPercentage incorrect");

    if (showConsoleLog) {
      console.log("investmentPercentage: ", investmentPercentage);
      console.log("numInvestorsWithdraw: ", numInvestorsWithdraw);
      console.log("dividendPercentage: ", dividendPercentage);
    }
  });

  it("...check BatteryInvestment updateRemainingInvestment", async () => {
    const updateValueAmount = 45000400;
    const updateRemainingInvestmentTx =
      await contracts.BatteryInvestment.deployed.updateRemainingInvestment(
        updateValueAmount
      );

    // expecting tx obj returned
    assert.equal(typeof updateRemainingInvestmentTx, "object");

    const remainingInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();

    assert.equal(remainingInvestment, updateValueAmount);

    if (showConsoleLog) {
      console.log("updateRemainingInvestmentTx: ", updateRemainingInvestmentTx);
      console.log("remainingInvestment: ", remainingInvestment);
    }

    // reset back to 0
    await contracts.BatteryInvestment.deployed.updateRemainingInvestment(0);
  });

  it("...check BatteryInvestment investMoney & getInvestorInvestment", async () => {
    let expectedTotalInvested = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();

    const investorList = [];
    await Promise.all(
      investments.map(async (investment, index) => {
        // invest some amount of eth
        let investMoneyTx =
          await contracts.BatteryInvestment.deployed.investMoney({
            from: investment.investor,
            value: investment.amount,
          });
        // expecting tx obj returned
        assert.equal(typeof investMoneyTx, "object");
        expectedTotalInvested = expectedTotalInvested + investment.amount;

        // investor list should be updated
        let currInvestor =
          await contracts.BatteryInvestment.deployed.investorsList.call(index);
        investorList.push(currInvestor);
        assert.equal(currInvestor, investment.investor);

        // individual investor investment amt should be updated
        let investorAmount = (
          await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
            investment.investor,
            0
          )
        ).toNumber();
        assert.equal(investorAmount, investment.amount);
      })
    );

    let remainingInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();
    assert.equal(remainingInvestment, expectedTotalInvested);

    // for one of the investors, create a second investment
    // check that indexed investorList is working properly
    const secondInvestmentAmount = investments[2].amount * 2;
    let investMoneyTx = await contracts.BatteryInvestment.deployed.investMoney({
      from: investments[2].investor,
      value: secondInvestmentAmount,
    });
    // expecting tx obj returned
    assert.equal(typeof investMoneyTx, "object");
    let getSecondInvestment = (
      await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
        investments[2].investor,
        1
      )
    ).toNumber();
    assert.equal(secondInvestmentAmount, getSecondInvestment);

    // check remainingInvestment again
    expectedTotalInvested = expectedTotalInvested + secondInvestmentAmount;
    remainingInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();
    assert.equal(remainingInvestment, expectedTotalInvested);

    if (showConsoleLog) {
      console.log("remainingInvestment: ", remainingInvestment);
      console.log("investorList: ", investorList);
      console.log(
        "second investment from ",
        investments[2].investor,
        ": ",
        getSecondInvestment
      );
    }
  });

  it("...check BatteryInvestment triggerDividend & withdraw", async () => {
    let initialInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();

    // for one of the investors, create an investment
    let investMoneyTx = await contracts.BatteryInvestment.deployed.investMoney({
      from: investments[2].investor,
      value: investments[2].amount,
    });
    // expecting tx obj returned
    assert.equal(typeof investMoneyTx, "object", "expect completed tx");

    let remainingInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();

    const totalExpectedDividend = (remainingInvestment * 1) / 100;
    await contracts.BatteryInvestment.deployed.triggerDividend();
    const totalCurrentDividend = (
      await contracts.BatteryInvestment.deployed.pendingTotalWithdrawals.call(0)
    ).toNumber();

    assert.equal(
      totalExpectedDividend,
      totalCurrentDividend,
      "expect dividend matches expected"
    );

    const finalInvestment = (
      await contracts.BatteryInvestment.deployed.remainingInvestment.call()
    ).toNumber();

    assert.equal(
      remainingInvestment - totalCurrentDividend,
      finalInvestment,
      "expect dividend matches calculated"
    );

    const totalInvestment = (
      await contracts.BatteryInvestment.deployed.totalInvestment.call()
    ).toNumber();

    assert.equal(
      remainingInvestment,
      totalInvestment,
      "expect totalInvestment matches initial investment pre-dividend"
    );

    const numInvestments = (
      await contracts.BatteryInvestment.deployed.getNumInvestorInvestment.call(
        investments[2].investor
      )
    ).toNumber();

    userTotalInvested = 0;
    for (let ind = 0; ind < numInvestments; ind++) {
      let tempInvestment = (
        await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
          investments[2].investor,
          ind
        )
      ).toNumber();
      userTotalInvested = userTotalInvested + tempInvestment;
    }

    const expectedDividendPercentage = userTotalInvested / totalInvestment;
    const expectedUserDividend =
      expectedDividendPercentage * totalCurrentDividend;

    const userDividend = (
      await contracts.BatteryInvestment.deployed.addPendingWithdrawals.call(
        investments[2].investor
      )
    ).toNumber();

    assert.equal(userDividend, expectedUserDividend);

    if (showConsoleLog) {
      console.log("totalCurrentDividend: ", totalCurrentDividend);
      console.log("finalInvestment: ", finalInvestment);
      console.log("userDividend: ", userDividend);
    }
  });

  // it("3)...check VPP admin", async () => {
  //   // check deployed main contract
  //   const virtualPowerPlantOwnerCheck =
  //     await contracts.VirtualPowerPlant.deployed.owner();

  //   assert.equal(
  //     contracts.VirtualPowerPlant.owner,
  //     virtualPowerPlantOwnerCheck,
  //     "Owner address does not match accounts[0] from ganache"
  //   );

  //   const virtualPowerPlantAddressCheck =
  //     contracts.VirtualPowerPlant.deployed.address;

  //   assert.equal(
  //     contracts.VirtualPowerPlant.address,
  //     virtualPowerPlantAddressCheck,
  //     "Owner address does not match accounts[0] from ganache"
  //   );

  //   // check secondary contracts deployed by VPP
  //   const batteryInvestmentAddressCheck =
  //     await contracts.VirtualPowerPlant.deployed.batteryInvestmentAddress.call();

  //   // we've set this manually, so it should match
  //   assert.equal(
  //     contracts.BatteryInvestment.address,
  //     batteryInvestmentAddressCheck,
  //     "BatteryInvestment contract address incorrect"
  //   );
  //   const batteryEnergyAddressCheck =
  //     await contracts.VirtualPowerPlant.deployed.batteryEnergyAddress.call();
  //   // we've set this manually, so it should match
  //   assert.equal(
  //     contracts.BatteryEnergy.address,
  //     batteryEnergyAddressCheck,
  //     "BatteryEnergy contract address incorrect"
  //   );

  //   if (showConsoleLog) {
  //     console.log(
  //       "VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck
  //     );
  //     console.log(
  //       "BatteryInvestment contract address: " + batteryInvestmentAddressCheck
  //     );
  //     console.log("BatteryEnergy address: " + batteryEnergyAddressCheck);
  //   }
  // });

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

// const deploycon = await VirtualPowerPlant.deployed();
// const BIaddress = await deploycon.batteryInvestmentAddress.call();
// const batteryInvestmenttest = await BatteryInvestment.at(BIaddress);
// const vals = (
//   await batteryInvestmenttest.remainingInvestment.call()
// ).toNumber();
// console.log(vals);

// const investment = await batteryInvestmenttest.investMoney({
//   from: investments[3].investor,
//   value: 2500000,
// });
// console.log(investment);

// const vals2 = (
//   await batteryInvestmenttest.remainingInvestment.call()
// ).toNumber();
// console.log(vals2);

// console.log(await batteryInvestmenttest.investorsList.call(0));
// console.log(investments);

// const vpp = await VirtualPowerPlant.deployed();

// await vpp.addBattery(
//   100,
//   20,
//   100000,
//   "0x7465737400000000000000000000000000000000000000000000000000000000",
//   1000,
//   20
// );
// console.log((await vpp.numBatteries.call()).toNumber());

// let batt = await vpp.getBattery.call(0);
// console.log(batt.capacity.toNumber());
// console.log(batt.currentFilled.toNumber());
// console.log(batt.dateAdded.toNumber());
// console.log(batt.cost.toNumber());
// console.log(batt.serialNumber);
// console.log(batt.priceThreshold.toNumber());
// console.log(batt.chargeRate.toNumber());
// console.log(batt.isActive);
// console.log(batt.mapIndex.toNumber());

// await vpp.addBattery(
//   90,
//   25,
//   102000,
//   "0x7465737100000000000000000000000000000000000000000000000000000000",
//   1200,
//   22
// );
// console.log((await vpp.numBatteries.call()).toNumber());

// batt = await vpp.getBattery.call(1);
// console.log(batt.capacity.toNumber());
// console.log(batt.currentFilled.toNumber());
// console.log(batt.dateAdded.toNumber());
// console.log(batt.cost.toNumber());
// console.log(batt.serialNumber);
// console.log(batt.priceThreshold.toNumber());
// console.log(batt.chargeRate.toNumber());
// console.log(batt.isActive);
// console.log(batt.mapIndex.toNumber());
