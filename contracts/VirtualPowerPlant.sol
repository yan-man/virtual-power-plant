pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";
import "./Ownable.sol";

/// @author Yan Man
/// @title A Virtual Power Plant implementation. Consensys Final Project Winter 2018
contract VirtualPowerPlant is Ownable {

    // Type declarations
    struct Battery {
        uint capacity;
        uint currentFilled;
        uint dateAdded;
        uint cost;
        bytes32 serialNumber;
        uint priceThreshold;
        uint chargeRate;
        bool isActive;
        uint mapIndex;
    }
    Battery[] public batteries; //internal
    Battery[] public decommissionedBatteries; //internal
    BatteryInvestment public batteryInvestmentContract; // maybe external
    BatteryEnergy public batteryEnergyContract;
    // State variables
    // address public owner;
    address public virtualPowerPlantAddress;
    address public batteryInvestmentAddress; //maybe external, only accessed by other contracts
    address public batteryEnergyAddress;  //maybe can be external
    uint public numBatteries = 0;
    uint public numAdmins = 0;
    uint public dividendPercentage;
    uint[] public batteryMapping;
    mapping(address => bool) public admins;

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogChangeAdmin (address adminAddress, bool status);
    event LogBatteryActive (bytes32 serialNumber, bool newStatus);
    event LogBatteryThresholdChanged (uint newThreshold);

    // Modifiers
    // modifier onlyOwner { require(msg.sender == owner, "not the valid Owner"); _; }
    modifier isAdminModifier { require(
        admins[msg.sender] == true ||
        msg.sender == batteryInvestmentAddress ||
        msg.sender == batteryEnergyAddress
        , "not a valid Admin"); _; }
    modifier isBatteryValidModifier (uint _capacity, uint _currentFilled, uint _cost, uint _priceThreshold) {
        require(_capacity >= _currentFilled, "Capacity must exceed amount filled");
        require(batteryInvestmentContract.remainingInvestment() >= _cost, "Not enough investment to purchase");
        require(_priceThreshold >= 0, "Must have a valid price threshold");
        _;
    }

    constructor () public {
        // owner = msg.sender;
        dividendPercentage = 1;
        admins[msg.sender] = true;
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
    // ...

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

    function addBattery (
        uint _capacity,
        uint _currentFilled,
        uint _cost,
        bytes32 _serialNumber,
        uint _priceThreshold,
        uint _chargeRate
    )
        public
        isAdminModifier
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

    function chargeBattery (uint _batteryID, uint _chargeAmount)
        public
        isAdminModifier
        returns (uint)
    {
        require(batteries[_batteryID].currentFilled + _chargeAmount  <= batteries[_batteryID].capacity);
        batteries[_batteryID].currentFilled = batteries[_batteryID].currentFilled + _chargeAmount;
        return batteries[_batteryID].currentFilled;
    }

    function changeBatteryThreshold (uint _batteryID, uint _newThreshold)
        public
        isAdminModifier
    {
        require(_newThreshold >= 0);
        batteries[_batteryID].priceThreshold = _newThreshold;
        emit LogBatteryThresholdChanged(_newThreshold);
    }

    function decommissionBattery (uint _batteryID)
        public
        isAdminModifier
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

    function getRelevantBatteryInfo (uint _batteryID) public view isAdminModifier returns (
        uint,
        uint,
        bytes32,
        uint,
        uint,
        bool,
        uint
    ) {
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

    function changeAdmin (address _newAdminAddress, bool _adminStatus)
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
