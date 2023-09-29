let pointsAvailable = 0; // stores the total points available to user

// stores each transaction in chronological order in the following format:
// [{ payer: "DANNON", points: 200, timestamp: "2022-11-02T14:00:00Z", balance: 100 },
//  { payer: "UNILEVER", points: 300, timestamp: "2022-10-31T11:00:00Z", balance: 300 }]
// note: the balance field stores the amount of unspent points from that transaction
const transactions = [];

// stores each payer's balances in the following format:
// { "DANNON": 1000, "UNILEVER": 200, "MILLER COORS": 250}
const payerBalances = {};

function getBalances() {
    return payerBalances;
}

function addTransaction( transaction ) {
    if (transaction.points < 0) {
        handleNegativeAddTransaction(transaction);
        transaction.balance = 0;
    } else {
        transaction.balance = transaction.points;
    }

    let location = findLoc(transaction.timestamp);
    if (location == 0) {
        if (transactions[0] && transactions[0].timestamp < transaction.timestamp)
            location += 1;
    } else {
        location += 1;
    }
    transactions.splice(location, 0, transaction);

    pointsAvailable += transaction.points;

    if (payerBalances[transaction.payer]) payerBalances[transaction.payer] += transaction.points;
    else payerBalances[transaction.payer] = transaction.points;
}

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
    throw new Error('Cannot have a negative balance for a payer');
}

function spend( points ) {
    if (points > pointsAvailable) throw new Error('You do not have enough points for this transaction');
    pointsAvailable -= points;

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

    const response = [];
    for (payer in payersToSubstractFrom) {
        payerBalances[payer] += payersToSubstractFrom[payer];
        response.push({"payer": payer, "points": payersToSubstractFrom[payer]});
    }

    return response;
}

module.exports = { addTransaction, spend, getBalances };