## Design Patterns Decisions

#### **1. Multiple contracts**
Functionality was delegated to 3 separate contracts. One parent contract `VirtualPowerPlant`, which holds major type declarations and deploys the 2 other contracts, `BatteryEnergy` and `BatteryInvestment`. `BatteryEnergy` deals with energy transactions and the charging/discharging of storage assets. `BatteryInvestment` handles the investment fund and trigger of dividends. Contract addresses are stored in storage to allow contract functionality access between the 3.

#### **2. Circuit Breaker / Emergency Stop Pattern**
By default, `stopped` is set to false. All major functions are shut off in an emergency stop via the `stopInEmergency` modifier. Only `admin` has the ability to toggle the state of the emergency stop.

#### **3. Admin Functionality**
A group of `admins`, which can be set by the `owner`, restricts relevant function access.

#### **4. Restrict Looping over Unbounded Arrays**
To avoid function failures due to gas costs, looping over unbounded arrays was avoided where possible. Rather than looping over investors to calculate dividends to award to each, the admin must calculate dividends one investor at a time. Rather than checking each battery during energy transactions, set a number of batteries to "batch" process. Return `true` when the batch process has successfully completed evaluating all the batteries.

#### **5. Pull over Push payments**
When dividends are awarded, each investor's dividends are placed into a separate mapping. From there, individual investors must retrieve funds by querying the relevant function.

#### **6. Use mapping arrays to simplify getters**
Rather than retrieving large swaths of data, specific getter functions were written (mostly to retrieve battery-specific data). When batteries are decommissioned, they are also removed from the "active" battery array. Including a separate array to map between battery indexes also simplifies ID retrieval.

#### **7. Log events frequently**
Whenever storage data is altered, log an event. This simplifies debugging and also helps monitor transactions to ensure that values are within expected bounds. Especially as they pertain to funds and transactions. 
