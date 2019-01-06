pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage energy investments for Virtual Power Plant
contract BatteryInvestment {

    // Type declarations
    // VirtualPowerPlant internal VirtualPowerPlantContract;
    struct Investment {
        address investorAddress; // address of investor
        uint timestamp; // timestamp of their investment
        uint investmentAmount; // how much invested
    }
    // State variables
    address public virtualPowerPlantAddress; // internal
    // uint public temp = 5;
    uint public totalInvestment; // called internally and allow External
    uint public remainingInvestment;  // ""
    uint public dividendPercentage; // ""
    uint public pendingTotalWithdrawals; // internal
    address[] public investorsList;
    mapping(address => uint) public pendingWithdrawals;  //
    mapping(address => Investment[]) public investors;  // to account for multiple investments per investor

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogPendingWithdrawalAdded (address investorAddress, uint pendingWithdrawalAmount);

    // Modifiers
    modifier enoughInvestmentModifier { require(msg.value > 0, "Attach an investment value"); _; }

    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        // VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    }

    function () external{
        revert("Fallback function");
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

    function updateRemainingInvestment (uint _remainingInvestment) external returns (bool) {
        remainingInvestment = _remainingInvestment;
        return true;
    }

    function investMoney ()
        external
        payable
        enoughInvestmentModifier
    {
        uint investAmount = msg.value;
        investors[msg.sender].push(Investment({investorAddress: msg.sender, timestamp: now, investmentAmount: investAmount}));
        investorsList.push(msg.sender);
        // investors[msg.sender]ot += investAmount;
        totalInvestment += investAmount;
        remainingInvestment += investAmount;
        emit LogNewInvestment(msg.sender, investAmount);
    }

    function withdraw () external payable {
        require(pendingWithdrawals[msg.sender] > 0, "Address has no withdrawal amount");
        uint withdrawalAmount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawalMade(msg.sender, withdrawalAmount);
    }

    function triggerDividend () external returns (bool) {
        require(remainingInvestment > 0, "No available dividends");
        uint totalDividend = (remainingInvestment * dividendPercentage) / (100);
        pendingTotalWithdrawals += totalDividend;
        return addPendingWithdrawals();
    }

    function addPendingWithdrawals () internal returns (bool) {

        for (uint outer = 0; outer < investorsList.length; outer++) {
            address currentAddress = investorsList[outer];
            uint totalCurrentInvestorAmt;
            for (uint i = 0; i < investors[currentAddress].length; i++) {
                totalCurrentInvestorAmt += investors[currentAddress][i].investmentAmount;
            }
            uint totalUserDividend = (pendingTotalWithdrawals * totalCurrentInvestorAmt) / (totalInvestment);
            pendingWithdrawals[currentAddress] += totalUserDividend;
            pendingTotalWithdrawals -= totalUserDividend;
            emit LogPendingWithdrawalAdded(currentAddress, totalUserDividend);
        }
        return true;
    }

}
