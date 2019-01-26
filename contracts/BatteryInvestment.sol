pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage energy investments for Virtual Power Plant
contract BatteryInvestment {

    // Type declarations
    // Contract which deployed this one
    VirtualPowerPlant internal VirtualPowerPlantContract;
    // defines an investment
    struct Investment {
        address investorAddress; // address of investor
        uint timestamp; // timestamp of their investment
        uint investmentAmount; // in wei
    }
    // State variables
    uint public totalInvestment; // total investment (without accounting for purchases)
    uint public remainingInvestment;  // remaining investment (total investment - battery purchases)
    uint public dividendPercentage; // percentage of remaining investment money allowed to be used for dividends
    uint public investmentPercentage = 3; // percentage of total investment which must remain for a dividend to be triggered
    // already-triggered dividends an investor can retrieve
    // pendingTotalWithdrawals[0]: original amount of dividends for the period.
    // must reset to 0 to allow next dividend cycle to be triggered. Keep track of
    // initial total dividend amount to calculate withdrawal amount for each investor
    // pendingTotalWithdrawals[1]: remaining withdrawal remaining for the dividend period
    uint[] public pendingTotalWithdrawals;
    uint public numInvestorsWithdraw = 0; // keep track of # of investors who have withdrawn during this dividend period
    address[] public investorsList; // list of investors for easier retrieval
    mapping(address => uint) public pendingWithdrawals;  // pending withdrawals for each investor
    mapping(address => Investment[]) public investors;  // to account for multiple investments per investor

    // Events
    event LogNewInvestment (address investorAddress, uint investmentAmount);
    event LogWithdrawalMade (address investorAddress, uint withdrawalAmount);
    event LogPendingWithdrawalAdded (address investorAddress, uint pendingWithdrawalAmount);

    // Modifiers
    modifier enoughInvestmentModifier { require(msg.value > 0, "Attach an investment value"); _; }
    modifier isValidWithdrawalModifier (address investorAddress) {
        // check that withdrawal is allowed. Must have an investment, existing
        // withdrawals pending, and available funds for the withdrawal to proceed
        require(investors[investorAddress].length > 0, "Not a valid investor");
        require(pendingWithdrawals[investorAddress] > 0, "Address has no withdrawal amount");
        require(pendingTotalWithdrawals[1] > pendingWithdrawals[investorAddress], "Error - no available funds");
        _;
    }

    modifier isValidDividendTriggerModifier {
        // dividend is only allowed if:
        // there is remaining investment amount
        // ensure remainingInvestment is within investmentPercentage of the total investment
        // pendingTotalWithdrawals is reset to 0
        require(remainingInvestment > 0, "No available dividends");
        require(remainingInvestment > (investmentPercentage * totalInvestment) / 100, "Must maintain a certain investment level in order to trigger dividend");
        require(pendingTotalWithdrawals[0] == 0, "Still on previous dividend cycle");
        _;
    }

    // confirm user calling contract is admin
    modifier isAdmin (address msgAddress) {
        require(VirtualPowerPlantContract.isAdmin(msgAddress) == true);
        _;
    }

    // contructor
    /// @param address of parent contract, set dividend percentage threshold
    constructor (address _virtualPowerPlantAddress, uint _dividendPercentage) public {
        dividendPercentage = _dividendPercentage;
        // create VirtualPowerPlant contract from parent contract address
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
        // initialize pendingTotalWithdrawals with 0 for initial period
        pendingTotalWithdrawals.push(0);
        pendingTotalWithdrawals.push(0);
    }

    // fallback function
    function () external{
        revert("Fallback function");
    }

    // External functions
    /// @notice alter remaining investment
    /// @param new remaining investment value
    /// @return whether var succesfully updated
    function updateRemainingInvestment (uint _remainingInvestment) external returns (bool) {
        remainingInvestment = _remainingInvestment;
        return true;
    }

    /// @notice invest eth into fund
    /// @dev must send ether to this function
    function investMoney ()
        external
        payable
        enoughInvestmentModifier
    {
        // investment amount is value attached to function call
        uint investAmount = msg.value;
        // if investor has not had previous investor, add them to the list
        if(investors[msg.sender].length == 0){
            investorsList.push(msg.sender);
        }
        // add investor struct to investor array
        investors[msg.sender].push(Investment({
            investorAddress: msg.sender,
            timestamp: now,
            investmentAmount: investAmount
        }));
        // update the total amount of investment
        totalInvestment += investAmount;
        // update the remaining amount of investment
        remainingInvestment += investAmount;
        emit LogNewInvestment(msg.sender, investAmount);
    }

    /// @notice withdraw dividend
    /// @dev receive eth
    function withdraw () external payable isValidWithdrawalModifier(msg.sender) {
        uint withdrawalAmount = pendingWithdrawals[msg.sender];
        // retrieve dividend amount for particular user
        pendingTotalWithdrawals[1] -= withdrawalAmount;
        // Zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        // increase the number of withdrawn dividends during current cycle
        numInvestorsWithdraw++;
        // if all investors have withdrawn their dividend, reset
        if(numInvestorsWithdraw == investorsList.length){
            numInvestorsWithdraw = 0;
            pendingTotalWithdrawals[0] = 0;
            remainingInvestment += pendingTotalWithdrawals[1];
        }
        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawalMade(msg.sender, withdrawalAmount);
    }

    /// @notice admin can trigger a dividend to be paid out to investors
    /// @return whether dividend triggered successfully
    function triggerDividend ()
        external
        isAdmin(msg.sender)
        isValidDividendTriggerModifier
        returns (bool)
    {
        // dividend to be divided up among investors during this cycle
        // a percentage of the remaining investment
        uint totalCurrentDividend = (remainingInvestment * dividendPercentage) / (100);
        // zero out value first
        remainingInvestment -= totalCurrentDividend;
        // set both values in the pendingTotalWithdrawals array
        pendingTotalWithdrawals[0] = (totalCurrentDividend);
        pendingTotalWithdrawals[1] = (totalCurrentDividend);
        return true;
    }

    /// @notice add withdrawals, transfer from outstanding dividend to each
    /// @notice individual investor
    /// @param investor address for dividend
    function addPendingWithdrawals (address currentAddress)
        external
        isAdmin(msg.sender)
        returns (uint)
    {
        // initialize current investor's summed investment amount
        uint totalCurrentInvestorAmt = 0;
        // loop through each investment made by current investor
        for (uint i = 0; i < investors[currentAddress].length; i++) {
            // require each investment was made by this investor
            require(investors[currentAddress][i].investorAddress == currentAddress);
            // sum up all investments made by current investor
            totalCurrentInvestorAmt += investors[currentAddress][i].investmentAmount;
        }
        // calculate dividend based on ratio of investments made to the total fund
        uint totalUserDividend = (pendingTotalWithdrawals[0] * totalCurrentInvestorAmt) / (totalInvestment);
        // add new dividend to what remains in investor's withdrawal pool
        pendingWithdrawals[currentAddress] += totalUserDividend;
        emit LogPendingWithdrawalAdded(currentAddress, pendingWithdrawals[currentAddress]);
        return totalUserDividend;
    }

    // External functions that are view
    /// @notice retrieve investment amount for a particular investment, because
    /// @notice multiple are available per user, submit index too
    /// @param investor address, index of their investment (for multiple investments)
    /// @param otherwise should be 0
    function getInvestorInvestment (address investorAddress, uint index)
        external
        view
        returns (uint returnInvestment)
    {
        returnInvestment = investors[investorAddress][index].investmentAmount;
    }


}
