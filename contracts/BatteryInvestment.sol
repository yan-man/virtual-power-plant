pragma solidity >=0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./VirtualPowerPlant.sol";

/// @author Yan Man
/// @title Manage energy investments for Virtual Power Plant
contract BatteryInvestment {
  using SafeMath for uint256;

  // Type declarations
  // Contract which deployed this one
  VirtualPowerPlant internal VirtualPowerPlantContract;
  address public virtualPowerPlantAddress;
  // defines an investment
  struct Investment {
    address investorAddress; // address of investor
    uint256 timestamp; // timestamp of their investment
    uint256 investmentAmount; // in wei
  }
  // State variables
  uint256 public totalInvestment; // total investment (without accounting for purchases)
  uint256 public remainingInvestment; // remaining investment (total investment - battery purchases)
  uint256 public dividendPercentage; // percentage of remaining investment money allowed to be used for dividends
  uint256 public investmentPercentage = 3; // percentage of total investment which must remain for a dividend to be triggered
  // already-triggered dividends an investor can retrieve
  // pendingTotalWithdrawals[0]: original amount of dividends for the period.
  // must reset to 0 to allow next dividend cycle to be triggered. Keep track of
  // initial total dividend amount to calculate withdrawal amount for each investor
  // pendingTotalWithdrawals[1]: remaining withdrawal remaining for the dividend period
  uint256[2] public pendingTotalWithdrawals;
  uint256 public numInvestorsWithdraw = 0; // keep track of # of investors who have withdrawn during this dividend period
  address[] public investorsList; // list of investors for easier retrieval
  mapping(address => uint256) public numInvestorInvestments; // to account for how many investments made per investor
  mapping(address => uint256) public pendingWithdrawals; // pending withdrawals for each investor
  mapping(address => Investment[]) public investors; // to account for multiple investments per investor

  // Events
  event LogNewInvestment(address investorAddress, uint256 investmentAmount);
  event LogUser(address add);
  event LogWithdrawalMade(address investorAddress, uint256 withdrawalAmount);
  event LogPendingWithdrawalAdded(
    address investorAddress,
    uint256 pendingWithdrawalAmount
  );

  // Modifiers
  modifier enoughInvestmentModifier() {
    require(msg.value > 0, "Attach an investment value");
    _;
  }
  modifier isValidWithdrawalModifier(address investorAddress) {
    // check that withdrawal is allowed. Must have an investment, existing
    // withdrawals pending, and available funds for the withdrawal to proceed
    require(investors[investorAddress].length > 0, "Not a valid investor");
    require(
      pendingWithdrawals[investorAddress] > 0,
      "Address has no withdrawal amount"
    );
    require(
      pendingTotalWithdrawals[1] > pendingWithdrawals[investorAddress],
      "Error - no available funds"
    );
    _;
  }

  modifier isValidDividendTriggerModifier() {
    // dividend is only allowed if:
    // there is remaining investment amount
    // ensure remainingInvestment is within investmentPercentage of the total investment
    // pendingTotalWithdrawals is reset to 0
    require(remainingInvestment > 0, "No available dividends");
    require(
      remainingInvestment > (investmentPercentage * totalInvestment) / 100,
      "Must maintain a certain investment level in order to trigger dividend"
    );
    require(
      pendingTotalWithdrawals[0] == 0,
      "Still on previous dividend cycle"
    );
    _;
  }

  // confirm user calling contract is admin
  modifier isAdmin(address msgAddress) {
    require(VirtualPowerPlantContract.isAdmin(msgAddress) == true);
    _;
  }

  // contructor
  /// @param _virtualPowerPlantAddress address of parent contract
  /// @param _dividendPercentage set dividend percentage threshold
  constructor(address _virtualPowerPlantAddress, uint256 _dividendPercentage)
    public
  {
    dividendPercentage = _dividendPercentage;
    // create VirtualPowerPlant contract from parent contract address
    VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    virtualPowerPlantAddress = _virtualPowerPlantAddress;
    // initialize pendingTotalWithdrawals with 0 for initial period
    pendingTotalWithdrawals[0] = 0;
    pendingTotalWithdrawals[1] = 0;
  }

  // External functions
  /// @notice force alter remaining investment (admin override)
  /// @param _remainingInvestment remaining investment value
  /// @return whether var succesfully updated
  function updateRemainingInvestment(uint256 _remainingInvestment)
    external
    isAdmin(msg.sender)
    returns (bool)
  {
    remainingInvestment = _remainingInvestment;
    return (remainingInvestment == _remainingInvestment);
  }

  /// @notice invest eth into fund
  /// @dev must send ether to this function
  function investMoney() external payable enoughInvestmentModifier {
    // investment amount is value attached to function call
    uint256 investAmount = msg.value;
    // if investor has not had previous investor, add them to the list
    if (investors[msg.sender].length == 0) {
      investorsList.push(msg.sender);
    }
    // add investor struct to investor array
    investors[msg.sender].push(
      Investment({
        investorAddress: msg.sender,
        timestamp: now,
        investmentAmount: investAmount
      })
    );
    numInvestorInvestments[msg.sender] = numInvestorInvestments[msg.sender].add(
      1
    );
    // update the total amount of investment
    totalInvestment = totalInvestment.add(investAmount);
    // update the remaining amount of investment
    remainingInvestment = remainingInvestment.add(investAmount);

    emit LogNewInvestment(msg.sender, investAmount);
  }

  /// @notice withdraw dividend
  /// @dev receive eth
  function withdraw() external payable isValidWithdrawalModifier(msg.sender) {
    uint256 withdrawalAmount = pendingWithdrawals[msg.sender];
    // retrieve dividend amount for particular user
    pendingTotalWithdrawals[1] = pendingTotalWithdrawals[1].sub(
      withdrawalAmount
    );
    // Zero the pending refund before
    // sending to prevent re-entrancy attacks
    pendingWithdrawals[msg.sender] = 0;
    // increase the number of withdrawn dividends during current cycle
    numInvestorsWithdraw++;
    // if all investors have withdrawn their dividend, reset
    if (numInvestorsWithdraw == investorsList.length) {
      numInvestorsWithdraw = 0;
      pendingTotalWithdrawals[0] = 0;
      remainingInvestment = remainingInvestment.add(pendingTotalWithdrawals[1]);
    }
    msg.sender.transfer(withdrawalAmount);
    emit LogWithdrawalMade(msg.sender, withdrawalAmount);
  }

  /// @notice admin can trigger a dividend to be paid out to investors
  /// @return whether dividend triggered successfully
  function triggerDividend()
    external
    isAdmin(msg.sender)
    isValidDividendTriggerModifier
    returns (uint256)
  {
    // dividend to be divided up among investors during this cycle
    // a percentage of the remaining investment
    uint256 totalCurrentDividend = remainingInvestment.mul(dividendPercentage);
    totalCurrentDividend = totalCurrentDividend.div(100);
    // // zero out value first
    remainingInvestment = remainingInvestment.sub(totalCurrentDividend);
    // set both values in the pendingTotalWithdrawals array
    // for the amt to be withdrawn and total left
    pendingTotalWithdrawals[0] = totalCurrentDividend;
    pendingTotalWithdrawals[1] = totalCurrentDividend;
    return totalCurrentDividend;
  }

  /// @notice add withdrawals, transfer from outstanding dividend to each
  /// @notice individual investor
  /// @param currentAddress investor address for dividend
  function addPendingWithdrawals(address currentAddress)
    external
    isAdmin(msg.sender)
    returns (uint256)
  {
    // initialize current investor's summed investment amount
    uint256 totalCurrentInvestorAmt = 0;
    // loop through each investment made by current investor
    for (uint256 i = 0; i < investors[currentAddress].length; i++) {
      // require each investment was made by this investor
      require(investors[currentAddress][i].investorAddress == currentAddress);
      // sum up all investments made by current investor
      totalCurrentInvestorAmt = totalCurrentInvestorAmt.add(
        investors[currentAddress][i].investmentAmount
      );
    }
    // calculate dividend based on ratio of investments made to the total fund
    uint256 totalUserDividend = totalCurrentInvestorAmt.mul(
      pendingTotalWithdrawals[0]
    );
    totalUserDividend = totalUserDividend.div(totalInvestment);
    // add new dividend to what remains in investor's withdrawal pool
    pendingWithdrawals[currentAddress] = pendingWithdrawals[currentAddress].add(
      totalUserDividend
    );
    emit LogPendingWithdrawalAdded(
      currentAddress,
      pendingWithdrawals[currentAddress]
    );
    return totalUserDividend;
  }

  // External functions that are view

  /// getInvestorInvestment
  /// @notice retrieve investment amount for a particular investment, because
  /// @notice multiple are available per user, submit index too
  /// @param investorAddress investor address
  /// @param index of their investment (for multiple investments) else should be 0
  function getInvestorInvestment(address investorAddress, uint256 index)
    external
    view
    returns (uint256 returnInvestment)
  {
    returnInvestment = investors[investorAddress][index].investmentAmount;
  }

  /// getNumInvestorInvestment
  /// get how many investments made from that user address
  /// @param investorAddress investor address
  function getNumInvestorInvestment(address investorAddress)
    external
    view
    returns (uint256 numInvestments)
  {
    numInvestments = numInvestorInvestments[investorAddress];
  }

  /// getNumInvestorInvestment
  /// get how many investments made from that user address
  /// @param investorAddress investor address
  function getPendingWithdrawal(address investorAddress)
    external
    view
    returns (uint256 pendingWithdrawal)
  {
    pendingWithdrawal = pendingWithdrawals[investorAddress];
  }
}
