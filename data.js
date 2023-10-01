// file: data.js
// description: helper methods for the REST API
// author: adit gupta
// date: 9/29/23

// stores the total points available to user, assumes only a single user. For a multi-user
// program, a javascript object would have replaced this variable
let pointsAvailable = 0; 

// stores each transaction in chronological order in the following format:
// [{ payer: "DANNON", points: 200, timestamp: "2022-10-31T14:00:00Z", balance: 100 },
//  { payer: "UNILEVER", points: 300, timestamp: "2022-11-01T11:00:00Z", balance: 300 }]
// note: the balance field stores the amount of unspent points from that transaction
// note 2: this list will ALWAYS be sorted by timestamp because of the binary search 
//         insertion algorithm below
const transactions = [];

// stores each payer's balances in the following format:
// { "DANNON": 1000, "UNILEVER": 200, "MILLER COORS": 250}
const payerBalances = {};

/**
 * @returns payer balances object
 */
function getBalances() {
    return payerBalances;
}

/**
 * Adds transaction to transactions array and updates pointsAvailable and payerBalances
 * accordingly
 * 
 * @param {Object} transaction - should contain payer, points, and timestamp
 */
function addTransaction( transaction ) {
    // add a new field for transaction balance and handle negative point values if necessary
    if (transaction.points < 0) {
        handleNegativeAddTransaction(transaction);
        transaction.balance = 0;
    } else {
        transaction.balance = transaction.points;
    }

    // find the index where the transaction should be stored in our array and handle any
    // edge cases associated with the binary search algorithm
    let location = findLoc(transaction.timestamp);
    if (location == 0) {
        if (transactions[0] && transactions[0].timestamp < transaction.timestamp)
            location += 1;
    } else {
        location += 1;
    }
    transactions.splice(location, 0, transaction);

    pointsAvailable += transaction.points; // update points value

    // update payerBalances
    if (payerBalances[transaction.payer]) payerBalances[transaction.payer] += transaction.points;
    else payerBalances[transaction.payer] = transaction.points;
}

/**
 * this function updates the balance values if a negative point value is sent through the
 * add endpoint. 
 * e.g. if { payer: "DANNON", points: -300 } comes in through the add endpoint, this function 
 * will take away a total of 300 points from previous DANNON transaction balances.
 * 
 * @param {Object} transaction - should contain payer, points, and timestamp
 * @returns void
 * @throws {Error} if a negative points value is passed but the payer does not have 
 */
function handleNegativeAddTransaction(transaction) {
    let points = -1 * transaction.points;
    for (let i = 0; i < transactions.length; i++) {
        let tr = transactions[i];
        if (tr.payer !== transaction.payer) continue;

        let pointsToSpend = Math.min(tr.balance, points);
        tr.balance -= pointsToSpend;
        points -= pointsToSpend;

        if (points == 0) return;
    }

    // if there are not enough points in previous transaction balances for this buyer,
    // the function will throw an error and a 400 error code will be returned
    throw new Error('Cannot have a negative balance for a payer');
}

/**
 * a binary search insertion algorithm which recursively searches the transactions array for the
 * right index to place a new transaction
 * note: a return value of zero could mean either "store this transaction before the first 
 *       element" or "store this transaction right after the first element". This edge case 
 *       must be handled in the caller function
 * 
 * @param {String} transactionDate 
 * @param {Number} start - start index
 * @param {Number} end - end index
 * @returns - the index right before where a transaction should be stored in the transactions array
 */
function findLoc(transactionDate, start, end) {
    start = start || 0;
    end = end || transactions.length;
    const pivot = parseInt(start + (end - start) / 2, 10);
    if (end - start <= 1 || transactions[pivot].timestamp === transactionDate) return pivot;
    if (transactions[pivot].timestamp < transactionDate) {
        return findLoc(transactionDate, pivot, end);
    } else {
        return findLoc(transactionDate, start, pivot);
    }
}

/**
 * Substracts points from the correct payers and updates pointsAvailable and payerBalances accordingly
 * 
 * @param {Number} points - number of points to substract
 * @returns - an Object with the amount of points substracted from each payer
 */
function spend( points ) {
    if (points > pointsAvailable) throw new Error('You do not have enough points for this transaction');

    pointsAvailable -= points; // update points value

    // update balances in transactions array
    const payersToSubstractFrom = {};
    for (let i = 0; i < transactions.length; i++) {
        let tr = transactions[i];
        let pointsToSpend = Math.min(tr.balance, points);
        tr.balance -= pointsToSpend;
        points -= pointsToSpend;

        if (payersToSubstractFrom[tr.payer]) payersToSubstractFrom[tr.payer] -= pointsToSpend;
        else payersToSubstractFrom[tr.payer] = -1 * pointsToSpend;

        if (points == 0) break;
    }

    if (points != 0) throw new Error('You do not have enough points for this transaction');

    // formulate response and update payerBalances
    const response = [];
    for (payer in payersToSubstractFrom) {
        payerBalances[payer] += payersToSubstractFrom[payer];
        response.push({"payer": payer, "points": payersToSubstractFrom[payer]});
    }

    return response;
}

module.exports = { addTransaction, spend, getBalances };