pragma solidity >=0.5.0;

import "./VirtualPowerPlant.sol";
import "./SafeMath.sol";
import "./Math.sol";

/// @author Yan Man
/// @title Manage charging/discharging of batteries
contract BatteryEnergy {

    // Type declarations
    VirtualPowerPlant VirtualPowerPlantContract;

    // State variables
    address public virtualPowerPlantAddress; // address of parent contract deploying battery investment
    uint public purchaseInterval = 3600; // in sec, prescribed time between energy tx
    uint public batteryIDCounter; // for batch processes; the latest battery ID processed
    uint public batchProcess = 3; // number of batteries in the batch to process at once

    // Events
    // event Log(uint counter);
    event LogBatteryCheck(uint batteryID);
    event LogBatteryCheckCompleted();
    event LogEnergyPurchased(bytes32 serialNumber, uint energyTransacted, uint energyPrice);
    event LogEnergySold(bytes32 serialNumber, uint energyTransacted, uint energyPrice);

    // constructor
    /// @param _virtualPowerPlantAddress address of parent contract deploying this contract
    constructor (address _virtualPowerPlantAddress) public {
        virtualPowerPlantAddress = _virtualPowerPlantAddress;
        // create VirtualPowerPlant contract from parent contract address
        VirtualPowerPlantContract = VirtualPowerPlant(_virtualPowerPlantAddress);
    }

    /// @notice check each battery's energy level and charge/discharge based on
    /// @notice current energy rate and battery's price threshold
    /// @return whether all batteries were successfully checked
    function checkBatteryEnergy () external returns (bool) {
        uint batteryID;
        uint totalEnergyPurchase;
        for (uint i = 0; i < batchProcess; i++) {
            batteryID = VirtualPowerPlantContract.batteryMapping(batteryIDCounter);
            totalEnergyPurchase += executeBatteryTransaction(batteryID);
            batteryIDCounter += 1;
            if(batteryIDCounter == VirtualPowerPlantContract.numBatteries()){
                batteryIDCounter = 0;
                emit LogBatteryCheckCompleted();
                return true;
            }
        }
        return false;
    }

    /// @notice buy or sell energy and update battery status
    /// @return amount of energy to transact
    function transactEnergy
    (
        uint _batteryID,
        uint _capacity,
        uint _currentFilled,
        bytes32 _serialNumber,
        uint _chargeRate,
        uint _energyPrice,
        bool _chargeBattery
    )
        private
        returns (uint calculateEnergyToTransact)
    {
        // convert seconds to hours
        uint purchaseIntervalHours = SafeMath.div(purchaseInterval, 3600);
        // how much energy is available in battery
        uint emptyCapacity = _capacity - _currentFilled;

        // if decision is to charge battery
        if (_chargeBattery == true) {
            // to add energy to battery, it must have available capacity
            require(emptyCapacity > 0, "Battery should have remaining capacity in order to charge");
            // charge rate * time interval gives total energy amount to be added
            // but energy amount cannot exceed empty capacity
            calculateEnergyToTransact = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), emptyCapacity);
            // find remaining investment in fund
            uint remainingInvestment = (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment();
            // cost = energy amount * energy price
            uint costOfEnergyPurchase = SafeMath.mul(calculateEnergyToTransact, _energyPrice);
            // make sure there is enough investment to cover energy purchase
            if (costOfEnergyPurchase > remainingInvestment) {
                // energy purchase costs at most are the remaining investment
                costOfEnergyPurchase = remainingInvestment;
                // back calculate the energy based on the max eth available
                calculateEnergyToTransact = SafeMath.div(remainingInvestment, _energyPrice);
            }
            // purchase energy
            buyEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
            emit LogEnergyPurchased(
                _serialNumber,
                calculateEnergyToTransact,
                _energyPrice
            );
        } else {
            // maximum energy to sell is the current amount in the battery
            calculateEnergyToTransact = Math.min(SafeMath.mul(_chargeRate, purchaseIntervalHours), _currentFilled);
            sellEnergy(_batteryID, calculateEnergyToTransact, _energyPrice);
            emit LogEnergySold(
                _serialNumber,
                calculateEnergyToTransact,
                _energyPrice
            );
        }
    }

    /// @notice buy energy
    /// @param _batteryID battery identifier
    /// @param _energyAmountToPurchase amount to purchase
    /// @param _energyPrice current energy price
    /// @return whether energy successfully sold
    function buyEnergy (
        uint _batteryID,
        uint _energyAmountToPurchase,
        uint _energyPrice
    ) private returns (bool) {
        // calculate remaining investment money after energy purchase
        uint newRemainingInvestment = SafeMath.sub(
            (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment(),
            SafeMath.mul(
                _energyAmountToPurchase,
                _energyPrice
            )
        );
        // require sufficient investment remaining after purchase to continue
        require(newRemainingInvestment >= 0, "Not enough money to make this purchase");
        if ((VirtualPowerPlantContract.batteryInvestmentContract()).updateRemainingInvestment(newRemainingInvestment)) {
            // update battery characteristics based on energy charged
            VirtualPowerPlantContract.chargeBattery(_batteryID, -_energyAmountToPurchase);
            return true;
        }
        return false;
    }

    /// @notice sell energy
    /// @param _batteryID battery identifier
    /// @param _energyAmountToSell amount to sell
    /// @param _energyPrice current energy price
    /// @return whether energy successfully sold
    function sellEnergy (
        uint _batteryID,
        uint _energyAmountToSell,
        uint _energyPrice
    ) private returns (bool) {
        uint newRemainingInvestment = SafeMath.add(
            (VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment(),
            SafeMath.mul(
                _energyAmountToSell,
                _energyPrice
            )
        );
        if ((VirtualPowerPlantContract.batteryInvestmentContract()).updateRemainingInvestment(newRemainingInvestment)) {
            VirtualPowerPlantContract.chargeBattery(_batteryID, _energyAmountToSell);
            return true;
        }
        return false;
    }

    /// @notice for each battery execute the battery transaction by making decision
    /// @notice on charging/discharging
    /// @return amount of energy to transact
    function executeBatteryTransaction (uint _batteryID) private returns (uint) {

        uint energyAmountToTransact;
        // first retrieve current price of energy
        uint energyPrice = getRealTimeEnergyPrice();
        emit LogBatteryCheck(_batteryID);
        // retrieve relevant battery info for specific battery based on ID
        (
            uint capacity,
            uint currentFilled,
            bytes32 serialNumber,
            uint priceThreshold,
            uint chargeRate,
            bool isActive,
            uint mapIndex
        ) = VirtualPowerPlantContract.getRelevantBatteryInfo(_batteryID);
        // battery must be active to proceed
        require(isActive == true, "Battery should be active");
        // retrive decision on whether to buy or sell energy
        bool chargeBattery = energyDecisionAlgorithm(priceThreshold, energyPrice);
        // check whether to charge or discharge battery
        if (chargeBattery == true) {
            // require remaining investment to be valid to purchase energy
            require((VirtualPowerPlantContract.batteryInvestmentContract()).remainingInvestment() > 0);
        }
        // buy or sell energy, update battery status
        energyAmountToTransact = transactEnergy(
            _batteryID,
            capacity,
            currentFilled,
            serialNumber,
            chargeRate,
            energyPrice,
            chargeBattery
        );
        return energyAmountToTransact;
    }

    /// @notice basic function to retrieve real time energy price. For now,
    /// @notice hardcode a static value
    function getRealTimeEnergyPrice () private pure returns (uint realTimePrice) {
        realTimePrice = 5000;
    }

    /// @notice make a decision on whether to buy or sell energy
    /// @return true to buy energy
    /// @return false to sell energy
    function energyDecisionAlgorithm (uint _priceThreshold, uint _energyPrice)
        private
        pure
        returns (bool)
    {
        // for now, simple algo. If current price is less than threshold, buy
        if (_priceThreshold > _energyPrice) {
            return true;
        } else{
            return false;
        }
    }

}
