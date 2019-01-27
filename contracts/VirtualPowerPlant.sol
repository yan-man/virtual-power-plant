pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";
import "./Ownable.sol"; // to manage ownership addresses

/// @author Yan Man
/// @title A Virtual Power Plant implementation. Consensys Final Project Winter 2018/19
contract VirtualPowerPlant is Ownable {

    // Type declarations
    // Battery contains all necessary battery characteristics
    struct Battery {
        uint capacity; // max charge capacity
        uint currentFilled; // current charge level
        uint dateAdded; // keep track of timestamp battery was added
        uint cost;  // cost of the battery in eth
        bytes32 serialNumber; // for internal record keeping
        uint priceThreshold; // energy price threshold; whether to purchase energy based on real time rate
        uint chargeRate; // per hour, ie how much capacity can be charged/discharged
        bool isActive; // active or decommissioned
        uint mapIndex; // corresponds to the battery's index in batteryMapping array
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
    uint public numBatteries = 0; // number of active batteries
    uint public numAdmins = 0; // number of active admins
    uint[] public batteryMapping; // array to log the battery's index in batteries array
    mapping(address => bool) public admins; // addresses of admins

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogChangeAdmin (address adminAddress, bool status); // when admin status is changed
    event LogBatteryActive (bytes32 serialNumber, bool newStatus); // when battery is decommissioned or added
    event LogBatteryThresholdChanged (uint newThreshold);

    // Modifiers
    // check address is a valid admin or calling from deployed contract
    modifier isAdminModifier (address msgAddress) {
        require(
            admins[msgAddress] == true ||
            msg.sender == batteryInvestmentAddress ||
            msg.sender == batteryEnergyAddress,
            "not a valid Admin"
        );
        _;
    }
    // circuit breaker design
    modifier stopInEmergency { if (!stopped) _; }
    modifier onlyInEmergency { if (stopped) _; }
    // check battery is valid:
    // - amount of charge in the battery cannot exceed the charge
    // - remaining investment has enough funds to pay for the cost of the battery
    // - price threshold is positive
    modifier isBatteryValidModifier (uint _capacity, uint _currentFilled, uint _cost, uint _priceThreshold) {
        require(_capacity >= _currentFilled, "Capacity must exceed amount filled");
        require(batteryInvestmentContract.remainingInvestment() >= _cost, "Not enough investment to purchase");
        require(_priceThreshold >= 0, "Must have a valid price threshold");
        _;
    }

    /// @notice constructor
    constructor () public {
        setAdmin(msg.sender, true); // set contract deployer as admin
        uint dividendPercentage = 1; // set amount of investment which will be used for dividend
        // define contract addresses and contracts that are deployed
        virtualPowerPlantAddress = address(this);
        batteryInvestmentContract = new BatteryInvestment(virtualPowerPlantAddress, dividendPercentage);
        batteryInvestmentAddress = address(batteryInvestmentContract);
        batteryEnergyContract = new BatteryEnergy(virtualPowerPlantAddress);
        batteryEnergyAddress = address(batteryEnergyContract);
    }

    /// @notice fallback function
    function () external {
        revert("Fallback");
    }

    // External functions
    /// @notice allow other contracts to check admin users
    /// @return whether address is an admin user
    function isAdmin (address adminAddress)
        external
        view
        isAdminModifier(adminAddress)
        returns (bool)
    {
        return true;
    }

    /// @notice add battery to array of storage assets
    /// @return battery ID of battery added
    function addBattery (
        uint _capacity,
        uint _currentFilled,
        uint _cost,
        bytes32 _serialNumber,
        uint _priceThreshold,
        uint _chargeRate
    )
        external
        isAdminModifier(msg.sender)
        isBatteryValidModifier(_capacity, _currentFilled, _cost, _priceThreshold)
        stopInEmergency()
        returns (uint batteryID)
    {
        batteryID = batteries.length; // index in the array, corresponds to current length of array
        // add each characteristic to create Battery struct, push to array
        batteries.push(Battery({
            capacity: _capacity,
            currentFilled: _currentFilled,
            dateAdded: now,
            cost: _cost,
            serialNumber: _serialNumber,
            priceThreshold: _priceThreshold,
            chargeRate: _chargeRate,
            isActive: true,
            mapIndex: batteryID
        }));
        numBatteries++; // increase number of active batteries
        batteryMapping.push(batteryID); // record battery ID in mapping
        // update remaining investment with cost of battery
        uint _newRemainingInvestment = batteryInvestmentContract.remainingInvestment() - _cost;
        batteryInvestmentContract.updateRemainingInvestment(_newRemainingInvestment);
        emit LogBatteryActive(_serialNumber, true);
    }

    /// @notice add/subtract charge to battery
    /// @param _batteryID battery identifier
    /// @param _chargeAmount amount of charge to add/subtract
    /// @return new amount of charge currently filled
    function chargeBattery (uint _batteryID, uint _chargeAmount)
        external
        isAdminModifier(msg.sender)
        stopInEmergency()
        returns (uint)
    {
        // require the anount of charge to not exceed capacity
        require(batteries[_batteryID].currentFilled + _chargeAmount  <= batteries[_batteryID].capacity);
        // if valid, add charge to specific battery
        batteries[_batteryID].currentFilled = batteries[_batteryID].currentFilled + _chargeAmount;
        return batteries[_batteryID].currentFilled;
    }

    /// @notice alter battery threshold that determines charge/discharge decision
    /// @param _batteryID battery identifier
    /// @param _newThreshold new threshold value to change to
    function changeBatteryThreshold (uint _batteryID, uint _newThreshold)
        external
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
    function decommissionBattery (uint _batteryID)
        external
        isAdminModifier(msg.sender)
        returns (uint)
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
    function getRelevantBatteryInfo (uint _batteryID)
        external
        view
        returns (
            uint,
            uint,
            bytes32,
            uint,
            uint,
            bool,
            uint
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
    function getBatteryCapacityRemaining (uint _batteryID) external view returns (uint remaining) {
        remaining = batteries[_batteryID].capacity -  batteries[_batteryID].currentFilled;
        if(remaining <= 0){
            return 0;
        }
    }

    /// @notice retrieve battery charge rate
    /// @param _batteryID battery identifier
    /// @return battery charge rate
    function getBatteryChargeRate (uint _batteryID) external view returns (uint) {
        return batteries[_batteryID].chargeRate;
    }

    /// @notice mapIndex of the battery
    /// @param _batteryID battery identifier
    /// @return index of battery within batteryMapping
    function getBatteryMapIndex (uint _batteryID) external view returns (uint) {
        return batteries[_batteryID].mapIndex;
    }

    // Public functions

    /// @notice toggle stopped variable for circuit breaker design
    function toggleContractActive() isAdminModifier(msg.sender) public {
        stopped = !stopped;
    }

    /// @notice add or remove admins
    function setAdmin (address _newAdminAddress, bool _adminStatus)
        public
        onlyOwner
    {
        // set admin at address
        admins[_newAdminAddress] = _adminStatus;
        // if true, increment # of admins
        if (_adminStatus == true) {
            numAdmins++;
        } else {
            numAdmins--;
        }
        emit LogChangeAdmin(_newAdminAddress, _adminStatus);
    }


}
