pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage energy investments for Virtual Power Plant
contract BatteryInvestment {

    // Type declarations
    struct Investment {
        uint timestamp; // timestamp of their investment
        uint investmentAmount; //how much they have invested in the transaction
    }
    // State variables
    address public VirtualPowerPlantAddress;
    uint public totalInvestment;
    mapping(address => Investment[]) public investors;
    mapping(address => uint) public pendingWithdrawals;

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);

    // Modifiers
    modifier enoughInvestmentModifier { require(msg.value > 0, "Attach an investment value"); _; }

    constructor (address _VirtualPowerPlantAddress) public {
        VirtualPowerPlantAddress = _VirtualPowerPlantAddress;
    }

    function () external{
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

    function updateTotalInvestment (uint _totalInvestment) public {
        totalInvestment = _totalInvestment;
    }

    function investMoney ()
        external
        payable
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
