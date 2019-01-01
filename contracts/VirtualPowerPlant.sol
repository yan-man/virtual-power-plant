pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol";

/// @author Yan Man
/// @title A Virtual Power Plant implementation. Consensys Final Project Winter 2018
contract VirtualPowerPlant is Ownable {

    // Type declarations
    struct Battery {
        uint capacity;
        uint currentFilled;
        uint dateAdded;
        uint cost;
        string serialNumber;
        uint priceThreshold;
        uint chargeRate;
        bool active;
    }
    Battery[] public batteries;
    BatteryInvestment public batteryInvestmentContract;
    BatteryEnergy public batteryEnergyContract;
    // State variables
    // address public owner;
    address public virtualPowerPlantAddress;
    address public batteryInvestmentAddress;
    address public batteryEnergyAddress;
    uint public numBatteries = 0;
    uint numAdmins = 0;
    uint[] public activeBatteryIDs;
    mapping(address => bool) public admins;

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogChangeAdmin (address adminAddress, bool status);
    event LogNewBatteryAdded (string serialNumber);
    event LogBatteryThresholdChanged (uint newThreshold);

    // Modifiers
    // modifier onlyOwner { require(msg.sender == owner, "not the valid Owner"); _; }
    modifier isAdminModifier { require(admins[msg.sender] == true, "not a valid Admin"); _; }
    modifier isBatteryValidModifier (uint _capacity, uint _currentFilled, uint _cost, uint _priceThreshold) {
        require(_capacity >= _currentFilled, "Capacity must exceed amount filled");
        require(batteryInvestmentContract.totalInvestment() >= _cost, "Not enough investment to purchase");
        require(_priceThreshold >= 0, "Must have a valid price threshold");
        _;
    }

    constructor () public {
        // owner = msg.sender;
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
        string memory _serialNumber,
        uint _priceThreshold,
        uint _chargeRate
    )
        public
        isAdminModifier
        isBatteryValidModifier(_capacity, _currentFilled, _cost, _priceThreshold)
        returns (uint batteryID)
    {
        batteries.push(Battery({
            capacity: _capacity,
            currentFilled: _currentFilled,
            dateAdded: now,
            cost: _cost,
            serialNumber: _serialNumber,
            priceThreshold: _priceThreshold,
            chargeRate: _chargeRate,
            active: true
        }));
        batteryID = numBatteries++;

        uint _newTotalInvestment = batteryInvestmentContract.totalInvestment() - _cost;
        batteryInvestmentContract.updateTotalInvestment(_newTotalInvestment);
        //   batteryInvestmentAddress.delegatecall(bytes4(keccak256("updateTotalInvestment(uint256)")), _newTotalInvestment);
        //   _contract.delegatecall(bytes4(keccak256("updateMyVariable(uint256)")), newVar);
        emit LogNewBatteryAdded(_serialNumber);
    }

    function changeBatteryThreshold (uint _batteryID, uint _newThreshold)
        public
        isAdminModifier
    {
        require(_newThreshold >= 0);
        batteries[_batteryID].priceThreshold = _newThreshold;
        emit LogBatteryThresholdChanged(_newThreshold);
    }

    function decomissionBattery (uint _batteryID)
        public
        isAdminModifier
    {
        require(batteries[_batteryID].active);
        batteries[_batteryID].active = false;
        emit LogNewBatteryAdded(batteries[_batteryID].serialNumber);
    }

    function getBatteryIDMax () public view returns (uint) {
        return batteries.length;
    }

    function getBatteryCapacityRemaining (uint _batteryID) public view returns (uint remaining) {
        uint remaining = batteries[_batteryID].capacity -  batteries[_batteryID].currentFilled;
        if(remaining <= 0){
            return 0;
        }
    }

    function getBatteryChargeRate (uint _batteryID) public view returns (uint) {
        return batteries[_batteryID].chargeRate;
    }

    function changeAdmin (address _newAdminAddress, bool _adminStatus)
        public
        isOwner
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
