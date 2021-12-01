import React, { Component } from "react";
import Carousel from "react-bootstrap/Carousel";
import Row from "react-bootstrap/Row";
import Image from "next/image";
import styles from "../styles/BatteryCarousel.module.css";
class BatteryList extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Row className={styles.carousel}>
          <Carousel>
            {this.props.batteries.map((batt) => {
              return (
                <Carousel.Item>
                  <img
                    className="d-block w-50"
                    src="noun_Battery_1582411.png"
                    alt="Second slide"
                  />
                  <Carousel.Caption>
                    <h4>{batt.name}</h4>
                    <p>Battery Capacity: {batt.capacity} MWh</p>
                    <p>Current Amount Filled: {batt.currentFilled} MWh</p>
                    <p>Battery Cost: {batt.cost} Eth</p>
                    <p>Price Threshold: {batt.priceThreshold} Eth/kWh</p>
                    <p>Charge Rate: {batt.chargeRate} MWh/hr</p>
                    <button
                      className="btn-add-battery"
                      type="button"
                      data-id="0"
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

export default BatteryList;
