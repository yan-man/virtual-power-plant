const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");
// set to true to log detailed test results
const showConsoleLog = true;

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
    { investor: accounts[2], amount: 10e14 },
    { investor: accounts[3], amount: 15e14 },
    { investor: accounts[4], amount: 5e14 },
    { investor: accounts[5], amount: 8e14 },
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
    const investmentPercentage =
      await contracts.BatteryInvestment.deployed.investmentPercentage.call();
    const numInvestorsWithdraw =
      await contracts.BatteryInvestment.deployed.numInvestorsWithdraw.call();
    // set from vpp contract
    const dividendPercentage =
      await contracts.BatteryInvestment.deployed.dividendPercentage.call();

    const expectedInvestmentPercentage = 3;
    const expectedNumInvestorsWithdraw = 0;
    const expectedDividendPercentage = 1;

    assert.equal(
      investmentPercentage,
      expectedInvestmentPercentage,
      "investmentPercentage incorrect"
    );
    assert.equal(
      numInvestorsWithdraw,
      expectedNumInvestorsWithdraw,
      "numInvestorsWithdraw incorrect"
    );
    assert.equal(
      dividendPercentage,
      expectedDividendPercentage,
      "dividendPercentage incorrect"
    );

    if (showConsoleLog) {
      console.log("investmentPercentage: ", investmentPercentage.toString());
      console.log("numInvestorsWithdraw: ", numInvestorsWithdraw.toString());
      console.log("dividendPercentage: ", dividendPercentage.toString());
    }
  });

  it("...check BatteryInvestment updateRemainingInvestment", async () => {
    const updateValueAmount = 4.5e12;
    const updateRemainingInvestmentTx =
      await contracts.BatteryInvestment.deployed.updateRemainingInvestment(
        updateValueAmount
      );

    // expecting tx obj returned
    assert.equal(typeof updateRemainingInvestmentTx, "object");

    const remainingInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();

    assert.equal(remainingInvestment, updateValueAmount);

    if (showConsoleLog) {
      console.log("updateRemainingInvestmentTx: ", updateRemainingInvestmentTx);
      console.log("remainingInvestment: ", remainingInvestment.toString());
    }

    // reset back to 0
    await contracts.BatteryInvestment.deployed.updateRemainingInvestment(0);
  });

  it("...check BatteryInvestment investMoney & getInvestorInvestment", async () => {
    let expectedTotalInvested =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();

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
        expectedTotalInvested = expectedTotalInvested.add(
          new web3.utils.BN(investment.amount)
        );

        // investor list should be updated
        let currInvestor =
          await contracts.BatteryInvestment.deployed.investorsList.call(index);
        investorList.push(currInvestor);
        assert.equal(currInvestor, investment.investor);

        // individual investor investment amt should be updated
        let investorAmount =
          await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
            investment.investor,
            0
          );
        assert.equal(investorAmount, investment.amount);
      })
    );

    let remainingInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();
    assert.equal(
      remainingInvestment.toString(),
      expectedTotalInvested.toString()
    );

    // for one of the investors, create a second investment
    // check that indexed investorList is working properly
    const secondInvestmentAmount = investments[2].amount * 2;
    let investMoneyTx = await contracts.BatteryInvestment.deployed.investMoney({
      from: investments[2].investor,
      value: secondInvestmentAmount,
    });
    // expecting tx obj returned
    assert.equal(typeof investMoneyTx, "object");
    let getSecondInvestment =
      await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
        investments[2].investor,
        1
      );
    assert.equal(secondInvestmentAmount, getSecondInvestment);

    // check remainingInvestment again
    expectedTotalInvested = expectedTotalInvested.add(
      new web3.utils.BN(secondInvestmentAmount)
    );
    remainingInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();
    assert.equal(
      remainingInvestment.toString(),
      expectedTotalInvested.toString()
    );

    if (showConsoleLog) {
      console.log("remainingInvestment: ", remainingInvestment.toString());
      console.log("investorList: ", investorList);
      console.log(
        "second investment from ",
        investments[2].investor,
        ": ",
        getSecondInvestment.toString()
      );
    }
  });

  it("...check BatteryInvestment triggerDividend", async () => {
    let initialInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();

    // for one of the investors, create an investment
    let investMoneyTx = await contracts.BatteryInvestment.deployed.investMoney({
      from: investments[2].investor,
      value: investments[2].amount,
    });
    // expecting tx obj returned
    assert.equal(typeof investMoneyTx, "object", "expect completed tx");

    let remainingInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();

    const totalExpectedDividend = remainingInvestment.div(
      new web3.utils.BN(100)
    );
    await contracts.BatteryInvestment.deployed.triggerDividend();
    const totalCurrentDividend =
      await contracts.BatteryInvestment.deployed.pendingTotalWithdrawals.call(
        0
      );

    assert.equal(
      totalExpectedDividend.toString(),
      totalCurrentDividend.toString(),
      "expect dividend matches expected"
    );

    const finalInvestment =
      await contracts.BatteryInvestment.deployed.remainingInvestment.call();

    assert.equal(
      remainingInvestment.sub(totalCurrentDividend).toString(),
      finalInvestment.toString(),
      "expect dividend matches calculated"
    );

    const totalInvestment =
      await contracts.BatteryInvestment.deployed.totalInvestment.call();

    assert.equal(
      remainingInvestment,
      totalInvestment.toString(),
      "expect totalInvestment matches initial investment pre-dividend"
    );

    if (showConsoleLog) {
      console.log("totalCurrentDividend: ", totalCurrentDividend.toString());
      console.log("finalInvestment: ", finalInvestment.toString());
    }
  });

  // it("...check BatteryInvestment addPendingWithdrawals", async () => {
  //   const totalInvestment = (
  //     await contracts.BatteryInvestment.deployed.totalInvestment.call()
  //   );
  //   const totalCurrentDividend = (
  //     await contracts.BatteryInvestment.deployed.pendingTotalWithdrawals.call(0)
  //   );

  //   // calculate expected user dividend matches
  //   const numInvestments = (
  //     await contracts.BatteryInvestment.deployed.getNumInvestorInvestment.call(
  //       investments[2].investor
  //     )
  //   );

  //   userTotalInvested = 0;
  //   for (let ind = 0; ind < numInvestments; ind++) {
  //     let tempInvestment = (
  //       await contracts.BatteryInvestment.deployed.getInvestorInvestment.call(
  //         investments[2].investor,
  //         ind
  //       )
  //     );
  //     userTotalInvested = userTotalInvested + tempInvestment;
  //   }

  //   const expectedDividendPercentage = userTotalInvested / totalInvestment;
  //   const expectedUserDividend =
  //     expectedDividendPercentage * totalCurrentDividend;

  //   const userDividend = (
  //     await contracts.BatteryInvestment.deployed.addPendingWithdrawals.call(
  //       investments[2].investor
  //     )
  //   ).toNumber();
  //   assert.equal(userDividend, expectedUserDividend);

  //   // invoke addPendingWithdrawals tx
  //   await contracts.BatteryInvestment.deployed.addPendingWithdrawals(
  //     investments[2].investor
  //   );

  //   const pendingWithdrawal = (
  //     await contracts.BatteryInvestment.deployed.getPendingWithdrawal(
  //       investments[2].investor
  //     )
  //   ).toNumber();

  //   assert.equal(userDividend, pendingWithdrawal);

  //   if (showConsoleLog) {
  //     console.log("userDividend: ", userDividend);
  //     console.log("pendingWithdrawal: ", pendingWithdrawal);
  //   }
  // });

  // it("...check BatteryInvestment withdraw", async () => {
  //   let balance1 = await web3.eth.getBalance(investments[2].investor);

  //   await contracts.BatteryInvestment.deployed.getPendingWithdrawal(
  //     investments[2].investor
  //   );

  //   // trigger a withdrawal
  //   await contracts.BatteryInvestment.deployed.withdraw({
  //     from: investments[2].investor,
  //   });
  //   let balance2 = await web3.eth.getBalance(investments[2].investor);

  //   // pending withdrawal should then be empty
  //   const pendingWithdrawal =
  //     await contracts.BatteryInvestment.deployed.getPendingWithdrawal(
  //       investments[2].investor
  //     );
  //   // assert.equal(pendingWithdrawal, 0);

  //   console.log(pendingWithdrawal.add(new web3.utils.BN(10)).toNumber());
  //   console.log(balance2 - balance1);

  //   if (showConsoleLog) {
  //     console.log("pendingWithdrawal: ", pendingWithdrawal);
  //   }
  // });
});
