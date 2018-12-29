pragma solidity >=0.5.0;

library BatteryLibrary {
  struct Investment {
    uint timestamp; // timestamp of their investment
    uint investmentAmount; //how much they have invested in the transaction
  }

  struct Battery {
      uint capacity;
      uint currentFilled;
      uint dateAdded;
      uint cost;
      string serialNumber;
      uint priceThreshold;
      bool active;
  }

}
