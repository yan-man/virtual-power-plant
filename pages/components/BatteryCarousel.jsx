import React, { Component } from "react";
import Carousel from "react-bootstrap/Carousel";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import styles from "../../styles/BatteryCarousel.module.css";

// import web3Contracts from "../services/web3Contracts";
class BatteryCarousel extends React.Component {
  Web3Contracts = {};
  componentDidMount = async () => {
    // console.log("use effect; init web3");
    // this.Web3Contracts = new web3Contracts();
    // await this.Web3Contracts.init();
  };
  handleAddBattery = async (event) => {
    this.props.addBattery(event);
  };
  render() {
    const { Web3Contracts, batteries, classType } = this.props;

    return (
      <React.Fragment>
        <Row className={styles[classType]}>
          <Carousel interval={null}>
            {batteries.length > 0 ? (
              batteries.map((battery, ind) => {
                let { serialNumber, cost, priceThreshold } = battery;

                if (Web3Contracts.web3) {
                  serialNumber = Web3Contracts.web3.utils.toAscii(
                    battery.serialNumber
                  );
                  cost = Web3Contracts.web3.utils.fromWei(
                    String(battery.cost),
                    "ether"
                  );
                  priceThreshold = Web3Contracts.web3.utils.fromWei(
                    String(battery.priceThreshold),
                    "ether"
                  );
                }
                return (
                  <Carousel.Item key={ind}>
                    <img
                      className="d-block w-25"
                      src="noun_Battery_1582411.png"
                      alt="Second slide"
                    />
                    <Carousel.Caption>
                      <h4>{battery.name}</h4>
                      <p>Serial Number (string): {serialNumber}</p>
                      {/* <p>Serial Number (bytes32): {battery.serialNumber}</p> */}
                      <p>Battery Capacity: {battery.capacity} MWh</p>
                      <p>Current Amount Filled: {battery.currentFilled} MWh</p>
                      <p>Battery Cost: {cost} eth</p>
                      <p>Price Threshold: {priceThreshold} eth/kWh</p>
                      <p>Charge Rate: {battery.chargeRate} MWh/hr</p>
                      {this.props.addBattery ? (
                        <button
                          className="btn-add-battery"
                          type="button"
                          data-id="0"
                          value={battery}
                          onClick={() => {
                            this.handleAddBattery(ind);
                          }}
                        >
                          Add to array
                        </button>
                      ) : (
                        <React.Fragment></React.Fragment>
                      )}
                    </Carousel.Caption>
                  </Carousel.Item>
                );
              })
            ) : (
              <React.Fragment></React.Fragment>
            )}
          </Carousel>
        </Row>
      </React.Fragment>
    );
  }
}

export default BatteryCarousel;
