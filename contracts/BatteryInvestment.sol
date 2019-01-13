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
    uint withdrawalCounter = 0;
    uint public totalInvestment; // called internally and allow External
    uint public remainingInvestment;  // ""
    uint public dividendPercentage = 2; // ""
    uint[] public pendingTotalWithdrawals; // internal
    // uint public totalCurrentDividend;
    uint public numInvestorsWithdraw = 0;
    address[] public investorsList;
    mapping(address => uint) public pendingWithdrawals;  //
    mapping(address => Investment[]) public investors;  // to account for multiple investments per investor

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogPendingWithdrawalAdded (address investorAddress, uint pendingWithdrawalAmount);

    // Modifiers
    modifier enoughInvestmentModifier { require(msg.value > 0, "Attach an investment value"); _; }
    modifier isValidWithdrawalModifier (address investorAddress) {
        require(investors[investorAddress].length > 0, "Not a valid investor");
        require(pendingWithdrawals[investorAddress] > 0, "Address has no withdrawal amount");
        require(pendingTotalWithdrawals[1] > pendingWithdrawals[investorAddress], "Error - no available funds");
        _;
    }
    modifier isValidDividendTriggerModifier {
        require(VirtualPowerPlantContract.isAdmin() == true);
        require(remainingInvestment > 0, "No available dividends");
        require(pendingTotalWithdrawals[0] == 0, "Still on previous dividend cycle");
    }


    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
        pendingTotalWithdrawals.push(0);
        pendingTotalWithdrawals.push(0);
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

    function withdraw () external payable isValidWithdrawalModifier(msg.sender) {

        // require(investors[msg.sender].length > 0, "not a valid investor");
        // require(pendingWithdrawals[msg.sender] > 0, "Address has no withdrawal amount");
        // require(pendingTotalWithdrawals[1] > pendingWithdrawals[msg.sender]);

        uint withdrawalAmount = pendingWithdrawals[msg.sender];
        pendingTotalWithdrawals[1] -= withdrawalAmount;
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        numInvestorsWithdraw++;
        if(numInvestorsWithdraw == investorsList.length){
            numInvestorsWithdraw = 0;
            pendingTotalWithdrawals[0] = 0;
            remainingInvestment += pendingTotalWithdrawals[1];
        }
        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawalMade(msg.sender, withdrawalAmount);
        // return true;
    }

    function triggerDividend () external returns (bool) {
        require(VirtualPowerPlantContract.isAdmin() == true);
        require(remainingInvestment > 0, "No available dividends");
        require(pendingTotalWithdrawals[0] == 0, "Still on previous dividend cycle");
        uint totalCurrentDividend = (remainingInvestment * dividendPercentage) / (100);
        remainingInvestment -= totalCurrentDividend;
        pendingTotalWithdrawals[0] = (totalCurrentDividend);
        pendingTotalWithdrawals[1] = (totalCurrentDividend);
        return true;
    }

    // event LogTest (uint index, uint investmentAmount);

    function addPendingWithdrawals (address currentAddress) external returns (uint) {

        require(VirtualPowerPlantContract.isAdmin() == true);

        // for (uint outer = 0; outer < investorsList.length; outer++) {
        // address currentAddress = investorsList[outer];
        uint totalCurrentInvestorAmt = 0;
        for (uint i = 0; i < investors[currentAddress].length; i++) {
            require(investors[currentAddress][i].investorAddress == currentAddress);
            totalCurrentInvestorAmt += investors[currentAddress][i].investmentAmount;
            // emit LogTest(outer, totalCurrentInvestorAmt);
        }
        uint totalUserDividend = (pendingTotalWithdrawals[0] * totalCurrentInvestorAmt) / (totalInvestment);
        // pendingTotalWithdrawals[1] += totalUserDividend;
        pendingWithdrawals[currentAddress] += totalUserDividend;
        emit LogPendingWithdrawalAdded(currentAddress, pendingWithdrawals[currentAddress]);
        // }
        return totalUserDividend;
    }

    // function getPendingWithdrawal (address currentAddress) external returns (uint) {
    //
    //     return pendingWithdrawals[currentAddress].investmentAmount
    //
    //     // for (uint outer = 0; outer < investorsList.length; outer++) {
    //     // address currentAddress = investorsList[outer];
    //     uint totalCurrentInvestorAmt = 0;
    //     for (uint i = 0; i < investors[currentAddress].length; i++) {
    //         require(investors[currentAddress][i].investorAddress == currentAddress);
    //         totalCurrentInvestorAmt += investors[currentAddress][i].investmentAmount;
    //         // emit LogTest(outer, totalCurrentInvestorAmt);
    //     }
    //     uint totalUserDividend = (pendingTotalWithdrawals * totalCurrentInvestorAmt) / (totalInvestment);
    //     // pendingTotalWithdrawals -= totalUserDividend;
    //     pendingWithdrawals[currentAddress] += totalUserDividend;
    //     emit LogPendingWithdrawalAdded(currentAddress, pendingWithdrawals[currentAddress]);
    //     // }
    //     return totalUserDividend;
    // }

}
