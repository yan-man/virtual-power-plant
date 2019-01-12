pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage energy investments for Virtual Power Plant
contract BatteryInvestment {

    // Type declarations
    VirtualPowerPlant internal VirtualPowerPlantContract;
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
    uint public dividendPercentage = 2; // ""
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
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
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

    function getInvestorInvestment (address investorAddress, uint index)
        external
        view
        returns (uint returnInvestment)
    {
        returnInvestment = investors[investorAddress][index].investmentAmount;
    }

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
        if(investors[msg.sender].length == 0){
            investorsList.push(msg.sender);
        }
        investors[msg.sender].push(Investment({investorAddress: msg.sender, timestamp: now, investmentAmount: investAmount}));
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
        // return true;
    }

    function triggerDividend () external returns (bool) {
        require(VirtualPowerPlantContract.isAdmin() == true);
        require(remainingInvestment > 0, "No available dividends");
        uint totalDividend = (remainingInvestment * dividendPercentage) / (100);
        remainingInvestment -= totalDividend;
        pendingTotalWithdrawals += totalDividend;
        return addPendingWithdrawals();
    }

    // event LogTest (uint index, uint investmentAmount);

    function addPendingWithdrawals () internal returns (bool) {

        for (uint outer = 0; outer < investorsList.length; outer++) {
            address currentAddress = investorsList[outer];
            uint totalCurrentInvestorAmt = 0;
            for (uint i = 0; i < investors[currentAddress].length; i++) {
                require(investors[currentAddress][i].investorAddress == currentAddress);
                totalCurrentInvestorAmt += investors[currentAddress][i].investmentAmount;
                // emit LogTest(outer, totalCurrentInvestorAmt);
            }
            uint totalUserDividend = (pendingTotalWithdrawals * totalCurrentInvestorAmt) / (totalInvestment);
            pendingTotalWithdrawals -= totalUserDividend;
            pendingWithdrawals[currentAddress] += totalUserDividend;
            emit LogPendingWithdrawalAdded(currentAddress, pendingWithdrawals[currentAddress]);
        }
        uint tempPendingTotalWithdrawals = pendingTotalWithdrawals;
        pendingTotalWithdrawals = 0;
        remainingInvestment += tempPendingTotalWithdrawals;
        return true;
    }

}
