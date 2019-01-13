pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";
import "./Ownable.sol"; // to manage ownership addresses

/// @author Yan Man
/// @title A Virtual Power Plant implementation. Consensys Final Project Winter 2018/19
contract VirtualPowerPlant is Ownable {

    // Type declarations
    // contains all necessary battery characteristics
    struct Battery {
        uint capacity; // max charge capacity
        uint currentFilled; // current charge level
        uint dateAdded;
        uint cost;
        bytes32 serialNumber; // for internal record keeping
        uint priceThreshold; // energy price threshold; determines whether to purchase energy based on real time rate
        uint chargeRate; // per hour, ie how much capacity can be filled in an hour
        bool isActive; // active or decommissioned
        uint mapIndex; // corresponds to the battery's index in batteryMapping array
    }
    Battery[] public batteries; // array of active batteries
    Battery[] public decommissionedBatteries; // array of decommissioned batts
    BatteryInvestment public batteryInvestmentContract; // deployed by this contract
    BatteryEnergy public batteryEnergyContract; // deployed by this contract
    // State variables
    address public virtualPowerPlantAddress;
    address public batteryInvestmentAddress;
    address public batteryEnergyAddress;
    uint public numBatteries = 0;
    uint public numAdmins = 0;
    uint public dividendPercentage;
    uint[] public batteryMapping; // array to log the battery's index in batteries array
    mapping(address => bool) public admins; // addresses of admins

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogChangeAdmin (address adminAddress, bool status); // when admin status is changed
    event LogBatteryActive (bytes32 serialNumber, bool newStatus); // when battery status is changed
    event LogBatteryThresholdChanged (uint newThreshold);

    // Modifiers
    // check user is a valid admin or calling from deployed contract
    modifier isAdminModifier (address msgAddress) {
        require(
            admins[msgAddress] == true ||
            msgAddress == batteryInvestmentAddress ||
            msgAddress == batteryEnergyAddress,
            "not a valid Admin"
        );
        _;
    }

    modifier isBatteryValidModifier (uint _capacity, uint _currentFilled, uint _cost, uint _priceThreshold) {
        require(_capacity >= _currentFilled, "Capacity must exceed amount filled");
        require(batteryInvestmentContract.remainingInvestment() >= _cost, "Not enough investment to purchase");
        require(_priceThreshold >= 0, "Must have a valid price threshold");
        _;
    }

    constructor () public {
        // owner = msg.sender;
        dividendPercentage = 1;
        setAdmin(msg.sender, true);
        virtualPowerPlantAddress = address(this);
        batteryInvestmentContract = new BatteryInvestment(virtualPowerPlantAddress);
        batteryInvestmentAddress = address(batteryInvestmentContract);
        batteryEnergyContract = new BatteryEnergy(virtualPowerPlantAddress);
        batteryEnergyAddress = address(batteryEnergyContract);
    }

    function () external {
        revert();
    }

    // External functions
    function isAdmin (address adminAddress)
        external
        view
        isAdminModifier(adminAddress)
        returns (bool)
    {
        return true;
    }

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
        returns (uint batteryID)
    {
        batteryID = batteries.length;
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
        numBatteries++;
        batteryMapping.push(batteryID);
        // batteryMapping[_serialNumber] = batteryID;
        uint _newRemainingInvestment = batteryInvestmentContract.remainingInvestment() - _cost;
        batteryInvestmentContract.updateRemainingInvestment(_newRemainingInvestment);
        //   batteryInvestmentAddress.delegatecall(bytes4(keccak256("updateTotalInvestment(uint256)")), _newTotalInvestment);
        //   _contract.delegatecall(bytes4(keccak256("updateMyVariable(uint256)")), newVar);
        emit LogBatteryActive(_serialNumber, true);
    }

    // External functions that are view
    // ...

    // External functions that are pure
    // ...

    // Public functions
    // ...

    // Internal functions
    // ...

    // Private functions
    // ...





    function chargeBattery (uint _batteryID, uint _chargeAmount)
        public
        isAdminModifier(msg.sender)
        returns (uint)
    {
        require(batteries[_batteryID].currentFilled + _chargeAmount  <= batteries[_batteryID].capacity);
        batteries[_batteryID].currentFilled = batteries[_batteryID].currentFilled + _chargeAmount;
        return batteries[_batteryID].currentFilled;
    }

    function changeBatteryThreshold (uint _batteryID, uint _newThreshold)
        public
        isAdminModifier(msg.sender)
    {
        require(_newThreshold >= 0);
        batteries[_batteryID].priceThreshold = _newThreshold;
        emit LogBatteryThresholdChanged(_newThreshold);
    }

    function decommissionBattery (uint _batteryID)
        public
        isAdminModifier(msg.sender)
        returns (uint)
    {
        require(batteries[_batteryID].isActive);
        batteries[_batteryID].isActive = false;
        bytes32 serialNumber = batteries[_batteryID].serialNumber;
        decommissionedBatteries.push(batteries[_batteryID]);
        // batteries[_batteryID] = batteries[batteries.length - 1];
        // batteries.length--;
        batteries[batteries.length - 1].mapIndex = batteries[_batteryID].mapIndex;
        batteryMapping[_batteryID] = batteries.length - 1;
        batteryMapping.length--;
        numBatteries--;
        emit LogBatteryActive(serialNumber, false);
        return numBatteries;
    }

    // function getBatteryIDMax () public view returns (uint) {
    //     return batteries.length;
    // }

    function getRelevantBatteryInfo (uint _batteryID)
        external
        view
        isAdminModifier(msg.sender)
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

    function getBatteryCapacityRemaining (uint _batteryID) public view returns (uint remaining) {
        remaining = batteries[_batteryID].capacity -  batteries[_batteryID].currentFilled;
        if(remaining <= 0){
            return 0;
        }
    }

    function getBatteryChargeRate (uint _batteryID) public view returns (uint) {
        return batteries[_batteryID].chargeRate;
    }

    function getBatteryMapIndex (uint _batteryID) public view returns (uint) {
        return batteries[_batteryID].mapIndex;
    }

    function setAdmin (address _newAdminAddress, bool _adminStatus)
        public
        onlyOwner
    {
        admins[_newAdminAddress] = _adminStatus;
        if (_adminStatus == true) {
            numAdmins++;
        } else {
            numAdmins--;
        }
        emit LogChangeAdmin(_newAdminAddress, _adminStatus);
    }



}
