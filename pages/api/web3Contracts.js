const Web3 = require("web3");
const contract = require("@truffle/contract");

class web3Contracts {
  web3 = null;
  web3Provider = null;
  contracts = {};
  accounts = [];

  init = async () => {
    await this.initWeb3();
    await this.initAccounts();
  };
  constructor() {}

  async initWeb3() {
    console.log("initWeb3");
    let web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    } // Legacy dapp browsers...
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }

    this.web3Provider = web3Provider;
    this.web3 = new Web3(web3Provider);

    await this.initAccounts();
    await this.initContractTruffle();
  }

  async initAccounts() {
    this.accounts = await this.web3.eth.getAccounts();
    // console.log(await this.web3.eth.getBalance(this.accounts[0]));
  }

  async initContractTruffle() {
    const VirtualPowerPlant = require("../../build/contracts/VirtualPowerPlant.json");
    const BatteryEnergy = require("../../build/contracts/BatteryEnergy.json");
    const BatteryInvestment = require("../../build/contracts/BatteryInvestment.json");

    this.contracts.VirtualPowerPlant = {
      contract: contract(VirtualPowerPlant),
    };
    this.contracts.BatteryInvestment = {
      contract: contract(BatteryInvestment),
    };
    this.contracts.BatteryEnergy = { contract: contract(BatteryEnergy) };

    this.contracts.VirtualPowerPlant.contract.setProvider(this.web3Provider);
    this.contracts.BatteryInvestment.contract.setProvider(this.web3Provider);
    this.contracts.BatteryEnergy.contract.setProvider(this.web3Provider);

    this.contracts.VirtualPowerPlant.deployed =
      await this.contracts.VirtualPowerPlant.contract.deployed();
    this.contracts.VirtualPowerPlant.address =
      await this.contracts.VirtualPowerPlant.deployed.virtualPowerPlantAddress();

    this.contracts.BatteryInvestment.address =
      await this.contracts.VirtualPowerPlant.deployed.batteryInvestmentAddress();

    this.contracts.BatteryEnergy.address =
      await this.contracts.VirtualPowerPlant.deployed.batteryEnergyAddress();

    this.contracts.BatteryInvestment.deployed =
      await this.contracts.BatteryInvestment.contract.at(
        this.contracts.BatteryInvestment.address
      );
    this.contracts.BatteryEnergy.deployed =
      await this.contracts.BatteryEnergy.contract.at(
        this.contracts.BatteryEnergy.address
      );
  }

  async invest(amount) {
    try {
      await this.contracts.BatteryInvestment.deployed.investMoney({
        from: this.accounts[0],
        value: this.web3.utils.toWei(amount, "ether"),
      });
    } catch (e) {
      console.log("error", e);
    }
  }

  async addBattery(battery) {
    try {
      await this.contracts.VirtualPowerPlant.deployed.addBattery(
        battery.capacity,
        battery.currentFilled,
        String(battery.cost),
        battery.serialNumber,
        battery.priceThreshold,
        battery.chargeRate,
        {
          from: this.accounts[0],
        }
      );

      return true;
    } catch (err) {
      console.log(err);
    }
  }

  async getBattery(index) {
    try {
      const {
        capacity,
        chargeRate,
        cost,
        currentFilled,
        dateAdded,
        isActive,
        mapIndex,
        priceThreshold,
        serialNumber,
      } = await this.contracts.VirtualPowerPlant.deployed.getBattery(index);
      const battery = {
        capacity: capacity.toString(),
        currentFilled: currentFilled.toString(),
        cost: cost.toString(),
        serialNumber: serialNumber, // add1
        priceThreshold: priceThreshold.toString(),
        chargeRate: chargeRate.toString(),
      };
      return battery;
    } catch (err) {
      console.log(err);
    }
  }
  async getBatteryInvestmentAddress() {
    try {
      const batteryInvestmentAddress =
        await this.contracts.VirtualPowerPlant.methods
          .batteryInvestmentAddress()
          .call();
      // console.log(batteryInvestmentAddress);
      return batteryInvestmentAddress;
    } catch (err) {
      console.log(err);
    }
  }

  //   async labelBatteriesAdded() {
  //     let contractInstance;

  //     const val = await this.contracts.VirtualPowerPlant.methods
  //       .batteryInvestmentAddress()
  //       .call();
  //     console.log(val);
  //     // this.contracts.VirtualPowerPlant.deployed()
  //     //   .then(function (instance) {
  //     //     contractInstance = instance;

  //     //     return contractInstance.batteryInvestmentAddress.call();
  //     //   })
  //     //   // .then(function (adopters) {
  //     //   //   for (i = 0; i < adopters.length; i++) {
  //     //   //     if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
  //     //   //       $(".panel-pet")
  //     //   //         .eq(i)
  //     //   //         .find("button")
  //     //   //         .text("Success")
  //     //   //         .attr("disabled", true);
  //     //   //     }
  //     //   //   }
  //     //   // })
  //     //   .catch(function (err) {
  //     //     console.log(err.message);
  //     //   });
  //   }
}

module.exports = web3Contracts;
