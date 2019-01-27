## Avoiding Common Attacks

### 1. Reentrancy:
Make sure to zero out user withdrawal amounts before a user is sent any funds. By first setting pending withdrawals to 0 before transfers are made, malicious investors cannot invoke the withdraw function continuously.

### 2. Timestamp dependence
While `timestamps` for each battery are saved, these are trivially recorded to keep track of approximately when batteries were added to the array. Otherwise `timestamps` are not relied upon for business logic.

### 3. DoS with Block Gas Limit
Rather than dealing with unbounded loops which could lead to Block Gas Limits, batteries are processed in batches to give more predictable behavior. Dividends are also triggered for each investor on an individual basis rather than in bulk.

### 4. Integer Overflow/Underflow
In order to prevent common integer overflow issues, the library `SafeMath` was implemented for mathematical operations. The `Math` library was also utilized for similar basic battle-tested math functions.

#### 5. Restricted Function access
By implementing `admins` and restricting access to admins where prudent, certain major functions were not accessible to outside actors. This limits the vulnerability of fund-related actions such as `triggerDividend`, or altering battery fleet-related aspects. Functions were also set to `internal` or `view` when possible, to limit further exposure (and save gas).

#### 6. `tx.origin`
`tx.origin` was never used, to avoid any conflict related to the origin address. `msg.sender` was used instead.
