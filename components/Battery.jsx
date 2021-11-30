import React, { Component } from "react";

class Battery extends Component {
  render() {
    return (
      <React.Fragment>
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-sm-8 col-sm-push-2">
              <h1 class="text-center">Virtual Power Plant as</h1>
              <hr />
              <br />
            </div>
          </div>

          <div class="container">
            <div class="row">
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
            <div class="row">
              <div>
                <h3 id="contractDeployed"></h3>
                <h3>
                  Step 1: Invest some amount of Eth into the investment fund
                  (sufficient to purchase a battery). (Click "Invest")
                </h3>
                <div class="row">
                  <div>
                    <button class="btn-invest" type="button">
                      Invest
                    </button>
                    <input class="investmentAmount" placeholder="[Eth]"></input>
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
                <div id="batteryRow" class="row"></div>
                <h3>
                  Step 3: Charge or discharge batteries based on the current
                  price of electricity (Click "Execute Energy Transaction")
                </h3>
                <h4>
                  Battery currentFilled value will change by the battery's
                  charge rate
                </h4>
                <div class="row">
                  <div>
                    <button class="btn-check-energy" type="button">
                      Execute Energy Transactions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>

        <div id="battTemplate">
          <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="panel panel-default panel-pet">
              <div class="panel-heading">
                <h3 class="panel-title">battery title</h3>
              </div>
              <div class="panel-body">
                <strong>Serial Number</strong>:{" "}
                <span class="battery-serialNumber">abcd</span>
                <br />
                <strong>Capacity</strong>:{" "}
                <span class="battery-capacity">100</span> MWh
                <br />
                <strong class="battery-currentFilledTitle">
                  Current Filled
                </strong>
                : <span class="battery-currentFilled">80</span> MWh
                <br />
                <strong>Cost</strong>: <span class="battery-cost">80</span> Eth
                <br />
                <strong>Price Threshold</strong>:{" "}
                <span class="battery-priceThreshold">Warren, MI</span> Eth/kWh
                <br />
                <strong>Charge Rate</strong>:{" "}
                <span class="battery-chargeRate">5</span> MWh/hr
                <br />
                <br />
                <button class="btn-add-battery" type="button" data-id="0">
                  Add to array
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Battery;
