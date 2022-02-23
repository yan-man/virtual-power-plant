pragma solidity >=0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/VirtualPowerPlant.sol";

contract TestVirtualPowerPlant {
  // Truffle will send the TestContract one Ether after deploying the contract.
  uint256 public initialBalance = 1 ether;
  VirtualPowerPlant virtualPowerPlant;

  // Events
  event LogVal(address[] admins);
  event LogAddress(address add);
  event LogNum(uint256 num);

  event Logbool(bool val);

  function beforeEach() public {
    virtualPowerPlant = VirtualPowerPlant(
      DeployedAddresses.VirtualPowerPlant()
    );
  }

  // function testInitialBalanceUsingDeployedContract() {
  //   // MyContract myContract = MyContract(DeployedAddresses.MyContract());
  //   // // perform an action which sends value to myContract, then assert.
  //   // myContract.send(...);
  // }

  function testAddBattery() public {
    virtualPowerPlant.addBattery(
      100,
      20,
      100000,
      0x7465737400000000000000000000000000000000000000000000000000000000,
      1000,
      20
    );
    // virtualPowerPlant.send(100000);

    // uint256 val = 1;
    // uint256 expected = 1;
    // address[] memory admins = virtualPowerPlant.getAdmin();
    // address[] memory yan;
    // address admin = admins[0];

    // (bool success, bytes memory data) = address(virtualPowerPlant).delegatecall(
    //   abi.encodeWithSignature("getUser()")
    // ); // now delegated to the admin user properly
    // emit Logbool(success);
    // address result = abi.decode(data, (address));

    // emit LogAddress(result);

    // // emit LogNum(numBatts);
    // emit LogVal(admins);
    // emit LogAddress(msg.sender);
    // emit LogAddress(address(this));
    // emit LogAddress(address(virtualPowerPlant));
    // emit LogAddress(DeployedAddresses.VirtualPowerPlant());

    // Assert.equal(getAdmin[0], yan[0], getAdmin[0]);

    // Assert.equal(1, 0, "wrong");

    // address(virtualPowerPlant).send();
    // (bool success2, bytes memory data2) = address(virtualPowerPlant)
    //   .delegatecall(
    //     abi.encodeWithSignature(
    //       "addBattery(uint256,uint256,uint256,bytes32,uint256,uint256)",
    //       100,
    //       20,
    //       2000000,
    //       "0x7465737400000000000000000000000000000000000000000000000000000000",
    //       200,
    //       200
    //     )
    //   );

    // emit Logbool(success2);

    // uint256 expected = 1;

    // Assert.equal(
    //   virtualPowerPlant.numBatteries(),
    //   expected,
    //   "Number of batteries should be 1"
    // );

    // (bool success3, bytes memory data3) = address(virtualPowerPlant)
    //   .delegatecall(
    //     abi.encodeWithSignature(
    //       "setAdmin(address, bool)",
    //       "0xeEfD94AE8052152C9764712D03bf1fb1ADE86B0A",
    //       true
    //     )
    //   );

    // uint256 result3 = abi.decode(data3, (uint256));

    // emit LogNum(result3);
    // emit Logbool(success3);

    // Assert.equal(admin, address(this), "correct");
    // Assert.equal(expected, expected, "fail");
  }

  // address result = abi.decode(data, (address));

  // function testInitialBalanceUsingDeployedContract() public {
  // uint256 expected = 0;

  // Assert.equal(
  //   virtualPowerPlant.numBatteries(),
  //   expected,
  //   "Number of batteries should initially be 0"
  // );
  // }

  // function testSetContractAddress() public {
  //   bool r;

  //   // We're basically calling our contract externally with a raw call, forwarding all available gas, with
  //   // msg.data equal to the throwing function selector that we want to be sure throws and using only the boolean
  //   // value associated with the message call's success
  //   (r, ) = address(this).call(
  //     abi.encodePacked(virtualPowerPlant.setContractAddress.selector)
  //   );
  //   Assert.isFalse(r, "If this is true, something is broken!");
  // }

  // function testInitialBalanceWithNewMetaCoin() public {
  //   MetaCoin meta = new MetaCoin();

  //   uint expected = 10000;

  //   Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }

  // function testThrowFunctions() public {
  //   bool r;

  //   // We're basically calling our contract externally with a raw call, forwarding all available gas, with
  //   // msg.data equal to the throwing function selector that we want to be sure throws and using only the boolean
  //   // value associated with the message call's success
  //   (r, ) = address(this).call(abi.encodePacked(this.IThrow1.selector));
  //   Assert.isFalse(r, "If this is true, something is broken!");

  //   (r, ) = address(this).call(abi.encodePacked(this.IThrow2.selector));
  //   Assert.isFalse(r, "What?! 1 is equal to 10?");
  // }

  // function IThrow1() public pure {
  //   revert("I will throw");
  // }

  // function IThrow2() public pure {
  //   require(1 == 10, "I will throw, too!");
  // }
}
