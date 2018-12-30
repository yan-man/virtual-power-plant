pragma solidity >=0.5.0;

contract BatteryInvestment {

  address public owner;

  uint public totalInvestment;
  struct Investment {
    uint timestamp; // timestamp of their investment
    uint investmentAmount; //how much they have invested in the transaction
  }
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
      bool active;
  }
  mapping(address => Investment[]) public investors;
  mapping (address => uint) public pendingWithdrawals;
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
      require(totalInvestment >= _cost, "Capacity must exceed amount filled");
      require(_priceThreshold >= 0, "Must have a valid price threshold");
      _;
  }

  constructor () public {
      owner = msg.sender;
      admins[msg.sender] = true;
  }

  function () external{
        revert();
    }

  function investMoney () payable external
  enoughInvestmentModifier
  {
      uint investAmount = msg.value;
      investors[msg.sender].push(Investment({timestamp: now, investmentAmount: investAmount}));
      totalInvestment += investAmount;
      emit LogNewInvestment(msg.sender, investAmount);
  }

//   function getAllBatteries() public returns(Battery[] batteries){
//   }

  function addBattery (uint _capacity, uint _currentFilled, uint _cost, string memory _serialNumber, uint _priceThreshold) public
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
          active: true
      }));
      batteryID = numBatteries++;
    //   numBatteries++;
      totalInvestment -= _cost;
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

  function getBatteryIDs() public view returns (uint) {
      return batteries.length;
  }

  function getBatteryCapacityRemaining (uint _batteryID) public view returns (uint) {
      uint remaining = batteries[_batteryID].capacity -  batteries[_batteryID].currentFilled;
      if(remaining < 0){
          return 0;
      }
      return remaining;
  }


  // function that returns entire array
//   function getBattery(uint _batteryID) public returns (uint) {
//       return batteries[_batteryID];
//   }

//   function (<parameter types>) {internal|external} [pure|view|payable] [returns (<return types>)]

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

  function withdraw() public payable {
        require(pendingWithdrawals[msg.sender] > 0, "Address has no withdrawal amount");
        uint withdrawalAmount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawalMade(msg.sender, withdrawalAmount);
    }

  /// destroy the contract and reclaim the leftover funds.
    // function kill() public {
    //     require(msg.sender == owner);
    //     selfdestruct(msg.sender);
    // }




}
