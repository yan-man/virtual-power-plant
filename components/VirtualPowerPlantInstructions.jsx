import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import web3Contracts from "../services/web3Contracts";

import ExistingBatteryCarousel from "./ExistingBatteryCarousel";
class VirtualPowerPlantInstructions extends Component {
  state = {
    value: 0.0,
    totalInvestment: 0,
    remainingInvestment: 0,
    numBatteries: 0,
    batteryList: {},
  };
  Web3Contracts = {};
  timerID;
  componentDidMount = async () => {
    console.log("use effect; init web3");
    this.timerID = setInterval(() => this.tick(), 1000);

    this.Web3Contracts = new web3Contracts();
    await this.Web3Contracts.init();
    await this.updateStats();
  };
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  async tick() {
    this.updateBatteryList();
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
    if (this.Web3Contracts.contracts) {
      let totalInvestment =
        await this.Web3Contracts.contracts.BatteryInvestment.methods
          .totalInvestment()
          .call();
      totalInvestment = this.Web3Contracts.web3.utils.fromWei(
        totalInvestment,
        "ether"
      );

      let remainingInvestment =
        await this.Web3Contracts.contracts.BatteryInvestment.methods
          .remainingInvestment()
          .call();
      remainingInvestment = this.Web3Contracts.web3.utils.fromWei(
        remainingInvestment,
        "ether"
      );

      //       let test = await this.Web3Contracts.contracts.VirtualPowerPlant.methods
      //           .batteryInvestmentAddress()
      //           .call();
      //           console.log(test);
      //  let test2 = await this.Web3Contracts.contracts.VirtualPowerPlant.methods
      //           .batteryInvestmentContract()
      //           .call();
      //           console.log(test2);

      // console.log(this.Web3Contracts.contracts.BatteryInvestment.options.address)

      let numBatteries =
        await this.Web3Contracts.contracts.VirtualPowerPlant.methods
          .numBatteries()
          .call();
      this.setState({ totalInvestment, remainingInvestment, numBatteries });
    }
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    await this.Web3Contracts.invest(String(this.state.value));
    await this.updateStats();
  };
  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };
  render() {
    // console.log(this.Web3Contracts);
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h5>Total Amount Invested:</h5>
            <h4>
              <span id="totalInvestment">{this.state.totalInvestment}</span> Eth
            </h4>
          </Col>
          <Col>
            <h5>Remaining Amount Left:</h5>
            <h4>
              <span id="remainingInvestment">
                {this.state.remainingInvestment}
              </span>{" "}
              Eth
            </h4>
          </Col>
          <Col>
            <h5>Number of Batteries:</h5>
            <h4>
              <span id="numBatteries">{this.state.numBatteries}</span>
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
          <form onSubmit={this.handleSubmit}>
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
          </form>
        </Row>
        <Row>
          <h3>Step 2:</h3>
          <p>
            Add one or more batteries to the battery array. Make sure you are in
            the account of the user who has deployed the contract (probably
            accounts[0]) to maintain admin permissions (Click "Add to array")
          </p>
          <p>
            Virtual Power Plant Admin:{" "}
            <span id="owner">
              {this.Web3Contracts.accounts
                ? this.Web3Contracts.accounts[0]
                : ""}
            </span>
          </p>
          <p>
            Virtual Power Plant Contract:{" "}
            <span id="virtualPowerPlantContract">
              {this.Web3Contracts.contracts
                ? this.Web3Contracts.contracts.VirtualPowerPlant.options.address
                : ""}
            </span>
          </p>
          <p>
            Battery Investment Contract:{" "}
            <span id="batteryInvestment">
              {this.Web3Contracts.contracts
                ? this.Web3Contracts.contracts.BatteryInvestment.options.address
                : ""}
            </span>
          </p>
        </Row>
        <Row>{/* <ExistingBatteryCarousel batteries={batteryInfo} /> */}</Row>
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
