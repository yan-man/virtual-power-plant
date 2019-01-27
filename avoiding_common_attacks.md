## Avoiding Common Attacks

### 1. Reentrancy:
Make sure to zero out user withdrawal amounts before a user is sent any funds. By first setting pending withdrawals to 0 before transfers are made, malicious investors cannot invoke the withdraw function continuously.

### 2. Timestamp dependence
While `timestamps` for each battery are saved, these are trivially recorded to keep track of approximately when batteries were added to the array. Otherwise `timestamps` are not relied upon for business logic.

### 3. DoS with Block Gas Limit
Rather than dealing with unbounded loops which could lead to Block Gas Limits, batteries are processed in batches to give more predictable behavior. Dividends are also triggered for each investor on an individual basis

### 4. Integer Overflow/Underflow
In order to prevent common integer overflow issues, the library SafeMath was implemented for mathematical operations.

#### 5. Public/Private/Restricted Functions
Functions were restricted access by user type such as Owner for adding Admins, Admins for adding Institutions, Owners for emergency stops and changing the sign up fee, etc. Functions that could be restricted to view functions were done when possible. Variables were kept private when appropriate.

#### 7. TX.Origin Problem
msg.sender was always used rather than tx.origin
