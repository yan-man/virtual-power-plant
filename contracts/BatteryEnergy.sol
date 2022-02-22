pragma solidity >=0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage charging/discharging of batteries
contract BatteryEnergy {
  using SafeMath for uint256;
  using Math for uint256;

  // Type declarations
  VirtualPowerPlant VirtualPowerPlantContract;

  // State variables
  address public virtualPowerPlantAddress; // address of parent contract deploying battery investment
  uint256 public purchaseInterval = 3600; // in sec, prescribed time between energy tx
  uint256 public batteryIDCounter; // for batch processes; the latest battery ID processed
  uint256 public batchProcess = 3; // number of batteries in the batch to process at once

  // Events
  // event Log(uint counter);
  event LogBatteryCheck(uint256 batteryID);
  event LogBatteryCheckCompleted();
  event LogEnergyPurchased(
    bytes32 serialNumber,
    uint256 energyTransacted,
    uint256 energyPrice
  );
  event LogEnergySold(
    bytes32 serialNumber,
    uint256 energyTransacted,
    uint256 energyPrice
  );

  // constructor
  /// @param _virtualPowerPlantAddress address of parent contract deploying this contract
  constructor(address _virtualPowerPlantAddress) public {
    virtualPowerPlantAddress = _virtualPowerPlantAddress;
    // create VirtualPowerPlant contract from parent contract address
    VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
  }

  /// @notice check each battery's energy level and charge/discharge based on
  /// @notice current energy rate and battery's price threshold
  /// @return whether all batteries were successfully checked
  function checkBatteryEnergy() external returns (bool) {
    uint256 batteryID;
    uint256 totalEnergyPurchase;
    for (uint256 i = 0; i < batchProcess; i++) {
      batteryID = VirtualPowerPlantContract.batteryMapping(batteryIDCounter);
      totalEnergyPurchase += executeBatteryTransaction(batteryID);
      batteryIDCounter += 1;
      if (batteryIDCounter == VirtualPowerPlantContract.numBatteries()) {
        batteryIDCounter = 0;
        emit LogBatteryCheckCompleted();
        return true;
      }
    }
    return false;
  }

  /// @notice buy or sell energy and update battery status
  /// @return amount of energy to transact
  function transactEnergy(
    uint256 _batteryID,
    uint256 _capacity,
    uint256 _currentFilled,
    bytes32 _serialNumber,
    uint256 _chargeRate,
    uint256 _energyPrice,
    bool _chargeBattery
  ) private returns (uint256 calculateEnergyToTransact) {
    // convert seconds to hours
    uint256 purchaseIntervalHours = purchaseInterval.div(3600);
    // how much energy is available in battery
    uint256 emptyCapacity = _capacity - _currentFilled;

    // if decision is to charge battery
    if (_chargeBattery == true) {
      // to add energy to battery, it must have available capacity
      require(
        emptyCapacity > 0,
        "Battery should have remaining capacity in order to charge"
      );
      // charge rate * time interval gives total energy amount to be added
      // but energy amount cannot exceed empty capacity
      uint256 charge = _chargeRate.mul(purchaseIntervalHours);
      calculateEnergyToTransact = charge.min(emptyCapacity);
      // find remaining investment in fund
      uint256 remainingInvestment = (
        VirtualPowerPlantContract.batteryInvestmentContract()
      ).remainingInvestment();
      // cost = energy amount * energy price
      uint256 costOfEnergyPurchase = calculateEnergyToTransact.mul(
        _energyPrice
      );
      // make sure there is enough investment to cover energy purchase
      if (costOfEnergyPurchase > remainingInvestment) {
        // energy purchase costs at most are the remaining investment
        costOfEnergyPurchase = remainingInvestment;
        // back calculate the energy based on the max eth available
        calculateEnergyToTransact = remainingInvestment.div(_energyPrice);
      }
      // purchase energy
      buyEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
      emit LogEnergyPurchased(
        _serialNumber,
        calculateEnergyToTransact,
        _energyPrice
      );
    } else {
      // maximum energy to sell is the current amount in the battery
      calculateEnergyToTransact = Math.min(
        _chargeRate.mul(purchaseIntervalHours),
        _currentFilled
      );
      sellEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
      emit LogEnergySold(
        _serialNumber,
        calculateEnergyToTransact,
        _energyPrice
      );
    }
  }

  /// @notice buy energy
  /// @param _batteryID battery identifier
  /// @param _energyAmountToPurchase amount to purchase
  /// @param _energyPrice current energy price
  /// @return whether energy successfully sold
  function buyEnergy(
    uint256 _batteryID,
    uint256 _energyAmountToPurchase,
    uint256 _energyPrice
  ) private returns (bool) {
    // calculate remaining investment money after energy purchase
    uint256 oldRemainingInvestment = VirtualPowerPlantContract
      .batteryInvestmentContract()
      .remainingInvestment();
    uint256 newRemainingInvestment = oldRemainingInvestment.sub(
      _energyAmountToPurchase.mul(_energyPrice)
    );
    // require sufficient investment remaining after purchase to continue
    require(
      newRemainingInvestment >= 0,
      "Not enough money to make this purchase"
    );
    if (
      (VirtualPowerPlantContract.batteryInvestmentContract())
        .updateRemainingInvestment(newRemainingInvestment)
    ) {
      // update battery characteristics based on energy charged
      VirtualPowerPlantContract.chargeBattery(
        _batteryID,
        -_energyAmountToPurchase
      );
      return true;
    }
    return false;
  }

  /// @notice sell energy
  /// @param _batteryID battery identifier
  /// @param _energyAmountToSell amount to sell
  /// @param _energyPrice current energy price
  /// @return whether energy successfully sold
  function sellEnergy(
    uint256 _batteryID,
    uint256 _energyAmountToSell,
    uint256 _energyPrice
  ) private returns (bool) {
    uint256 oldRemainingInvestment = VirtualPowerPlantContract
      .batteryInvestmentContract()
      .remainingInvestment();
    uint256 newRemainingInvestment = oldRemainingInvestment.add(
      _energyAmountToSell.mul(_energyPrice)
    );
    if (
      (VirtualPowerPlantContract.batteryInvestmentContract())
        .updateRemainingInvestment(newRemainingInvestment)
    ) {
      VirtualPowerPlantContract.chargeBattery(_batteryID, _energyAmountToSell);
      return true;
    }
    return false;
  }

  /// @notice for each battery execute the battery transaction by making decision
  /// @notice on charging/discharging
  /// @return amount of energy to transact
  function executeBatteryTransaction(uint256 _batteryID)
    private
    returns (uint256)
  {
    uint256 energyAmountToTransact;
    // first retrieve current price of energy
    uint256 energyPrice = getRealTimeEnergyPrice();
    emit LogBatteryCheck(_batteryID);
    // retrieve relevant battery info for specific battery based on ID
    (
      uint256 capacity,
      uint256 currentFilled,
      bytes32 serialNumber,
      uint256 priceThreshold,
      uint256 chargeRate,
      bool isActive,
      uint256 mapIndex
    ) = VirtualPowerPlantContract.getRelevantBatteryInfo(_batteryID);
    // battery must be active to proceed
    require(isActive == true, "Battery should be active");
    // retrive decision on whether to buy or sell energy
    bool chargeBattery = energyDecisionAlgorithm(priceThreshold, energyPrice);
    // check whether to charge or discharge battery
    if (chargeBattery == true) {
      // require remaining investment to be valid to purchase energy
      require(
        (VirtualPowerPlantContract.batteryInvestmentContract())
          .remainingInvestment() > 0
      );
    }
    // buy or sell energy, update battery status
    energyAmountToTransact = transactEnergy(
      _batteryID,
      capacity,
      currentFilled,
      serialNumber,
      chargeRate,
      energyPrice,
      chargeBattery
    );
    return energyAmountToTransact;
  }

  /// @notice basic function to retrieve real time energy price. For now,
  /// @notice hardcode a static value
  function getRealTimeEnergyPrice()
    private
    pure
    returns (uint256 realTimePrice)
  {
    realTimePrice = 5000;
  }

  /// @notice make a decision on whether to buy or sell energy
  /// @return true to buy energy
  /// @return false to sell energy
  function energyDecisionAlgorithm(
    uint256 _priceThreshold,
    uint256 _energyPrice
  ) private pure returns (bool) {
    // for now, simple algo. If current price is less than threshold, buy
    if (_priceThreshold > _energyPrice) {
      return true;
    } else {
      return false;
    }
  }
}
