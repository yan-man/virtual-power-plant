// sample batteries array to add to VPP
let batteries = [
  {
    name: "battery1",
    capacity: 100,
    currentFilled: 20,
    cost: 13e16,
    serialNumberBytes32: 0x6164643100000000000000000000000000000000000000000000000000000000, // add1
    serialNumber:
      "0x6164643100000000000000000000000000000000000000000000000000000000", // add1
    priceThreshold: 7e14,
    chargeRate: 4,
  },
  {
    name: "battery2",
    capacity: 110,
    currentFilled: 25,
    cost: 12e16,
    serialNumberBytes32: 0x6164643200000000000000000000000000000000000000000000000000000000, // add2
    serialNumber:
      "0x6164643200000000000000000000000000000000000000000000000000000000",
    priceThreshold: 10e14,
    chargeRate: 6,
  },
  {
    name: "battery3",
    capacity: 90,
    currentFilled: 22,
    cost: 11e16,
    serialNumberBytes32: 0x6164643300000000000000000000000000000000000000000000000000000000, // add3
    serialNumber:
      "0x6164643300000000000000000000000000000000000000000000000000000000", // add3
    priceThreshold: 5e14,
    chargeRate: 8,
  },
  {
    name: "battery4",
    capacity: 80,
    currentFilled: 30,
    cost: 10e16,
    serialNumberBytes32: 0x6164643400000000000000000000000000000000000000000000000000000000, // add4
    serialNumber:
      "0x6164643400000000000000000000000000000000000000000000000000000000", // add4
    priceThreshold: 4e14,
    chargeRate: 20,
  },
  {
    name: "battery5",
    capacity: 70,
    currentFilled: 26,
    cost: 9e16,
    serialNumberBytes32: 0x6164643500000000000000000000000000000000000000000000000000000000, // add5
    serialNumber:
      "0x6164643500000000000000000000000000000000000000000000000000000000", // add5
    priceThreshold: 3e14,
    chargeRate: 11,
  },
];

module.exports = batteries;
