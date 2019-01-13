const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

/// @author Yan Man
/// @title Test functionality for VirtualPowerPlant contract & other deployed contracts
contract('VirtualPowerPlant', function(accounts) {

    // when true, will show additional info within tests. Set to false otherwise
    const showConsoleLog = true;

    const virtualPowerPlantOwner = accounts[0];  // by default, deployer of contract
    const virtualPowerPlantAdmin = accounts[1]; // set to admin
    // set of investors
    const investor1 = accounts[2];
    const investor2 = accounts[3];
    const investor3 = accounts[4];
    const investor4 = accounts[5];

    // sample investment amounts in wei
    let investmentAmount1 = 10e6;
    let investmentAmount2 = 15e6;
    let investmentAmount3 = 5e6;
    let investmentAmount4 = 8e6;

    // battery characteristics to add
    let battery1 = {
        capacity: 100,
        currentFilled: 20,
        cost: 13e5,
        serialNumber: "0x1",
        priceThreshold: 7e3,
        chargeRate: 4
    }

    let battery2 = {
        capacity: 110,
        currentFilled: 25,
        cost: 12e5,
        serialNumber: "0x2",
        priceThreshold: 10e3,
        chargeRate: 6
    }

    let battery3 = {
        capacity: 90,
        currentFilled: 22,
        cost: 11e5,
        serialNumber: "0x3",
        priceThreshold: 5e3,
        chargeRate: 8
    }

    let battery4 = {
        capacity: 80,
        currentFilled: 30,
        cost: 10e5,
        serialNumber: "0x4",
        priceThreshold: 4e3,
        chargeRate: 20
    }

    let battery5 = {
        capacity: 70,
        currentFilled: 26,
        cost: 9e5,
        serialNumber: "0x5",
        priceThreshold: 3e3,
        chargeRate: 11
    }

    // before each test, retrieve deployed contract addresses
    beforeEach(async () => {
        virtualPowerPlant = await VirtualPowerPlant.deployed();
        batteryInvestmentAddress = await (virtualPowerPlant.batteryInvestmentContract());
        batteryEnergyAddress = await (virtualPowerPlant.batteryEnergyContract());
        batteryInvestmentContract = await BatteryInvestment.at(batteryInvestmentAddress);
        batteryEnergyContract = await BatteryEnergy.at(batteryEnergyAddress);
    })

    // preliminary tests - check contract deployment is as expected
    it("1)...check VirtualPowerPlant owner address is correct", async() => {
        virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner(); // call public variable
        if(showConsoleLog){new Promise(() => console.log("VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck))};
        assert.equal(virtualPowerPlantOwner, virtualPowerPlantOwnerCheck, "Owner address does not match accounts[0] from ganache");
    });

    it("2)...check BatteryInvestment contract is deployed correctly", async() => {
        let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
        if(showConsoleLog){new Promise(() => console.log("BatteryInvestment address: " + batteryInvestmentAddress))};
        assert.equal(batteryInvestmentAddress, batteryInvestmentAddressCheck, "BatteryInvestment contract address incorrect");
    });

    it("3)...check BatteryEnergy contract is deployed correctly", async() => {
        let batteryEnergyAddressCheck = await batteryEnergyContract.address;
        if(showConsoleLog){new Promise(() => console.log("BatteryEnergy address: " + batteryEnergyAddress))};
        assert.equal(batteryEnergyAddress, batteryEnergyAddressCheck, "BatteryEnergy contract address incorrect");
    });

    it("4)...check VirtualPowerPlant Owner can set Admin", async() => {
        let adminsNumPre = await virtualPowerPlant.numAdmins();
        if(showConsoleLog){new Promise(() => console.log("Prior to setting admin, # admins = " + adminsNumPre))};
        await virtualPowerPlant.setAdmin(virtualPowerPlantAdmin, true, {from: virtualPowerPlantOwner});
        let adminsNum = await virtualPowerPlant.numAdmins();
        if(showConsoleLog){new Promise(() => console.log("After setting admin, # admins = " + adminsNum))};
        adminNumCheck = 2; // there should now two admins - owner + new admin
        assert.equal(adminsNum, adminNumCheck, "Admin was not added properly");
    });

    it("5)...check BatteryInvestment multiple investments from multiple investors", async() => {
        // test multiple investments, including multiple for a single investor
        await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount1});
        await batteryInvestmentContract.investMoney({from: investor2, value: investmentAmount2});
        await batteryInvestmentContract.investMoney({from: investor3, value: investmentAmount3});
        await batteryInvestmentContract.investMoney({from: investor4, value: investmentAmount4});
        await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount3});

        let totalInvestment = await batteryInvestmentContract.totalInvestment();
        checkInvestment = (
            investmentAmount1 +
            investmentAmount2 +
            investmentAmount3 +
            investmentAmount4 +
            investmentAmount3
        );
        if(showConsoleLog){new Promise(() => console.log("totalInvestment: " + totalInvestment))};
        assert.equal(totalInvestment, checkInvestment, "totalInvestment amount is incorrect");
    });

    it("6)...check BatteryInvestment investments were saved correctly", async() => {

        let investorAmountTest = await batteryInvestmentContract.getInvestorInvestment(investor1, 1);
        if(showConsoleLog){new Promise(() => console.log("First investor's second investorAmount: " + investorAmountTest))};
        assert.equal(investorAmountTest, investmentAmount3, "Investment amount is incorrect");
    });

    it("7)...check Admin can add 5 batteries to virtualPowerPlant", async() => {

        await virtualPowerPlant.addBattery(
            battery1.capacity,
            battery1.currentFilled,
            battery1.cost,
            battery1.serialNumber,
            battery1.priceThreshold,
            battery1.chargeRate,
            {from: virtualPowerPlantAdmin}
        );
        await virtualPowerPlant.addBattery(
            battery2.capacity,
            battery2.currentFilled,
            battery2.cost,
            battery2.serialNumber,
            battery2.priceThreshold,
            battery2.chargeRate,
            {from: virtualPowerPlantOwner}
        );
        await virtualPowerPlant.addBattery(
            battery3.capacity,
            battery3.currentFilled,
            battery3.cost,
            battery3.serialNumber,
            battery3.priceThreshold,
            battery3.chargeRate,
            {from: virtualPowerPlantOwner}
        );
        await virtualPowerPlant.addBattery(
            battery4.capacity,
            battery4.currentFilled,
            battery4.cost,
            battery4.serialNumber,
            battery4.priceThreshold,
            battery4.chargeRate,
            {from: virtualPowerPlantOwner}
        );
        await virtualPowerPlant.addBattery(
            battery5.capacity,
            battery5.currentFilled,
            battery5.cost,
            battery5.serialNumber,
            battery5.priceThreshold,
            battery5.chargeRate,
            {from: virtualPowerPlantOwner}
        );
        let numBatteries = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("numBatteries after adding batteries: " + numBatteries))};
        let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
        if(showConsoleLog){new Promise(() => console.log("remainingInvestment after battery purchases: " + remainingInvestment))};
        assert.equal(numBatteries, 5, "Batteries not added properly");
    });

    it("8)...check that Admin can decommission battery", async() => {
        let removeIndex = 2; // index of battery to decommission
        let numBatteries1 = await virtualPowerPlant.numBatteries();
        await virtualPowerPlant.decommissionBattery(removeIndex, {from: virtualPowerPlantOwner});
        let numBatteries2 = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("numBatteries went from: " + numBatteries1 + " to " + numBatteries2))};
        let newMapIndex = await virtualPowerPlant.getBatteryMapIndex(numBatteries2);
        if(showConsoleLog){new Promise(() => console.log("newMapIndex of the last element in Batteries array, replacing the decommissioned index at " + removeIndex + ": " + newMapIndex))};

        let newBatteryMapping = await virtualPowerPlant.batteryMapping(removeIndex);
        if(showConsoleLog){new Promise(() => console.log("newBatteryMapping at replaced index should be the last battery which was moved there (4): " + newBatteryMapping))};
        assert.equal(removeIndex, newMapIndex, "The index removed should match the updated map index of the last element");

        numBatts = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("Number of batteries after decommission: " + numBatts))};
        assert.equal(numBatts, 4, "After decommission, # of batteries should decrease by 1");
    });

    it("9)...charge the array of batteries", async() => {

        let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
        if(showConsoleLog){new Promise(() => console.log("Initial remainingInvestment: " + remainingInvestment))};

        batteryCapacityRemaining11 = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery1: " + batteryCapacityRemaining11))};
        batteryCapacityRemaining12 = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery2: " + batteryCapacityRemaining12))};
        batteryCapacityRemaining13 = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery3: " + batteryCapacityRemaining13))};
        batteryCapacityRemaining14 = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery4: " + batteryCapacityRemaining14))};
        batteryCapacityRemaining15 = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery5: " + batteryCapacityRemaining15))};

        checkBatteryEnergyTX = await batteryEnergyContract.checkBatteryEnergy({from: virtualPowerPlantAdmin});
        let remainingInvestment2 = await batteryInvestmentContract.remainingInvestment();
        new Promise(() => console.log("remainingInvestment after energy transactions for charging/discharging: " + remainingInvestment2));

        batteryCapacityRemaining21 = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery1: " + batteryCapacityRemaining21))};
        batteryCapacityRemaining22 = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery2: " + batteryCapacityRemaining22))};
        batteryCapacityRemaining23 = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery3: " + batteryCapacityRemaining23))};
        batteryCapacityRemaining24 = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery4: " + batteryCapacityRemaining24))};
        batteryCapacityRemaining25 = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery5: " + batteryCapacityRemaining25))};

        let remainingInvestmentExpected = (
            remainingInvestment
            - (5e3 * battery1.chargeRate)
            - (5e3 * battery2.chargeRate)
            + (5e3 * battery4.chargeRate)
            + (5e3 * battery5.chargeRate)
        );

        assert.equal(remainingInvestment2, remainingInvestmentExpected, "Total transaction remaining amount should equal");
    });

    it("10)...trigger dividend and withdraw for multiple investors", async() => {
        let totalInvestment = await batteryInvestmentContract.totalInvestment();
        let remainingInvestmentInitial = await batteryInvestmentContract.remainingInvestment();
        await batteryInvestmentContract.triggerDividend({from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("remainingInvestment after dividends: " + remainingInvestmentInitial))};

        let pendingTotalWithdrawals = await batteryInvestmentContract.pendingTotalWithdrawals(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals0: " + pendingTotalWithdrawals))};
        let pendingTotalWithdrawals2 = await batteryInvestmentContract.pendingTotalWithdrawals(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals1: " + pendingTotalWithdrawals2))};
        //
        // let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
        // if(showConsoleLog){new Promise(() => console.log("remainingInvestment after dividends: " + remainingInvestment))};
        //
        // let totalDividendExpected = (2 * remainingInvestmentInitial)/100;
        // if(showConsoleLog){new Promise(() => console.log("totalDividend: " + totalDividendExpected))};
        // assert.equal(totalDividendExpected, pendingTotalWithdrawals, "Total withdrawable dividends incorrect");

        await batteryInvestmentContract.addPendingWithdrawals(investor1, {from: virtualPowerPlantAdmin});
        await batteryInvestmentContract.addPendingWithdrawals(investor2, {from: virtualPowerPlantAdmin});
        await batteryInvestmentContract.addPendingWithdrawals(investor3, {from: virtualPowerPlantAdmin});

        let pendingWithdrawal1 = await batteryInvestmentContract.pendingWithdrawals(investor1);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal1: " + pendingWithdrawal1))};

        let pendingWithdrawal2 = await batteryInvestmentContract.pendingWithdrawals(investor2);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal2: " + pendingWithdrawal2))};

        let pendingWithdrawal3 = await batteryInvestmentContract.pendingWithdrawals(investor3);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal3: " + pendingWithdrawal3))};

        // await batteryInvestmentContract.triggerDividend({from: virtualPowerPlantAdmin});

        let balance1 = await web3.eth.getBalance(investor2);
        let withdrawTX1 = await batteryInvestmentContract.withdraw({from: investor2});
        let balance2 = await web3.eth.getBalance(investor2);

        pendingWithdrawal2 = await batteryInvestmentContract.pendingWithdrawals(investor2);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal2: " + pendingWithdrawal2))};


        let tx = await web3.eth.getTransaction(withdrawTX1.tx);
        let gasPrice = tx.gasPrice;
        let gasUsed = withdrawTX1.receipt.gasUsed;
        let gasCost = (gasPrice * gasUsed);

        balance1 = balance1.toString(10);
        balance2 = balance2.toString(10);

        // balance1 - balance2 - gasCost

        // balance2 = (balance2) + gasCost;

        console.log(gasCost);
        // let total = balance2 - balance1 +
        console.log(balance1 - balance2 - gasCost);
        // console.log(balance2);

        // pendingTotalWithdrawals = await batteryInvestmentContract.pendingTotalWithdrawals(1, {from: virtualPowerPlantAdmin});
        // if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals: " + pendingTotalWithdrawals))};
        // pendingTotalWithdrawals = await batteryInvestmentContract.pendingTotalWithdrawals(0, {from: virtualPowerPlantAdmin});
        // if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals: " + pendingTotalWithdrawals))};

        // let balance3 = await web3.eth.getBalance(investor1);
        // let withdrawTX2 = await batteryInvestmentContract.withdraw({from: investor1});
        // let balance4 = await web3.eth.getBalance(investor1);
        //
        // pendingTotalWithdrawals = await batteryInvestmentContract.pendingTotalWithdrawals({from: virtualPowerPlantAdmin});
        // if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals: " + pendingTotalWithdrawals))};




        // let expectedInvestor1Dividends = Math.ceil(((investmentAmount1 + investmentAmount3) * pendingTotalWithdrawals) / (totalInvestment));
        // let expectedInvestor2Dividends = Math.ceil((investmentAmount2 * pendingTotalWithdrawals) / (totalInvestment));
        // let expectedInvestor3Dividends = Math.ceil((investmentAmount3 * pendingTotalWithdrawals) / (totalInvestment));
        // let expectedInvestor4Dividends = Math.ceil((investmentAmount4 * pendingTotalWithdrawals) / (totalInvestment));
        //
        //
        //
        // if(showConsoleLog){new Promise(() => console.log("Expected dividends for investor1: " + expectedInvestor1Dividends))};
        // // assert.equal(30, expectedInvestor1Dividends, "Dividend for investor1 incorrect");
        //
        // if(showConsoleLog){new Promise(() => console.log("Expected dividends for investor2: " + expectedInvestor2Dividends))};
        // // assert.equal(pendingWithdrawals1, expectedInvestor1Dividends, "Dividend for investor1 incorrect");
        //
        // if(showConsoleLog){new Promise(() => console.log("Expected dividends for investor2: " + expectedInvestor3Dividends))};
        // if(showConsoleLog){new Promise(() => console.log("Expected dividends for investor2: " + expectedInvestor4Dividends))};
    });




    // it("...trigger dividend and withdraw for multiple investors", async() => {
    //     let totalInvestment = await batteryInvestmentContract.totalInvestment();
    //     // let remainingInvestmentInitial = await batteryInvestmentContract.remainingInvestment();
    //     await batteryInvestmentContract.triggerDividend({from: virtualPowerPlantAdmin});
    //     // let pendingWithdrawals1 = await batteryInvestmentContract.pendingWithdrawals(investor1, {from: virtualPowerPlantAdmin});
    //     // let pendingWithdrawals2 = await batteryInvestmentContract.pendingWithdrawals(investor2, {from: virtualPowerPlantAdmin});
    //     // let pendingWithdrawals3 = await batteryInvestmentContract.pendingWithdrawals(investor3, {from: virtualPowerPlantAdmin});
    //     // let pendingWithdrawals4 = await batteryInvestmentContract.pendingWithdrawals(investor4, {from: virtualPowerPlantAdmin});
    //     let pendingTotalWithdrawals = await batteryInvestmentContract.pendingTotalWithdrawals({from: virtualPowerPlantAdmin});
    //     // if(showConsoleLog){new Promise(() => console.log("pendingWithdrawals investor1: " + pendingWithdrawals1))};
    //     // if(showConsoleLog){new Promise(() => console.log("pendingWithdrawals investor2: " + pendingWithdrawals2))};
    //     // if(showConsoleLog){new Promise(() => console.log("pendingWithdrawals investor3: " + pendingWithdrawals3))};
    //     // if(showConsoleLog){new Promise(() => console.log("pendingWithdrawals investor4: " + pendingWithdrawals4))};
    //
    //     if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals: " + pendingTotalWithdrawals))};
    //
    //     let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
    //     if(showConsoleLog){new Promise(() => console.log("remainingInvestment after dividends: " + remainingInvestment))};
    //
    //     assert.equal(87, pendingTotalWithdrawals, "Dividend for investor1 incorrect");
    //
    //     // let totalDividend = (2 * remainingInvestment)/100;
    //     // let expectedInvestor1Dividends = Math.ceil(((investmentAmount1 + investmentAmount3) * totalDividend) / (totalInvestment));
    //     //
    //     // if(showConsoleLog){new Promise(() => console.log("Expected dividends for investor1: " + expectedInvestor1Dividends))};
    //     // assert.equal(pendingWithdrawals1, expectedInvestor1Dividends, "Dividend for investor1 incorrect");
    // });
    //
    // it("...retrieve funds from withdrawal", async() => {
    //
    //     let totalInvestment = await batteryInvestmentContract.totalInvestment();
    //
    //     let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
    //     let totalDividend = (2 * remainingInvestment)/100;
    //     let expectedInvestor2Dividends = Math.ceil(((investmentAmount2) * totalDividend) / (totalInvestment));
    //
    //     if(showConsoleLog){new Promise(() => console.log("pendingWithdrawals investor2: " + expectedInvestor2Dividends))};
    //
    //     let balance1 = await web3.eth.getBalance(investor2);
    //     let withdrawTX = await batteryInvestmentContract.withdraw({from: investor2});
    //     let balance2 = await web3.eth.getBalance(investor2);
    //     // if(showConsoleLog){new Promise(() => console.log(balance1))}; // because you get a BigNumber);
    //     // if(showConsoleLog){new Promise(() => console.log(balance2))}; // because you get a BigNumber);
    //     // if(showConsoleLog){new Promise(() => console.log(withdrawTX))}; // because you get a BigNumber);
    //
    // });
    //
    // it("...retrieve funds from withdrawal", async() => {
    //
    //
    //     // let balance1 = await web3.eth.getBalance(investor1);
    //     // let withdrawTX = await batteryInvestmentContract.withdraw({from: investor1});
    //     // let balance2 = await web3.eth.getBalance(investor1);
    //     // if(showConsoleLog){new Promise(() => console.log(balance1))}; // because you get a BigNumber);
    //     // if(showConsoleLog){new Promise(() => console.log(balance2))}; // because you get a BigNumber);
    //     // if(showConsoleLog){new Promise(() => console.log(withdrawTX))}; // because you get a BigNumber);
    //
    //
    //
    //
    //
    //     // BALANCE BEFORE TX
    //     var balanceBefore = await web3.eth.getBalance(investor1);
    //     balanceBefore = web3.utils.fromWei(balanceBefore, 'wei');
    //     // balanceBefore = balanceBefore.toString(10);
    //     console.log(balanceBefore);
    //     // console.log(b);
    //
    //     // let hash = await contract.buy.sendTransaction({from: investor1});
    //     let hash = await batteryInvestmentContract.withdraw({from: investor1});
    //     //
    //     // // BALANCE AFTER TX
    //     var balanceAfter = await (web3.eth.getBalance(investor1));
    //     balanceAfter = web3.utils.fromWei(balanceAfter, 'wei');
    //     // balanceAfter = balanceAfter.toString(10);
    //     console.log(balanceAfter);
    //     //
    //     //
    //     //
    //     let tx = await web3.eth.getTransaction(hash.tx);
    //     // // console.log(tx.gasPrice);
    //     // // console.log(hash.receipt.gasUsed);
    //     //
    //     let gasPrice = tx.gasPrice;
    //     let gasUsed = hash.receipt.gasUsed;
    //     let gasCost = (gasPrice * gasUsed);
    //
    //     console.log(gasCost);
    //     //
    //     let total = (balanceAfter - balanceBefore);
    //     console.log(total);
    //
    //     // const receipt = await hash.receipt;
    //     // console.log(receipt);
    //     // const gasCost = tx.gasPrice.mul(receipt.gasUsed);
    //     // console.log("BEFORE", balanceBefore.toNumber());
    //     // console.log("gas price", tx.gasPrice.toNumber());
    //     // console.log("gas used", gasUsed);
    //     // console.log("gas cost", gasCost.toNumber());
    //     // console.log("AFTER", balanceAfter.toNumber());
    //     // console.log("CHECKSUM", balanceAfter.add(gasCost).add(amount).toNumber());
    //
    // });

});
