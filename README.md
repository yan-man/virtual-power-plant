## Virtual Power Plant (VPP) DApp
#### VPP DApp is a sample implementation of a Virtual Power Plant based on a fleet of distributed battery resources which are managed by an investment fund.
###### Consensys Course Final Project
Author: [Yan Man](https://github.com/yan-man)

### I. Overview:

Although customers typically pay a flat energy rate for electricity throughout the day, energy prices in actuality fluctuate drastically depending on real time aggregate energy demand. Due to the unpredictability of real time demand, along with insufficient implementation and availability of large scale energy storage resources, energy response must be managed on a minute by minute basis. Electricity generators respond by turning on so called "Peaker" plants, which are convenient for short term energy generation but are also typically the most [environmentally damaging.](https://www.gogriddy.com/blog/renewable-energy/to-use-clean-energy-avoid-pollution-spewing-peaker-plants/)

With flexible energy storage resources such as batteries, energy can be stored when real time energy demand is low, and discharged to the grid when demand, and prices, are high. This serves to effectively smooth the aggregated demand curve throughout the day, improving grid efficiency and stability as well as creating profit through energy trading.

##### Example Usage:
In JavaScript, create a VirtualPowerPlant contract from its artifact. You can then begin to interact with its contract functions directly via JS. Make sure there are sufficient funds invested before adding batteries to the array.

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

### II. Getting Started
#### Required installations:

Install the following packages. DApp was developed in the following versions in a [Ubuntu64 18.04](https://www.ubuntu.com/download/desktop) environment.

1. [Truffle  v5.0.2 (core: 5.0.2)](https://truffleframework.com/docs/truffle/getting-started/installation)
2. [Ganache CLI v6.2.3 (ganache-core: 2.3.1)](https://truffleframework.com/docs/ganache/quickstart)
3. [npm v3.5.2](https://www.npmjs.com/get-npm)
4. [Node v8.10.0](https://nodejs.org/en/)
5. [MetaMask](https://metamask.io/)
6. [Solidity v0.5.0 (solc-js)](https://solidity.readthedocs.io/en/v0.5.3/)

#### To run:

VPP-Dapp is a truffle project that contains all necessary contract, library, migration and test files. Execute via command line:

1. Clone the repo to your directory.

    ```
    $ git clone
    ```

2. In a separate terminal, start ganache development blockchain on port 7545. Create 10 funded accounts.

    ```
    Terminal 2:
    $ ganache-cli -p 7545
    ```
3. In the first terminal, navigate to the project directory. Test the contract functions via `JavaScript` tests. There are 6 tests, which should pass.

    ```
    Terminal 1:
    $ truffle test
    ```
3. Migrate and compile the Truffle contract to generate the ABI and deploy the contract to the dev blockchain.

    ```
    $ truffle migrate --reset
    ```

5. Make sure `MetaMask` is installed. Open `MetaMask` in your Chrome browser and set the network connection to `Custom RPC` and the target RPC url to `http://127.0.0.1:7545` to access the `ganache-cli` accounts. Only one address is required to test the DApp.

6. Start the front end server on ```localhost:3000``` by using:

    ```
    $ npm run dev
    ```

#### Frontend Interaction:

The first development account (`account[0]`) is used to deploy the parent contract `VirtualPowerPlant.sol`. This address will also be an `admin` and the `owner`. Only one development account is required for the demo.

To test the DApp, follow instructions on the `index.html` homepage.

1. Start by investing some amount of Eth (around ~50 Eth should be sufficient) into the battery fund by filling in the form input. Click `Invest` to proceed.

2. Once the transaction has been accepted, you can start adding batteries to the fleet. Sample battery options are listed and available, select a few to add by clicking `Add to array` under each battery panel. Make sure you are in the

3. Charge or discharge batteries and execute transactions by clicking `Execute Energy Transactions`. This will update battery charge currently filled and determine whether to charge (green) or discharge (red) the battery to the grid. Remaining investment will be updated to reflect the savings/cost of energy transacted.



### III. Detailed Usage

#### User roles:

##### 1) Admin
`admin` users are the only ones allowed to perform crucial functions. The initial account that deploys `VirtualPowerPlant.sol` is the `owner` and the first `admin`, and is able to set up other `admins`. `admins` are responsible for performing two main functions:
- Managing batteries: This consists of adding batteries to the fleet and decommissioning them when necessary.
- Managing investments: triggering dividends to pay investors, and distributing the dividends into withdrawal pools for investors to withdraw from.

##### 2) Investors
Investors are composed of any other accounts that want to contribute eth to the fund. Anyone can be an investor, and investors are eligible for dividends that are paid in proportion to the amount of funds invested.

#### Battery-related Assumptions/Calculations:
- A very simple threshold was used to determine whether energy should be purchased or sold, ie if prices were more expensive than the battery's threshold, energy was sold to the grid. Otherwise, energy was purchased.

- The real time energy price was hardcoded to simplify the transaction process. Ideally, it would be connected to an outside Oracle to report the actual, fluctuating real time energy rate.

- The actual energy transaction was simplified. Whereas in reality, a separate contract might have to be implemented to manage energy transactions between the grid and outside suppliers, in this DApp energy was assumed to be traded instantaneously and available immediately.

- Batteries were assumed to have charged instantaneously, with minimal restrictions on battery performance. In reality, charge frequency and other factors would add vastly more constraints.

- Decisions on whether to purchase or sell energy were based on a simple threshold. If energy prices are expensive (ie greater than the battery's price threshold), sell energy to the grid to make a profit. Otherwise purchase energy to charge the battery.

#### Relevant Contract Functions:
##### 1) VirtualPowerPlant.sol
- `isAdmin`: check address is an admin user
- `setAdmin`: set admin to active or inactive
- `toggleContractActive`: to implement circuit breaker design

- `addBattery`: add Battery struct to fleet, composed of multiple battery characteristics. Battery
- `decommissionBattery`: render battery inactive (no charging/discharging)
- `chargeBattery`: charge battery, ie alter battery state based on amount charged/discharged
- `changeBatteryThreshold`: alter battery threshold characteristics (affects decision making on energy purchases)

**Battery info getter functions:**
- `getRelevantBatteryInfo`
- `getBatteryChargeRate`
- `getBatteryMapIndex`

##### 2) BatteryInvestment.sol
- `updateRemainingInvestment`: update amount of remaining eth in fund
- `investMoney`: ensure Eth is attached when calling this function
- `triggerDividend`: admins can implement a dividend to send payment to investors
- `withdraw`: for investors to retrieve their dividend withdrawal
- `getInvestorInvestment`: getter function to retrieve investment amount for particular investor

##### 3) BatteryEnergy.sol
- `checkBatteryEnergy`: loop over batches of batteries, check transaction circumstances for each. Transact energy as required, update the investment fund with profits/energy purchases.
- `getRealTimeEnergyPrice`: hardcoded for this demo. Retrieves the current energy rate on the real time market.
- `energyDecisionAlgorithm`: determines whether to purchase energy or sell it to the grid, based on a simple threshold.

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
2. [Math](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/Math.sol): Other basic math functions
3. [Ownable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol): Inherit ownership properties

#### Further
- **[Oraclize](https://docs.oraclize.it/)**: There are two obvious ways to improve this contract implementation -

  - Run energy transactions every hour or on a regular time interval. This removes the manual component of transactions.

  - Find the actual real time energy price during each transaction. Currently this energy rate was hard coded to a sample value.

- **Energy optimization algorithm**: A very basic threshold was used to determine energy transactions. In reality, energy prices in the context of the market demand and recent history are more important. A more robust optimization algorithm should be used.

- **Battery modeling**: battery characteristics were simplified and and modeled in an elementary manner. Charging/discharging was assumed to be instantaneous, and internal battery chemistry and hardware constraints were not accounted for.

- **Energy trading**: energy was assumed to have just appeared out of thin air. The actual energy transaction needs to be implemented to allow for trading back and forth between grid and battery.
