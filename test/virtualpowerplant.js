const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

contract('VirtualPowerPlant', function(accounts) {

    const virtualPowerPlantOwner = accounts[0];
    const virtualPowerPlantAdmin = accounts[1];
    const investor1 = accounts[2];
    const investor2 = accounts[3];

    let investmentAmount1 = 100;
    let investmentAmount2 = 150;


    // DONE:

  // it("...check VirtualPowerPlant owner address is correct", function() {
  //   return VirtualPowerPlant.deployed().then(function(instance) {
  //     virtualPowerPlant = instance;
  //     return virtualPowerPlant.owner();
  //     }).then(function(virtualPowerPlantOwner) {
  //         assert.equal(accounts[0], virtualPowerPlantOwner, "Owner address does not match acounts[0] from ganache");
  //       });
  // });

  beforeEach(async () => {
      virtualPowerPlant = await VirtualPowerPlant.deployed();
      batteryInvestmentAddress = await (virtualPowerPlant.batteryInvestmentContract());
      batteryEnergyAddress = await (virtualPowerPlant.batteryEnergyContract());
      batteryInvestmentContract = await BatteryInvestment.at(batteryInvestmentAddress);
      batteryEnergyContract = await BatteryEnergy.at(batteryEnergyAddress);
  })

  // DONE

  // it("...check VirtualPowerPlant owner address is correct", async() => {
  //     virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner();
  //     new Promise(() => console.log("VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck));
  //     assert.equal(virtualPowerPlantOwner, virtualPowerPlantOwnerCheck, "Owner address does not match acounts[0] from ganache");
  // });
  //
  // it("...check BatteryInvestment contract is deployed", async() => {
  //     let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
  //     new Promise(() => console.log("BatteryInvestment address: " + batteryInvestmentAddress));
  //     assert.equal(batteryInvestmentAddress, batteryInvestmentAddressCheck, "BatteryInvestment address doesn't match");
  // });
  //
  // it("...check BatteryEnergy contract is deployed", async() => {
  //     let batteryEnergyAddressCheck = await batteryEnergyContract.address;
  //     new Promise(() => console.log("BatteryEnergy address: " + batteryEnergyAddress));
  //     assert.equal(batteryEnergyAddress, batteryEnergyAddressCheck, "BatteryEnergy address doesn't match");
  // });

  it("...check BatteryInvestment multiple investments from investor1 and investor2", async() => {
      await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount1});
      await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount2});
      await batteryInvestmentContract.investMoney({from: investor2, value: investmentAmount2});
      let totalInvestment = await batteryInvestmentContract.totalInvestment();
      checkInvestment = (investmentAmount1 + investmentAmount2 + investmentAmount2);
      new Promise(() => console.log("totalInvestment: " + totalInvestment));
      assert.equal(totalInvestment, checkInvestment, "Investment amount is incorrect");
  });

  it("...check set Admin", async() => {
      await virtualPowerPlant.changeAdmin(virtualPowerPlantAdmin, true, {from: virtualPowerPlantOwner});
      let adminsNum = await virtualPowerPlant.numAdmins();
      adminNumCheck = 1;
      assert.equal(adminsNum, adminNumCheck, "Admin was not added properly");
  });

  it("...check add 5 batteries to virtualPowerPlant", async() => {
      await virtualPowerPlant.addBattery(100, 20, 13, "0x12", 7, 4, {from: virtualPowerPlantAdmin});
      await virtualPowerPlant.addBattery(110, 25, 12, "0x12", 3, 6, {from: virtualPowerPlantOwner});
      await virtualPowerPlant.addBattery(90, 22, 11, "0x12", 5, 8, {from: virtualPowerPlantOwner});
      await virtualPowerPlant.addBattery(80, 30, 10, "0x12", 4, 10, {from: virtualPowerPlantOwner});
      await virtualPowerPlant.addBattery(70, 26, 9, "0x12", 3, 11, {from: virtualPowerPlantOwner});
      let numBatteries = await virtualPowerPlant.numBatteries();
      new Promise(() => console.log("numBatteries: " + numBatteries));
      let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
      new Promise(() => console.log("remainingInvestment: " + remainingInvestment));
      assert.equal(numBatteries, 5, "Batteries not added properly");
  });

  it("...decommission battery to virtualPowerPlant", async() => {
      let removeIndex = 2;
      let numBatteries1 = await virtualPowerPlant.numBatteries();
      await virtualPowerPlant.decommissionBattery(removeIndex, {from: virtualPowerPlantOwner});
      let numBatteries2 = await virtualPowerPlant.numBatteries();
      new Promise(() => console.log("numBatteries went from: " + numBatteries1 + " to " + numBatteries2));
      let newMapIndex = await virtualPowerPlant.getBatteryMapIndex(numBatteries2);
      new Promise(() => console.log("newMapIndex of the last element in Batteries array, replacing the decommissioned index at " + removeIndex + ": " + newMapIndex));

      // let newBatteryMapping = await virtualPowerPlant.batteryMapping(removeIndex);
      // assert.equal(newBatteryMapping, numBatteries2, "Index of the item moved should be the last element in the batt array");

      new Promise(() => console.log("newBatteryMapping: " + newBatteryMapping));
      assert.equal(removeIndex, newMapIndex, "The index removed should match the updated map index of the last element");
  });

  it("...charge array of batteries", async() => {

      let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
      new Promise(() => console.log("remainingInvestment: " + remainingInvestment));

      batteryCapacityRemaining11 = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining1: " + batteryCapacityRemaining11));

      batteryCapacityRemaining12 = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining1: " + batteryCapacityRemaining12));

      batteryCapacityRemaining13 = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining1: " + batteryCapacityRemaining13));

      batteryCapacityRemaining14 = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining1: " + batteryCapacityRemaining14));

      batteryCapacityRemaining15 = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining1: " + batteryCapacityRemaining15));

      checkBatteryEnergyTX = await batteryEnergyContract.checkBatteryEnergy({from: virtualPowerPlantAdmin});
      // new Promise(() => console.log(checkBatteryEnergyTX));

      let remainingInvestment2 = await batteryInvestmentContract.remainingInvestment();
      new Promise(() => console.log("remainingInvestment: " + remainingInvestment2));

      batteryCapacityRemaining21 = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining2: " + batteryCapacityRemaining21));

      batteryCapacityRemaining22 = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining2: " + batteryCapacityRemaining22));

      batteryCapacityRemaining23 = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining2: " + batteryCapacityRemaining23));

      batteryCapacityRemaining24 = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining2: " + batteryCapacityRemaining24));

      batteryCapacityRemaining25 = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
      new Promise(() => console.log("batteryCapacityRemaining2: " + batteryCapacityRemaining25));

      numBatts = await virtualPowerPlant.numBatteries();
      new Promise(() => console.log("numBatts: " + numBatts));
      // assert.equal(removeIndex, newMapIndex, "The index removed should match the updated map index of the last element");
  });

  // it("...trigger dividend", async() => {
  //     await batteryInvestmentContract.investMoney({from: investor2, value: investmentAmount2});
  // });









  // it("...check BatteryInvestment contract is deployed", function() {
  //   return VirtualPowerPlant.deployed().then(function(instance) {
  //     virtualPowerPlant = instance;
  //     return virtualPowerPlant.owner();
  //     }).then(function(virtualPowerPlantOwner) {
  //         assert.equal(accounts[0], virtualPowerPlantOwner, "Owner address does not match acounts[0] from ganache");
  //       });
  // });










  // it("...check deployed Battery Investment Contract", function() {
  //   return VirtualPowerPlant.deployed().then(function(instance) {
  //       let batteryInvestmentAddress;
  //       let batteryInvestmentAddressCheck;
  //
  //     virtualPowerPlant = instance;
  //     return virtualPowerPlant.batteryInvestmentAddress();
  //     }).then(function(batteryInvestmentAddress) {
  //         return batteryInvestmentAddressCheck;
  //     }).then(function(batteryInvestmentAddressCheck) {
  //         assert.equal(batteryInvestmentAddressCheck, batteryInvestmentAddress, "BI address is incorrect");
  //       });
  // });

  // it("...check deployed Battery Investment Contract", async () => {
  //     // let batteryInvestment = await BatteryInvestment.deployed();
  //     // let virtualPowerPlant = await VirtualPowerPlant.deployed();
  //     // const batteryInvestment = await BatteryInvestment.at(virtualPowerPlant.batteryInvestmentAddress());
  //
  //     // assert(virtualPowerPlant.batteryInvestmentAddress(), virtualPowerPlant.batteryInvestmentContract().address, "addresses match");
  //
  //     let owner = await virtualPowerPlant.owner();
  //     let vplant = await (virtualPowerPlant.batteryInvestmentContract());
  //
  //     const bi = await BatteryInvestment.at(vplant);
  //     let test = await bi.totalInvestment();
  //
  //     // let instance = await BatteryInvestment.deployed();
  //
  //     // let next = await vplant.virtualPowerPlantAddress();
  //
  //     // emit LogNew(vplant.address);
  //
  //     // assert(owner, next, "addresses match");
  //
  //     // return virtualPowerPlant.batteryInvestmentAddress();
  //     new Promise(() => console.log(test))
  //     // new Promise(() => console.log(vplant))
  //
  // });

});





