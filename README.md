## Virtual Power Plant (VPP) DApp
### VPP DApp is a sample implementation of a Virtual Power Plant based on a fleet of distributed battery resources which are managed by an investment fund.
##### Consensys Course Final Project
##### Author: Yan Man

### Overview:

Although customers typically pay a flat energy rate for electricity throughout the day, energy prices in actuality fluctuate drastically depending on real time aggregate energy demand. Due to the unpredictability of real time demand, along with insufficient implementation and availability of large scale energy storage resources, energy response must be managed on a minute by minute basis. Electricity generators respond by turning on so called "Peaker" plants, which are convenient for short term energy generation but are also typically the most [environmentally damaging.](https://www.gogriddy.com/blog/renewable-energy/to-use-clean-energy-avoid-pollution-spewing-peaker-plants/)

With flexible energy storage resources such as batteries, energy can be stored when real time energy demand is low, and discharged to the grid when demand, and prices, are high. This serves to effectively smooth the aggregated demand curve throughout the day, improving grid efficiency and stability as well as creating profit through energy trading.

### Example Usage:
In JavaScript, create a VirtualPowerPlant contract from its artifact. You can then begin to interact with its contract functions directly. Remember to invest into the account before adding batteries to the array.

```
VirtualPowerPlant = TruffleContract(VirtualPowerPlantArtifact);
VirtualPowerPlant.addBattery(
    battery.capacity,
    battery.currentFilled,
    web3.toWei(battery.cost, "ether"),
    battery.serialNumber,
    battery.priceThreshold,
    battery.chargeRate
);
```

Otherwise, interact with the DApp via the frontend included, which will allow you to invest funds, add batteries, and execute energy transactions.

### Getting Started
#### Required installations:

Install the following packages:

1. [Truffle v5.0](https://truffleframework.com/docs/truffle/getting-started/installation)
2. [Ganache](https://truffleframework.com/docs/ganache/quickstart)
3. [NPM](https://www.npmjs.com/get-npm)
4. [Lite-Server](https://www.npmjs.com/package/lite-server)
5. [MetaMask](https://metamask.io/)
Solidity

This DApp was developed in Ubuntu64 16.04 VM environment.

#### To run:

VPP-Dapp is a truffle project that contains all necessary contract, library, migration and test files. Execute via command line:

1. Clone the repo to your directory

2. In a separate terminal, start ganache development blockchain on port 7545. Create 10 funded accounts

    ```
    > ganache-cli -p 7545
    ```

3. In the original terminal, navigate to the project directory. Migrate and compile the Truffle contract to generate the ABI and deploy to the dev blockchain

4. Test the contract functions via js tests. All tests should pass

5. Make sure `MetaMask` is installed. Open `MetaMask` in your Chrome browser and import the development accounts created by `ganache`. Only one address is required to test the DApp.

6. Start the front end server on ```localhost:3000```

    ```
    > git clone
    > truffle migrate --reset
    > truffle test
    > npm run dev
    ```

#### Frontend Interaction:

The first development account (`account[0]`) is used to deploy the parent contract `VirtualPowerPlant.sol`. This address will also be an `admin` and the `owner`. Only one development account is required.

In `MetaMask`, set the connection to `Custom RPC` and the target RPC url to http://127.0.0.1:7545 to access the `ganache-cli` accounts.

To test the DApp, follow instructions on the `index.html` homepage.

1. Start by investing some amount of Eth (around ~50 Eth should be sufficient) into the battery fund by filling in the form input. Click `Invest` to proceed.

2. Once the transaction has been accepted, you can start adding batteries to the fleet. Sample battery options are listed and available, select a few to add by clicking `Add to array`.

3. Charge or discharge batteries by clicking `Execute Energy Transactions`. This will update battery charge currently filled and determine whether to charge (green) or discharge (red) the battery to the grid. Remaining investment will be updated to reflect the savings/cost of energy transacted.

### Detailed Usage

#### Contract Functions / Business Logic:
##### VirtualPowerPlant.sol
- `isAdmin`: check address is an admin
- `setAdmin`: set admin to active or inactive
- `toggleContractActive`: to implement circuit breaker design
- `addBattery`: add battery to fleet based on battery characteristics/serial number
- `chargeBattery`: charge battery, ie alter battery state based on amount charged
- `changeBatteryThreshold`: alter battery characteristics
- `decommissionBattery`: render batteries inactive
###### Battery getter functions:
- `getRelevantBatteryInfo`
- `getBatteryChargeRate`
- `getBatteryMapIndex`

##### BatteryInvestment.sol
- `updateRemainingInvestment`: update amount of remaining eth in fund
- `investMoney`: ensure Eth is attached when calling this function
- `triggerDividend`: admins can implement a dividend to send payment to investors
- `withdraw`: for investors to retrieve their dividend withdrawal
- `getInvestorInvestment`: getter function to retrieve investment amount for particular investor

##### BatteryEnergy.sol
- `checkBatteryEnergy`: loop over batches of batteries, check transaction circumstances for each
- `transactEnergy`: for an individual battery, determine energy transaction (charge or discharge)
- `buyEnergy`
- `sellEnergy`
- `executeBatteryTransaction`: 
- `getRealTimeEnergyPrice`
- `energyDecisionAlgorithm`

#### Tests:

Contract tests were written in JavaScript

1. Contract Deployment: Check deployment of the parent ```VirtualPowerPlant.sol``` contract, which in turn deploys ```BatteryEnergy.sol``` and ```BatteryInvestment.sol``` contracts.
2. Set admin: Check that a separate admin user can be set.
3. Investment: Check that users can invest Eth into the battery fund
4. Add batteries: Check that admin users can add batteries to the battery fleet, and can decommission them too.
5. Transact Energy: Charge or discharge batteries based on the real time price of energy.
6. Trigger Dividend: Trigger a dividend to reward investors. Dividend amounts per investor are based on their percentage contribution to the fund.

#### Libraries

1. [SafeMath](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol): Use battle tested math functions to avoid overflow errors, etc
2. [Ownable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol): Inherit ownership properties
