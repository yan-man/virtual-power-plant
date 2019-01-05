# virtual-power-plant
Consensys Course Final Project - Virtual Power Plant DApp

Introduction:
In the energy industry, currently homeowners and consumers pay a flat fee for electricity, whereas electricity retailers and utilities, who supply said electricity, must purchase their energy on the futures market or on the real time market to supplement unforeseen demand. thus, they are exposed to the risks of the ever fluctuating price of electricity while shielding hte consumer from these price risks. In actuality, energy prices fluctuate drastically depending on real time demand. Energy generators must also respond on high freqeuency time scales to ensure that supply meets the current demand.

Because of a lack of viable large scale battery capacity, the grid suffers from this situation. While consumers are shielded adn for the most part never even realize their electricity supply is being managed on a real time scale, generators and suppliers must generate and purchase electricity in real time to account for customer demand. In times of high customer demand with little warning, electricity can be as expensive as 100x the average rate. To account for this extremely high demand on short notice, generators must scramble to turn on "peaker" plants, which are amongst the dirtiest and costliest generation assets, to cover for the extra demand. This is both costly and environmentally damaging. And Although these instances are short lived and only occur a few times yearly, they can cost millions of dollars in damanges and inefficiency.

On a daily basis, the fluctuations in demand that correspond to the daily schedules of most consumers accounts for the other fluctuations in cost.

Also, there is a flip side. Typically generators have a set of power plants running, which requires time and energy to ramp up or down in production. The ideal scenario is that demand is perfectly tracked by supply, and there is nothing extraneous. When demand is high, costs are high. However, in times of extremely low demand, such as in the middle of the night, the opposite problem happens; generators don't want to turn off their power plants. so they run them and when demadn is low, energy prices go negative, meaning that you can earn money by using electricity.

Thus, it is beneficial to be able to smooth the demand curve to optimize grid efficiency. Through a set of abttery assets that can store energy when real time electricity prices are low, and then discharge energy back to the grid when energy is expensive, this not only improves grid efficiency but also allows you to make money from trading energy.


This project is a DApp example for a Virtual Power Plant. It consists of the following contracts:

1) Virtual Power Plant
contains the list of battery assets and defines ownership and admins users who can:
- add batery assets
- alter battery assets

When this contract is deployed, it deploys the following 2 contracts:

1) Energy Investment Fund
where users can invest any amount of ether desired for battery purchase and battery array development
they will earn a dividend based on money earned from trading of electricity on the real time market
dividends are paid out whenever triggered by an admin, which will be equivalent to a percentage of the remaining investment fund

This contract contains the following functions:


2)
by checking the real time price of electricity, determine whether to purhcase energy from the grid or discharge into the grid.
Implement the energy purhcase and determine how much energy to purchase

Further implementations:
- integrate with oraclize to charge/discharge energy to batteries on a regular schedule
- integrate with oraclize to pull true real time energy rates during each time period


How to set it up:



Tests and rationale:

User stories:
new investor:
As an investor, I want to invest some amount of ether into the battery purchase fund

new investor:
as an existing investor, I want to receive dividends in order to earn on my investment

virtualPowerPlant contract owner:
as an owner, I want to add admins users in order to manage the battery array
as an owner, i want to remove my 

- anyone with an address can invest any amount of ether into the battery investment fund.
Benefits: At certain intervals, the creation of dividends can be triggered by admins or overall virtual power plant owner. Everyone
