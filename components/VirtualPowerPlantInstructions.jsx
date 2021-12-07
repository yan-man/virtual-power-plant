import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

class VirtualPowerPlantInstructions extends Component {
  render() {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h5>Total Amount Invested:</h5>
            <h4>
              <span id="totalInvestment">0</span> Eth
            </h4>
          </Col>
          <Col>
            <h5>Remaining Amount Invested:</h5>
            <h4>
              <span id="remainingInvestment">0</span> Eth
            </h4>
          </Col>
          <Col>
            <h5>Number of Battery Assets:</h5>
            <h4>
              <span id="numBatteries">0</span>
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
            <button className="btn-invest" type="button">
              Invest
            </button>
            <input
              type="number"
              name="investmentAmount"
              className="investmentAmount"
              placeholder="[Eth]"
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
          <p>
            Virtual Power Plant Admin: <span id="owner"></span>
          </p>
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
