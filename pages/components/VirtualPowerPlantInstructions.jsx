import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import web3Contracts from "../api/web3Contracts";

import batteryInfo from "../api/batteries";

import ExistingBatteryCarousel from "./ExistingBatteryCarousel";
import BatteryCarousel from "./BatteryCarousel";
class VirtualPowerPlantInstructions extends Component {
  state = {
    value: 0.0,
    myAddress: "",
    myBalance: 0,
    info: {
      totalInvestment: 0,
      remainingInvestment: 0,
      numBatteries: 0,
    },
    batteryList: {},
    Web3Contracts: {},
  };
  timerID;
  componentDidMount = async () => {
    console.log("componentDidMount; init web3");
    this.timerID = setInterval(() => this.tick(), 3000);

    const Web3Contracts = new web3Contracts();
    await Web3Contracts.init();
    this.setState({
      Web3Contracts,
      myAddress: Web3Contracts.accounts[0],
    });
  };
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  async tick() {
    // console.log("tick");
    // this.updateBatteryList();
    this.updateStats();
  }

  updateBatteryList = async () => {
    if (this.Web3Contracts.contracts) {
      let batteryMapping =
        await this.Web3Contracts.contracts.VirtualPowerPlant.methods
          .getBatteryMapping()
          .call();

      let newBatteryList = await batteryMapping.map(async (batteryId) => {
        let result =
          await this.Web3Contracts.contracts.VirtualPowerPlant.methods
            .getBattery(batteryId)
            .call();
        let newBattery = {
          capacity: result.capacity,
          chargeRate: result.chargeRate,
          cost: result.cost,
          currentFilled: result.currentFilled,
          dateAdded: result.dateAdded,
          isActive: result.isActive,
          mapIndex: result.mapIndex,
          priceThreshold: result.priceThreshold,
          serialNumber: result.serialNumber,
        };
        return newBattery;
      });
      await newBatteryList;
      console.log(newBatteryList);
      // this.setState({batteryList: batteryList})
    }

    //     promiseB = promiseA.then(function(result) {
    //   return result + 1;
    // });
  };

  updateStats = async () => {
    console.log("updateStats");
    const { Web3Contracts } = this.state;
    if (Web3Contracts.contracts) {
      let totalInvestment =
        await Web3Contracts.contracts.BatteryInvestment.deployed.totalInvestment();
      totalInvestment = Web3Contracts.web3.utils.fromWei(
        totalInvestment,
        "ether"
      );
      let remainingInvestment =
        await Web3Contracts.contracts.BatteryInvestment.deployed.remainingInvestment();
      remainingInvestment = Web3Contracts.web3.utils.fromWei(
        remainingInvestment,
        "ether"
      );
      let numBatteries = (
        await Web3Contracts.contracts.VirtualPowerPlant.deployed.numBatteries()
      ).toNumber();

      let myBalance = await Web3Contracts.web3.eth.getBalance(
        this.state.myAddress
      );

      console.log(
        await Web3Contracts.web3.eth.getBalance(
          Web3Contracts.contracts.BatteryInvestment.address
        )
      );

      myBalance = Web3Contracts.web3.utils.fromWei(myBalance, "ether");
      this.setState({
        info: { totalInvestment, remainingInvestment, numBatteries },
        myBalance,
      });
    }
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    await this.state.Web3Contracts.invest(String(this.state.value));
    // await this.updateStats();
  };
  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };
  render() {
    const { Web3Contracts, myBalance, myAddress, info } = this.state;
    return (
      <React.Fragment>
        <Row>
          <p>
            My Address: <span id="owner">{myAddress}</span>
          </p>
        </Row>
        <Row>
          <p>
            My Balance: <span id="">{myBalance} eth</span>
          </p>
        </Row>
        <Row>
          <Col>
            <p>
              Virtual Power Plant Contract Address:{" "}
              <span id="virtualPowerPlantContract">
                {Web3Contracts.contracts
                  ? Web3Contracts.contracts.VirtualPowerPlant.address
                  : ""}
              </span>
            </p>
          </Col>
          <Col>
            <p>
              Battery Investment Contract Address:{" "}
              <span id="batteryInvestment">
                {Web3Contracts.contracts
                  ? Web3Contracts.contracts.BatteryInvestment.address
                  : ""}
              </span>
            </p>
          </Col>
          <Col>
            <p>
              Battery Energy Contract Address:{" "}
              <span id="batteryEnergy">
                {Web3Contracts.contracts
                  ? Web3Contracts.contracts.BatteryEnergy.address
                  : ""}
              </span>
            </p>
          </Col>
        </Row>
        <hr></hr>
        <Row>
          <Col>
            <h5>Total Amount Invested:</h5>
            <h4>
              <span id="totalInvestment">{info.totalInvestment}</span> eth
            </h4>
          </Col>
          <Col>
            <h5>Remaining Amount Left:</h5>
            <h4>
              <span id="remainingInvestment">{info.remainingInvestment}</span>{" "}
              eth
            </h4>
          </Col>
          <Col>
            <h5>Number of Batteries:</h5>
            <h4>
              <span id="numBatteries">{info.numBatteries}</span>
            </h4>
          </Col>
        </Row>
        <Row>
          <h3 id="contractDeployed"></h3>
        </Row>
        <Row>
          <h3>Step 1:</h3>
          <p>
            Invest some amount of Eth into the investment fund (sufficient to
            purchase a battery). (Click "Invest")
          </p>
        </Row>
        <Row>
          <div>
            <button
              className="btn-invest"
              type="button"
              onClick={this.handleSubmit}
            >
              Invest
            </button>
            <input
              onChange={this.handleChange}
              className="investmentAmount"
              placeholder="[Eth]"
              value={this.state.value}
            ></input>
          </div>
        </Row>
        <Row>
          <h3>Step 2:</h3>
          <p>
            Add one or more batteries to the battery array. Make sure you are in
            the account of the user who has deployed the contract (probably
            accounts[0]) to maintain admin permissions (Click "Add to array")
          </p>
        </Row>
        <Row>
          <BatteryCarousel batteries={batteryInfo} />
        </Row>
        <Row>
          <div id="batteryRow" className="row"></div>
          <h3>Step 3:</h3>
          <p>
            Charge or discharge batteries based on the current price of
            electricity (Click "Execute Energy Transaction")
          </p>
          <p>
            Battery currentFilled value will change by the battery's charge rate
          </p>
        </Row>
        <Row>
          <div>
            <button className="btn-check-energy" type="button">
              Execute Energy Transactions
            </button>
          </div>
        </Row>
      </React.Fragment>
    );
  }
}

export default VirtualPowerPlantInstructions;
