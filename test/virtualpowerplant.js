const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");

contract('VirtualPowerPlant', function(accounts) {

    beforeEach(async () => {
        VirtualPowerPlantInstance = await VirtualPowerPlant.deployed()
    })

    it("...check VirtualPowerPlant owner address is correct", function() {
        return VirtualPowerPlantInstance.owner();
    }).then(function(virtualPowerPlantOwner) {
        assert.equal(accounts[0], virtualPowerPlantOwner, "Owner address does not match acounts[0] from ganache");
    });

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

  it("...check deployed Battery Investment Contract", async () => {
      // let batteryInvestment = await BatteryInvestment.deployed();
      // let virtualPowerPlant = await VirtualPowerPlant.deployed();
      // const batteryInvestment = await BatteryInvestment.at(virtualPowerPlant.batteryInvestmentAddress());

      // assert(virtualPowerPlant.batteryInvestmentAddress(), virtualPowerPlant.batteryInvestmentContract().address, "addresses match");

      let owner = await virtualPowerPlant.owner();
      let vplant = await (virtualPowerPlant.batteryInvestmentContract());

      const bi = await BatteryInvestment.at(vplant);
      let test = await bi.totalInvestment();

      // let instance = await BatteryInvestment.deployed();

      // let next = await vplant.virtualPowerPlantAddress();

      // emit LogNew(vplant.address);

      // assert(owner, next, "addresses match");

      // return virtualPowerPlant.batteryInvestmentAddress();
      new Promise(() => console.log(test))
      // new Promise(() => console.log(vplant))

  });

});
//
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
