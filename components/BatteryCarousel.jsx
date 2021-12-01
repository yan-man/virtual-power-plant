import React, { Component } from "react";
import Carousel from "react-bootstrap/Carousel";

class BatteryList extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div id="battTemplate">
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="panel panel-default panel-pet">
              {this.props.batteries.map((batt) => {
                return (
                  <React.Fragment>
                    <div className="panel-heading">
                      <h3 className="panel-title">
                        {
                          <React.Fragment>
                            <div className="panel-heading">
                              <h3 className="panel-title">{batt.name}</h3>
                            </div>
                            <div className="panel-body">
                              <strong>Serial Number</strong>:{" "}
                              <span className="battery-serialNumber">
                                {batt.serialNumber}
                              </span>
                              <br />
                              <strong>Capacity</strong>:{" "}
                              <span className="battery-capacity">
                                {batt.capacity}
                              </span>{" "}
                              MWh
                              <br />
                              <strong className="battery-currentFilledTitle">
                                Current Filled
                              </strong>
                              :{" "}
                              <span className="battery-currentFilled">
                                {batt.currentFilled}
                              </span>{" "}
                              MWh
                              <br />
                              <strong>Cost</strong>:{" "}
                              <span className="battery-cost">{batt.cost}</span>{" "}
                              Eth
                              <br />
                              <strong>Price Threshold</strong>:{" "}
                              <span className="battery-priceThreshold">
                                {batt.priceThreshold}
                              </span>{" "}
                              Eth/kWh
                              <br />
                              <strong>Charge Rate</strong>:{" "}
                              <span className="battery-chargeRate">
                                {batt.chargeRate}
                              </span>{" "}
                              MWh/hr
                              <br />
                              <br />
                              <button
                                className="btn-add-battery"
                                type="button"
                                data-id="0"
                              >
                                Add to array
                              </button>
                            </div>
                          </React.Fragment>
                        }
                      </h3>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
        <Carousel>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="holder.js/800x400?text=First slide&bg=373940"
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>First slide label</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="holder.js/800x400?text=Second slide&bg=282c34"
              alt="Second slide"
            />

            <Carousel.Caption>
              <h3>Second slide label</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="holder.js/800x400?text=Third slide&bg=20232a"
              alt="Third slide"
            />

            <Carousel.Caption>
              <h3>Third slide label</h3>
              <p>
                Praesent commodo cursus magna, vel scelerisque nisl consectetur.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </React.Fragment>
    );
  }
}

export default BatteryList;
