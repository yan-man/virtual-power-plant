choose to have separate contracts to keep separate functionality, organize better
- virtual power plant is the base contract
- they are different functions so they should be kept separate, don't want to mix all the state variables
- investment is different than the battery charging/discharging, don't want to mix them


other contracts aren't children because they dont need all the functions, thus they are not inheriting base
- just need to access certain variables
- thus no inheritance

choose to have base contract deploy the other 2 contracts so that the secondary contracts have access to the original contract address, to access the variables and necessary functions
- instead of using a migration script and making it a transaction, so it keeps the contract deployment modular, ie the contract can take care of everything with minimal other processes. don't need for parent contract to run a script in order to access child
- so that all 3 contracts can easily pass addresses through contructor and doesn't need to be complicated by needing initalizing transactions between each of the 3 to share contract details  
