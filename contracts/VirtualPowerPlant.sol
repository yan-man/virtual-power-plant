pragma solidity >=0.5.0;

import "./BatteryInvestment.sol";
import "./BatteryEnergy.sol";

contract VirtualPowerPlant {

  address public owner;
  address public VirtualPowerPlantAddress;
  address public BatteryInvestmentAddress;
  address public BatteryEnergyAddress;
  BatteryInvestment public BatteryInvestmentContract;
  BatteryEnergy public BatteryEnergyContract;


  uint public numBatteries = 0;
  uint numAdmins = 0;
  uint[] public activeBatteryIDs;
//   uint public numActiveBatteries = 0;
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

  mapping (address => bool) public admins;
  Battery[] public batteries;

  event LogNewInvestment(address investorAddress, uint investmentAmount);
  event LogWithdrawalMade(address investorAddress, uint withdrawalAmount);
  event LogChangeAdmin(address adminAddress, bool status);
  event LogNewBatteryAdded(string serialNumber);
  event LogBatteryThresholdChanged(uint newThreshold);

  modifier enoughInvestmentModifier() { require(msg.value > 0, "Attach an investment value"); _; }
  modifier isOwnerModifier() { require(msg.sender == owner, "not the valid Owner"); _; }
  modifier isAdminModifier() { require(admins[msg.sender] == true, "not a valid Admin"); _; }
  modifier isBatteryValidModifier(uint _capacity, uint _currentFilled, uint _cost, uint _priceThreshold) {
      require(_capacity >= _currentFilled, "Capacity must exceed amount filled");
      require(BatteryInvestmentContract.totalInvestment() >= _cost, "Not enough investment to purchase");
      require(_priceThreshold >= 0, "Must have a valid price threshold");
      _;
  }

  constructor () public {
      owner = msg.sender;
      admins[msg.sender] = true;
      VirtualPowerPlantAddress = address(this);
      BatteryInvestmentContract = new BatteryInvestment(VirtualPowerPlantAddress);
      BatteryInvestmentAddress = address(BatteryInvestmentContract);
      BatteryEnergyContract = new BatteryEnergy(VirtualPowerPlantAddress);
      BatteryEnergyAddress = address(BatteryEnergyContract);
  }

  function () external{
        revert();
    }


  function addBattery (uint _capacity, uint _currentFilled, uint _cost, string memory _serialNumber, uint _priceThreshold, uint _chargeRate) public
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

      uint _newTotalInvestment = BatteryInvestmentContract.totalInvestment() - _cost;
      BatteryInvestmentContract.updateTotalInvestment(_newTotalInvestment);
    //   BatteryInvestmentAddress.delegatecall(bytes4(keccak256("updateTotalInvestment(uint256)")), _newTotalInvestment);
    //   _contract.delegatecall(bytes4(keccak256("updateMyVariable(uint256)")), newVar);
      emit LogNewBatteryAdded(_serialNumber);
  }

  function changeBatteryThreshold (uint _batteryID, uint _newThreshold) public
  isAdminModifier
  {
      require(_newThreshold >= 0);
      batteries[_batteryID].priceThreshold = _newThreshold;
      emit LogBatteryThresholdChanged(_newThreshold);
  }

  function decomissionBattery (uint _batteryID) public
  isAdminModifier
//   returns (uint numActiveBatteries)
  {
      require(batteries[_batteryID].active);
      batteries[_batteryID].active = false;
      emit LogNewBatteryAdded(batteries[_batteryID].serialNumber);
  }

  function getBatteryIDMax() public view returns (uint) {
      return batteries.length;
  }

  function getBatteryCapacityRemaining (uint _batteryID) public view returns (uint) {
      uint remaining = batteries[_batteryID].capacity -  batteries[_batteryID].currentFilled;
      if(remaining < 0){
          return 0;
      }
      return remaining;
  }

  function getBatteryChargeRate (uint _batteryID) public view returns (uint) {
      return batteries[_batteryID].chargeRate;
  }

  function changeAdmin (address _newAdminAddress, bool _adminStatus) public
  isOwnerModifier
  {
      admins[_newAdminAddress] = _adminStatus;
      if(_adminStatus==true){
          numAdmins++;
      }else{
          numAdmins--;
      }
      emit LogChangeAdmin(_newAdminAddress, _adminStatus);
  }



  /// destroy the contract and reclaim the leftover funds.
    // function kill() public {
    //     require(msg.sender == owner);
    //     selfdestruct(msg.sender);
    // }




}
