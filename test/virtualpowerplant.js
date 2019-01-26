const VirtualPowerPlant = artifacts.require("VirtualPowerPlant");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

/// @author Yan Man
/// @title Test functionality for VirtualPowerPlant contract & other deployed contracts
contract('VirtualPowerPlant', function(accounts) {

    // set to true to show additional info within tests
    const showConsoleLog = false;

    const virtualPowerPlantOwner = accounts[0];  // by default, contract deployer
    const virtualPowerPlantAdmin = accounts[1]; // set to admin

    // set of test investors
    const investor1 = accounts[2];
    const investor2 = accounts[3];
    const investor3 = accounts[4];
    const investor4 = accounts[5];

    // sample investment amounts in wei
    let investmentAmount1 = 10e6;
    let investmentAmount2 = 15e6;
    let investmentAmount3 = 5e6;
    let investmentAmount4 = 8e6;

    // batteries to add to batt array
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

    // preliminary tests - check contract deployment
    it("1)...check contract addresses are correct", async() => {
        virtualPowerPlantOwnerCheck = await virtualPowerPlant.owner();
        if(showConsoleLog){new Promise(() => console.log("VirtualPowerPlant owner address: " + virtualPowerPlantOwnerCheck))};
        assert.equal(virtualPowerPlantOwner, virtualPowerPlantOwnerCheck, "Owner address does not match accounts[0] from ganache");

        // check contracts deployed by VPP
        let batteryInvestmentAddressCheck = await batteryInvestmentContract.address;
        if(showConsoleLog){new Promise(() => console.log("BatteryInvestment address: " + batteryInvestmentAddress))};
        assert.equal(batteryInvestmentAddress, batteryInvestmentAddressCheck, "BatteryInvestment contract address incorrect");

        let batteryEnergyAddressCheck = await batteryEnergyContract.address;
        if(showConsoleLog){new Promise(() => console.log("BatteryEnergy address: " + batteryEnergyAddress))};
        assert.equal(batteryEnergyAddress, batteryEnergyAddressCheck, "BatteryEnergy contract address incorrect");
    });

    // check that contract deployer can set other admin users
    it("2)...check VirtualPowerPlant Owner can set Admin", async() => {
        // find number of admins before another is added
        let adminsNumPre = await virtualPowerPlant.numAdmins();
        if(showConsoleLog){new Promise(() => console.log("Prior to setting admin, # admins = " + adminsNumPre))};
        await virtualPowerPlant.setAdmin(virtualPowerPlantAdmin, true, {from: virtualPowerPlantOwner});
        // find updated number of admins
        let adminsNum = await virtualPowerPlant.numAdmins();
        if(showConsoleLog){new Promise(() => console.log("After setting admin, # admins = " + adminsNum))};
        adminNumCheck = 2; // there should now two admins - owner + new admin
        assert.equal(adminsNum, adminNumCheck, "Admin was not added properly");
    });

    // make multiple investments from multiple users
    it("3)...check BatteryInvestment multiple investments from multiple investors", async() => {
        // multiple investments, including 2 for a single investor
        await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount1});
        await batteryInvestmentContract.investMoney({from: investor2, value: investmentAmount2});
        await batteryInvestmentContract.investMoney({from: investor3, value: investmentAmount3});
        await batteryInvestmentContract.investMoney({from: investor4, value: investmentAmount4});
        await batteryInvestmentContract.investMoney({from: investor1, value: investmentAmount3});

        // find total investment after funds added
        let totalInvestment = await batteryInvestmentContract.totalInvestment();
        checkInvestment = (
            investmentAmount1 +
            investmentAmount2 +
            investmentAmount3 +
            investmentAmount4 +
            investmentAmount3
        );
        // make sure investment amount matches expected
        if(showConsoleLog){new Promise(() => console.log("totalInvestment: " + totalInvestment))};
        assert.equal(totalInvestment, checkInvestment, "totalInvestment amount is incorrect");

        // make sure investment amount matches expected
        let investorAmountTest = await batteryInvestmentContract.getInvestorInvestment(investor1, 1);
        if(showConsoleLog){new Promise(() => console.log("First investor's second investorAmount: " + investorAmountTest))};
        assert.equal(investorAmountTest, investmentAmount3, "Investment amount is incorrect");
    });

    // add batteries to array of batts, decomission one
    it("4)...check Admin can add 5 batteries to virtualPowerPlant and decommission one", async() => {

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
        // find number of batteries after
        let numBatteries = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("numBatteries after adding batteries: " + numBatteries))};
        // find remaining investment after batteries are added/purchased
        let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
        if(showConsoleLog){new Promise(() => console.log("remainingInvestment after battery purchases: " + remainingInvestment))};
        // now should be 5 batteries
        assert.equal(numBatteries, 5, "Batteries not added properly");

        // random index to remove, check decomission process is correct
        let removeIndex = 2; // index of battery to decommission
        let numBatteriesBefore = await virtualPowerPlant.numBatteries();
        // remove specific battery, then calculate how many batts are there
        await virtualPowerPlant.decommissionBattery(removeIndex, {from: virtualPowerPlantOwner});
        let numBatteriesAfter = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("numBatteries went from: " + numBatteriesBefore + " to " + numBatteriesAfter))};
        // make sure new mapping index has been updated too
        let newMapIndex = await virtualPowerPlant.getBatteryMapIndex(numBatteriesAfter);
        if(showConsoleLog){new Promise(() => console.log("newMapIndex of the last element in Batteries array, replacing the decommissioned index at " + removeIndex + ": " + newMapIndex))};
        let newBatteryMapping = await virtualPowerPlant.batteryMapping(removeIndex);
        if(showConsoleLog){new Promise(() => console.log("newBatteryMapping at replaced index should be the last battery which was moved there (4): " + newBatteryMapping))};
        assert.equal(removeIndex, newMapIndex, "The index removed should match the updated map index of the last element");
        // number batteries should now be decremented by 1 after decommission
        numBatts = await virtualPowerPlant.numBatteries();
        if(showConsoleLog){new Promise(() => console.log("Number of batteries after decommission: " + numBatts))};
        assert.equal(numBatts, 4, "After decommission, # of batteries should decrease by 1");
    });

    // charge or discharge batteries
    it("5)...charge/discharge the array of batteries depending on energy costs", async() => {

        // find remaining investment money to show
        let remainingInvestment = await batteryInvestmentContract.remainingInvestment();
        if(showConsoleLog){new Promise(() => console.log("Initial remainingInvestment: " + remainingInvestment))};

        // for each battery, see how much capacity remains initially
        batteryCapacityRemaining1pre = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery1: " + batteryCapacityRemaining1pre))};
        batteryCapacityRemaining2pre = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery2: " + batteryCapacityRemaining2pre))};
        batteryCapacityRemaining3pre = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery3: " + batteryCapacityRemaining3pre))};
        batteryCapacityRemaining4pre = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery4: " + batteryCapacityRemaining4pre))};
        batteryCapacityRemaining5pre = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery5: " + batteryCapacityRemaining5pre))};

        // check capacity remaining is expected
        assert.equal(batteryCapacityRemaining1pre, battery1.capacity - battery1.currentFilled, "Battery 1 capacity remaining incorrect");
        assert.equal(batteryCapacityRemaining2pre, battery2.capacity - battery2.currentFilled, "Battery 2 capacity remaining incorrect");
        assert.equal(batteryCapacityRemaining3pre, battery3.capacity - battery3.currentFilled, "Battery 3 capacity remaining incorrect");
        assert.equal(batteryCapacityRemaining4pre, battery4.capacity - battery4.currentFilled, "Battery 4 capacity remaining incorrect");
        assert.equal(batteryCapacityRemaining5pre, battery5.capacity - battery5.currentFilled, "Battery 5 capacity remaining incorrect");

        // check battery purchase decision for each batt
        await batteryEnergyContract.checkBatteryEnergy({from: virtualPowerPlantAdmin});

        let batteryIDCounter = await batteryEnergyContract.batteryIDCounter();
        if(showConsoleLog){console.log("battery counter: " + batteryIDCounter)};

        // limit number processed per batch, so only 3 completed each batch
        assert.equal(batteryIDCounter, 3, "Battery counter/index batch processing should be at Battery3");
        // because we added 4 batteries, need to call the function again to complete it
        await batteryEnergyContract.checkBatteryEnergy({from: virtualPowerPlantAdmin});
        // battery ID counter should report the next battery ID to process
        batteryIDCounter = await batteryEnergyContract.batteryIDCounter();
        if(showConsoleLog){console.log("battery counter: " + batteryIDCounter)};
        // after all batteries completed, battery counter should reset
        assert.equal(batteryIDCounter, 0, "Battery counter/index batch processing should complete and reset to 0");
        // new remaining investment should change from before, either from purchase or sale
        let remainingInvestmentAfterDividends = await batteryInvestmentContract.remainingInvestment();
        if(showConsoleLog){new Promise(() => console.log("remainingInvestment after energy transactions for charging/discharging: " + remainingInvestmentAfterDividends))};

        batteryCapacityRemaining1post = await virtualPowerPlant.getBatteryCapacityRemaining(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery1: " + batteryCapacityRemaining1post))};
        batteryCapacityRemaining2post = await virtualPowerPlant.getBatteryCapacityRemaining(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery2: " + batteryCapacityRemaining2post))};
        batteryCapacityRemaining3post = await virtualPowerPlant.getBatteryCapacityRemaining(2, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery3: " + batteryCapacityRemaining3post))};
        batteryCapacityRemaining4post = await virtualPowerPlant.getBatteryCapacityRemaining(3, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery4: " + batteryCapacityRemaining4post))};
        batteryCapacityRemaining5post = await virtualPowerPlant.getBatteryCapacityRemaining(4, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("batteryCapacityRemaining battery5: " + batteryCapacityRemaining5post))};

        // make sure the charge in battery decomissioned doesn't change
        assert.equal(batteryCapacityRemaining3pre.toString(10), batteryCapacityRemaining3post.toString(10), "Decommissioned battery capaicty remaining should not change");

        // calculate how much expected remaining investment exists
        let remainingInvestmentExpected = (
            remainingInvestment
            - (5e3 * battery1.chargeRate)
            - (5e3 * battery2.chargeRate)
            + (5e3 * battery4.chargeRate)
            + (5e3 * battery5.chargeRate)
        );

        assert.equal(remainingInvestmentAfterDividends, remainingInvestmentExpected, "Total transaction remaining amount should equal");
    });

    // trigger a dividend based on remaining investment amount
    it("6)...trigger dividend and withdraw funds for multiple investors", async() => {
        // total investment only accounts for money added by investors
        let totalInvestment = await batteryInvestmentContract.totalInvestment();
        let remainingInvestmentInitial = await batteryInvestmentContract.remainingInvestment();
        // trigger a dividend
        await batteryInvestmentContract.triggerDividend({from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("remainingInvestment after dividends: " + remainingInvestmentInitial))};

        // first entry in pendingTotalWithdrawals, value won't change as withdrawals made
        let pendingTotalWithdrawals1 = await batteryInvestmentContract.pendingTotalWithdrawals(0, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals, reference point: " + pendingTotalWithdrawals1))};

        // 2nd entry in pendingTotalWithdrawals, value changes as withdrawals are
        // deposited into each investor's account
        let pendingTotalWithdrawals2 = await batteryInvestmentContract.pendingTotalWithdrawals(1, {from: virtualPowerPlantAdmin});
        if(showConsoleLog){new Promise(() => console.log("pendingTotalWithdrawals, which will be reduced: " + pendingTotalWithdrawals2))};

        assert.equal(pendingTotalWithdrawals1.toString(10), pendingTotalWithdrawals2.toString(10), "Before withdrawals, both pending withdrawals indices should match");

        // for first 3 investors, put their withdrawal amount into individual withdrawal pool
        await batteryInvestmentContract.addPendingWithdrawals(investor1, {from: virtualPowerPlantAdmin});
        await batteryInvestmentContract.addPendingWithdrawals(investor2, {from: virtualPowerPlantAdmin});
        await batteryInvestmentContract.addPendingWithdrawals(investor3, {from: virtualPowerPlantAdmin});

        let pendingWithdrawal1 = await batteryInvestmentContract.pendingWithdrawals(investor1);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal1: " + pendingWithdrawal1))};

        let pendingWithdrawal2 = await batteryInvestmentContract.pendingWithdrawals(investor2);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal2: " + pendingWithdrawal2))};

        let pendingWithdrawal3 = await batteryInvestmentContract.pendingWithdrawals(investor3);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal3: " + pendingWithdrawal3))};

        // because investor 1 and 2 both invested same amount, their dividends should match too
        assert.equal(pendingWithdrawal1.toString(10), pendingWithdrawal2.toString(10), "Investor 1 & 2 should have the same withdrawal amount because they invested the same initial amount");

        let balance1 = await web3.eth.getBalance(investor2);
        let withdrawTX1 = await batteryInvestmentContract.withdraw({from: investor2});
        let balance2 = await web3.eth.getBalance(investor2);

        // make sure the pendingWithdrawal has been updated after investor2
        // withdrew amount 
        pendingWithdrawal2After = await batteryInvestmentContract.pendingWithdrawals(investor2);
        if(showConsoleLog){new Promise(() => console.log("pendingWithdrawal2 after dividend is withdrawn: " + pendingWithdrawal2After))};

        assert.equal(pendingWithdrawal2After, 0, "Pending withdrawal for investor2 should be 0 after it is withdrawn");

    });






});
