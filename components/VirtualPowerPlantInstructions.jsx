import React, { Component } from "react";
import batteryInfo from "../pages/api/batteries";
import Battery from "./BatteryList";

class VirtualPowerPlantInstructions extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="container">
            <div className="row">
              <div>
                <h1>
                  Total Amount Invested: <span id="totalInvestment">0</span> Eth
                </h1>
              </div>
              <div>
                <h2>
                  Remaining Amount Invested:{" "}
                  <span id="remainingInvestment">0</span> Eth
                </h2>
              </div>
              <div>
                <h2>
                  Number of Battery Assets: <span id="numBatteries">0</span>
                </h2>
              </div>
            </div>
            <div className="row">
              <div>
                <h3 id="contractDeployed"></h3>
                <h3>
                  Step 1: Invest some amount of Eth into the investment fund
                  (sufficient to purchase a battery). (Click "Invest")
                </h3>
                <div className="row">
                  <div>
                    <button className="btn-invest" type="button">
                      Invest
                    </button>
                    <input
                      className="investmentAmount"
                      placeholder="[Eth]"
                    ></input>
                  </div>
                </div>
                <h3>
                  Step 2: Add one or more batteries to the battery array. Make
                  sure you are in the account of the user who has deployed the
                  contract (probably accounts[0]) to maintain admin permissions
                  (Click "Add to array")
                </h3>
                <h4>
                  Virtual Power Plant Admin: <span id="owner"></span>
                </h4>
                <div id="batteryRow" className="row"></div>
                <h3>
                  Step 3: Charge or discharge batteries based on the current
                  price of electricity (Click "Execute Energy Transaction")
                </h3>
                <h4>
                  Battery currentFilled value will change by the battery's
                  charge rate
                </h4>
                <div className="row">
                  <div>
                    <button className="btn-check-energy" type="button">
                      Execute Energy Transactions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>

        <Battery batteries={batteryInfo} />
      </React.Fragment>
    );
  }
}

export default VirtualPowerPlantInstructions;
