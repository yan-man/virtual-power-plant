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
    // console.log(this.Web3Contracts);
    // console.log(event)
    // this.Web3Contracts.addBattery(event);
  };
  render() {
    return (
      <React.Fragment>
        <Row className={styles.carousel}>
          <Carousel interval={null}>
            {this.props.batteries.map((battery, ind) => {
              return (
                <Carousel.Item key={ind}>
                  <img
                    className="d-block w-25"
                    src="noun_Battery_1582411.png"
                    alt="Second slide"
                  />
                  <Carousel.Caption>
                    <h4>{battery.name}</h4>
                    <p>Battery Capacity: {battery.capacity} MWh</p>
                    <p>Current Amount Filled: {battery.currentFilled} MWh</p>
                    <p>Battery Cost: {battery.cost} Eth</p>
                    <p>Price Threshold: {battery.priceThreshold} Eth/kWh</p>
                    <p>Charge Rate: {battery.chargeRate} MWh/hr</p>
                    <button
                      className="btn-add-battery"
                      type="button"
                      data-id="0"
                      value={battery}
                      onClick={() => {
                        this.handleAddBattery(battery);
                      }}
                    >
                      Add to array
                    </button>
                  </Carousel.Caption>
                </Carousel.Item>
              );
            })}
          </Carousel>
        </Row>
      </React.Fragment>
    );
  }
}

export default BatteryCarousel;
