pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";

// battery investment contract
contract BatteryInvestment {

  address public VirtualPowerPlantAddress;
  uint public totalInvestment;
  struct Investment {
    uint timestamp; // timestamp of their investment
    uint investmentAmount; //how much they have invested in the transaction
  }

  mapping(address => Investment[]) public investors;
  mapping (address => uint) public pendingWithdrawals;

  event LogNewInvestment(address investorAddress, uint investmentAmount);
  event LogWithdrawalMade(address investorAddress, uint withdrawalAmount);

  modifier enoughInvestmentModifier() { require(msg.value > 0, "Attach an investment value"); _; }

  constructor (address _VirtualPowerPlantAddress) public {
      VirtualPowerPlantAddress = _VirtualPowerPlantAddress;
  }

  function () external{
        revert();
    }

  function updateTotalInvestment (uint _totalInvestment) public {
      totalInvestment = _totalInvestment;
  }

  function investMoney () payable external
  enoughInvestmentModifier
  {
      uint investAmount = msg.value;
      investors[msg.sender].push(Investment({timestamp: now, investmentAmount: investAmount}));
      totalInvestment += investAmount;
      emit LogNewInvestment(msg.sender, investAmount);
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


}