// var A = artifacts.require("./A.sol");
// var B = artifacts.require("./B.sol");
// contract('A', (accounts) => {
//     it("Value should be 5", async () => {
//         let instanceOfA = await A.deployed()
//         let resultTx = await instanceOfA.createB({ from: accounts[0] });
//         console.log("Address of B: " + resultTx.logs[0].args.addressOfB);
//
//         let instanceOfB = await B.at(resultTx.logs[0].args.addressOfB);
//
//     })
// })


// const SimpleStorage = artifacts.require("./SimpleStorage.sol");
// const MetaCoin = artifacts.require("MetaCoin");
//
// contract('SimpleStorage', function(accounts) {
//
//   it("...should store the value 89.", function() {
//     return SimpleStorage.deployed().then(function(instance) {
//       simpleStorageInstance = instance;
//
//       return simpleStorageInstance.set(89, {from: accounts[0]});
//     }).then(function() {
//       return simpleStorageInstance.get.call();
//     }).then(function(storedData) {
//       assert.equal(storedData, 89, "The value 89 was not stored.");
//     });
//   });
//
// });
//
// contract("MetaCoin", accounts => {
//   it("should put 10000 MetaCoin in the first account", () =>
//     MetaCoin.deployed()
//       .then(instance => instance.getBalance.call(accounts[0]))
//       .then(balance => {
//         assert.equal(
//           balance.valueOf(),
//           10000,
//           "10000 wasn't in the first account"
//         );
//       }));
//
//   it("should call a function that depends on a linked library", () => {
//     let meta;
//     let metaCoinBalance;
//     let metaCoinEthBalance;
//
//     return MetaCoin.deployed()
//       .then(instance => {
//         meta = instance;
//         return meta.getBalance.call(accounts[0]);
//       })
//       .then(outCoinBalance => {
//         metaCoinBalance = outCoinBalance.toNumber();
//         return meta.getBalanceInEth.call(accounts[0]);
//       })
//       .then(outCoinBalanceEth => {
//         metaCoinEthBalance = outCoinBalanceEth.toNumber();
//       })
//       .then(() => {
//         assert.equal(
//           metaCoinEthBalance,
//           2 * metaCoinBalance,
//           "Library function returned unexpected function, linkage may be broken"
//         );
//       });
//   });
//
//   it("should send coin correctly", () => {
//     let meta;
//
//     // Get initial balances of first and second account.
//     const account_one = accounts[0];
//     const account_two = accounts[1];
//
//     let account_one_starting_balance;
//     let account_two_starting_balance;
//     let account_one_ending_balance;
//     let account_two_ending_balance;
//
//     const amount = 10;
//
//     return MetaCoin.deployed()
//       .then(instance => {
//         meta = instance;
//         return meta.getBalance.call(account_one);
//       })
//       .then(balance => {
//         account_one_starting_balance = balance.toNumber();
//         return meta.getBalance.call(account_two);
//       })
//       .then(balance => {
//         account_two_starting_balance = balance.toNumber();
//         return meta.sendCoin(account_two, amount, { from: account_one });
//       })
//       .then(() => meta.getBalance.call(account_one))
//       .then(balance => {
//         account_one_ending_balance = balance.toNumber();
//         return meta.getBalance.call(account_two);
//       })
//       .then(balance => {
//         account_two_ending_balance = balance.toNumber();
//
//         assert.equal(
//           account_one_ending_balance,
//           account_one_starting_balance - amount,
//           "Amount wasn't correctly taken from the sender"
//         );
//         assert.equal(
//           account_two_ending_balance,
//           account_two_starting_balance + amount,
//           "Amount wasn't correctly sent to the receiver"
//         );
//       });
//   });
// });
