pragma solidity >=0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";
import "./Ownable.sol"; // to manage ownership addresses

/// @author Yan Man
/// @title A Virtual Power Plant implementation. Consensys Final Project Winter 2018/19
contract VirtualPowerPlant is Ownable {
  using SafeMath for uint256;

  // Type declarations
  // Battery contains all necessary battery characteristics
  struct Battery {
    uint256 capacity; // max charge capacity
    uint256 currentFilled; // current charge level
    uint256 dateAdded; // keep track of timestamp battery was added
    uint256 cost; // cost of the battery in eth
    bytes32 serialNumber; // for internal record keeping
    uint256 priceThreshold; // energy price threshold; whether to purchase energy based on real time rate
    uint256 chargeRate; // per hour, ie how much capacity can be charged/discharged
    bool isActive; // active or decommissioned
    uint256 mapIndex; // corresponds to the battery's index in batteryMapping array
  }
  Battery[] public batteries; // array of active batteries
  Battery[] public decommissionedBatteries; // array of decommissioned batts
  BatteryInvestment public batteryInvestmentContract; // deployed by this contract
  BatteryEnergy public batteryEnergyContract; // deployed by this contract
  // State variables
  bool private stopped = false; // circuit breaker design
  address public virtualPowerPlantAddress;
  address public batteryInvestmentAddress;
  address public batteryEnergyAddress;
  uint256 public numBatteries = 0; // number of active batteries
  uint256 public numAdmins = 0; // number of active admins
  uint256[] public batteryMapping; // array to log the battery's index in batteries array
  mapping(address => bool) public admins; // addresses of admins
  address[] public adminsList;

  // Events
  event LogNewInvestment(address investorAddress, uint256 investmentAmount);
  event LogWithdrawalMade(address investorAddress, uint256 withdrawalAmount);
  event LogChangeAdmin(address adminAddress, bool status); // when admin status is changed
  event LogBatteryActive(bytes32 serialNumber, bool newStatus); // when battery is decommissioned or added
  event LogBatteryThresholdChanged(uint256 newThreshold);
  // event LogBatteryDetails (uint remainingInvestment, uint cost); // when battery is decommissioned or added

  // Modifiers
  // check address is a valid admin or calling from deployed contract
  modifier isAdminModifier(address msgAddress) {
    require(
      admins[msgAddress] == true ||
        msg.sender == virtualPowerPlantAddress ||
        msg.sender == batteryInvestmentAddress ||
        msg.sender == batteryEnergyAddress,
      "not a valid Admin"
    );
    _;
  }
  // circuit breaker design
  modifier stopInEmergency() {
    if (!stopped) _;
  }
  modifier onlyInEmergency() {
    if (stopped) _;
  }
  // check battery is valid:
  // - amount of charge in the battery cannot exceed the charge
  // - remaining investment has enough funds to pay for the cost of the battery
  // - price threshold is positive
  modifier isBatteryValidModifier(
    uint256 _capacity,
    uint256 _currentFilled,
    uint256 _cost,
    uint256 _priceThreshold
  ) {
    // emit LogBatteryDetails(batteryInvestmentContract.remainingInvestment(), _cost);
    uint256 remainingInvestment = batteryInvestmentContract
      .remainingInvestment();
    require(
      _capacity.sub(_currentFilled) >= 0,
      "Capacity must exceed amount filled"
    );
    require(
      remainingInvestment.sub(_cost) >= 0,
      "Not enough investment to purchase"
    );
    require(_priceThreshold >= 0, "Must have a valid price threshold");
    _;
  }

  /// @notice constructor
  constructor() public {
    setAdmin(msg.sender, true); // set contract deployer as admin
    uint256 dividendPercentage = 1; // set amount of investment which will be used for dividend
    // define contract addresses and contracts that are deployed
    virtualPowerPlantAddress = address(this);
    batteryInvestmentContract = new BatteryInvestment(
      virtualPowerPlantAddress,
      dividendPercentage
    );
    batteryInvestmentAddress = address(batteryInvestmentContract);
    batteryEnergyContract = new BatteryEnergy(virtualPowerPlantAddress);
    batteryEnergyAddress = address(batteryEnergyContract);
  }

  // External functions
  /// @notice allow other contracts to check admin users
  /// @return whether address is an admin user
  function isAdmin(address adminAddress)
    external
    view
    isAdminModifier(adminAddress)
    returns (bool)
  {
    return true;
  }

  function getBattery(uint256 index)
    public
    view
    returns (
      uint256 capacity,
      uint256 currentFilled,
      uint256 dateAdded,
      uint256 cost,
      bytes32 serialNumber,
      uint256 priceThreshold,
      uint256 chargeRate,
      bool isActive,
      uint256 mapIndex
    )
  {
    Battery memory b = batteries[index];
    return (
      b.capacity,
      b.currentFilled,
      b.dateAdded,
      b.cost,
      b.serialNumber,
      b.priceThreshold,
      b.chargeRate,
      b.isActive,
      b.mapIndex
    );
  }

  function getBatteryMapping() public view returns (uint256[] memory) {
    return batteryMapping;
  }

  function getAdmin() public view returns (address[] memory) {
    return adminsList;
  }

  function getUser()
    public
    returns (
      // isAdminModifier(msg.sender)
      address sender
    )
  {
    return msg.sender;
  }

  /// @notice add battery to array of storage assets
  /// @return battery ID of battery added
  function addBattery(
    uint256 _capacity,
    uint256 _currentFilled,
    uint256 _cost,
    bytes32 _serialNumber,
    uint256 _priceThreshold,
    uint256 _chargeRate
  )
    external
    isBatteryValidModifier(_capacity, _currentFilled, _cost, _priceThreshold)
    stopInEmergency
    returns (uint256 response)
  {
    uint256 batteryID = batteries.length; // index in the array, corresponds to current length of array
    // add each characteristic to create Battery struct, push to array

    Battery memory newBatt;
    newBatt.capacity = _capacity;
    newBatt.currentFilled = _currentFilled;
    newBatt.cost = _cost;
    newBatt.serialNumber = _serialNumber;
    newBatt.priceThreshold = _priceThreshold;
    newBatt.chargeRate = _chargeRate;
    newBatt.isActive = true;
    newBatt.mapIndex = batteryID;

    batteries.push(newBatt);

    uint256 remainingInvestment = batteryInvestmentContract
      .remainingInvestment();

    numBatteries = numBatteries.add(1); // increase number of active batteries
    batteryMapping.push(batteryID); // record battery ID in mapping

    // update remaining investment with cost of battery
    uint256 _newRemainingInvestment = remainingInvestment.sub(_cost);

    batteryInvestmentContract.updateRemainingInvestment(
      _newRemainingInvestment
    );

    response = batteries[batteryID].mapIndex;
    emit LogBatteryActive(_serialNumber, true);
  }

  /// @notice add/subtract charge to battery
  /// @param _batteryID battery identifier
  /// @param _chargeAmount amount of charge to add/subtract
  /// @return new amount of charge currently filled
  function chargeBattery(uint256 _batteryID, uint256 _chargeAmount)
    external
    isAdminModifier(msg.sender)
    stopInEmergency
    returns (uint256)
  {
    // require the anount of charge to not exceed capacity
    require(
      batteries[_batteryID].currentFilled + _chargeAmount <=
        batteries[_batteryID].capacity
    );
    // if valid, add charge to specific battery
    batteries[_batteryID].currentFilled =
      batteries[_batteryID].currentFilled +
      _chargeAmount;
    return batteries[_batteryID].currentFilled;
  }

  /// @notice alter battery threshold that determines charge/discharge decision
  /// @param _batteryID battery identifier
  /// @param _newThreshold new threshold value to change to
  function changeBatteryThreshold(uint256 _batteryID, uint256 _newThreshold)
    external
    stopInEmergency
    isAdminModifier(msg.sender)
  {
    // require the price threshold to be positive
    require(_newThreshold >= 0);
    // set new threshold of specific battery
    batteries[_batteryID].priceThreshold = _newThreshold;
    emit LogBatteryThresholdChanged(_newThreshold);
  }

  /// @notice decommission battery, ie set active to false and move to other array
  /// @param _batteryID battery identifier
  /// @return number of batteries after batt has been decommissioned
  function decommissionBattery(uint256 _batteryID)
    external
    stopInEmergency
    isAdminModifier(msg.sender)
    returns (uint256)
  {
    // require the battery state to be active before it can be decommissioned
    require(batteries[_batteryID].isActive);
    batteries[_batteryID].isActive = false; // set battery to inactive
    bytes32 serialNumber = batteries[_batteryID].serialNumber;
    // add decommissioned battery to separate array
    decommissionedBatteries.push(batteries[_batteryID]);
    // replace decommissioned battery in the array with battery at the end of current array
    batteries[batteries.length - 1].mapIndex = batteries[_batteryID].mapIndex;
    // also change index in batteryMapping
    batteryMapping[_batteryID] = batteries.length - 1;
    // remove last elements (which have been moved)
    batteryMapping.length--;
    // decrement number of batteries
    numBatteries--;
    emit LogBatteryActive(serialNumber, false); // log battery change activity
    return numBatteries;
  }

  // External functions that are view
  /// @notice retrieve battery info
  /// @param _batteryID battery identifier
  /// @return battery characteristics as list of values
  function getRelevantBatteryInfo(uint256 _batteryID)
    external
    view
    returns (
      uint256,
      uint256,
      bytes32,
      uint256,
      uint256,
      bool,
      uint256
    )
  {
    return (
      batteries[_batteryID].capacity,
      batteries[_batteryID].currentFilled,
      batteries[_batteryID].serialNumber,
      batteries[_batteryID].priceThreshold,
      batteries[_batteryID].chargeRate,
      batteries[_batteryID].isActive,
      batteries[_batteryID].mapIndex
    );
  }

  /// @notice retrieve battery capacity remaining
  /// @param _batteryID battery identifier
  /// @return battery capacity remaining
  function getBatteryCapacityRemaining(uint256 _batteryID)
    external
    view
    returns (uint256 remaining)
  {
    remaining =
      batteries[_batteryID].capacity -
      batteries[_batteryID].currentFilled;
    if (remaining <= 0) {
      return 0;
    }
  }

  /// @notice retrieve battery charge rate
  /// @param _batteryID battery identifier
  /// @return battery charge rate
  function getBatteryChargeRate(uint256 _batteryID)
    external
    view
    returns (uint256)
  {
    return batteries[_batteryID].chargeRate;
  }

  /// @notice mapIndex of the battery
  /// @param _batteryID battery identifier
  /// @return index of battery within batteryMapping
  function getBatteryMapIndex(uint256 _batteryID)
    external
    view
    returns (uint256)
  {
    return batteries[_batteryID].mapIndex;
  }

  // Public functions

  /// @notice toggle stopped variable for circuit breaker design
  function toggleContractActive() public isAdminModifier(msg.sender) {
    stopped = !stopped;
  }

  /// @notice add or remove admins
  function setAdmin(address _newAdminAddress, bool _adminStatus)
    public
    returns (
      // onlyOwner
      uint256
    )
  {
    // set admin at address
    admins[_newAdminAddress] = _adminStatus;
    adminsList.push(_newAdminAddress);
    // if true, increment # of admins
    if (_adminStatus == true) {
      numAdmins++;
    } else {
      numAdmins--;
    }
    return numAdmins;
    emit LogChangeAdmin(_newAdminAddress, _adminStatus);
  }
}
