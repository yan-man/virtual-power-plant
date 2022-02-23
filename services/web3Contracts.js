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
    const VirtualPowerPlant = require("../build/contracts/VirtualPowerPlant.json");
    const BatteryEnergy = require("../build/contracts/BatteryEnergy.json");
    const BatteryInvestment = require("../build/contracts/BatteryInvestment.json");

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

    console.log(this.contracts);
  }

  async initContract() {
    const batteryInvestment = require("../build/contracts/BatteryInvestment.json");
    const batteryEnergy = require("../build/contracts/BatteryEnergy.json");
    const virtualPowerPlant = require("../build/contracts/VirtualPowerPlant.json");

    const netid = await this.web3.eth.net.getId();

    this.contracts.VirtualPowerPlant = new this.web3.eth.Contract(
      virtualPowerPlant.abi,
      virtualPowerPlant.networks[netid].address
    );

    const batteryInvestmentAddress =
      await this.contracts.VirtualPowerPlant.methods
        .batteryInvestmentAddress()
        .call();

    const batteryEnergyAddress = await this.contracts.VirtualPowerPlant.methods
      .batteryEnergyAddress()
      .call();

    this.contracts.BatteryInvestment = new this.web3.eth.Contract(
      batteryInvestment.abi,
      batteryInvestmentAddress
    );

    this.contracts.BatteryEnergy = new this.web3.eth.Contract(
      batteryEnergy.abi,
      batteryEnergyAddress
    );

    // console.log(this.accounts[0]);
    await this.contracts.BatteryInvestment.methods.investMoney().send({
      from: this.accounts[0],
      value: this.web3.utils.toWei("0.2", "ether"),
    });

    // console.log(asdf);
    // const yan = await this.contracts.VirtualPowerPlant.methods
    //   .getAdmin()
    //   .call();

    // const batchProcess = await this.contracts.BatteryEnergy.methods
    //   .batchProcess()
    //   .call();

    // console.log(batchProcess);
  }

  async invest(amount) {
    await this.contracts.BatteryInvestment.methods.investMoney({
      from: this.accounts[0],
      value: this.web3.utils.toWei(amount, "ether"),
    });
  }

  async addBattery(battery) {
    const batteryId = await this.contracts.VirtualPowerPlant.methods
      .addBattery(
        battery.capacity,
        battery.currentFilled,
        this.web3.utils.toWei(battery.cost, "ether"),
        battery.serialNumber,
        battery.priceThreshold,
        battery.chargeRate
      )
      .send({
        from: this.accounts[0],
      });

    let numBatteries = await this.contracts.VirtualPowerPlant.methods
      .numBatteries()
      .call();

    let remaining = await this.contracts.BatteryInvestment.methods
      .remainingInvestment()
      .call();

    // console.log(numBatteries);
    // console.log(remaining);

    // for (let i = 0; i <= numBatteries; i++) {
    //   console.log(i);
    // }
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
