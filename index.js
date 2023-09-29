const { addTransaction, spend, getBalances } = require('./data');
const express = require('express');

const app = express();
const PORT = 8000;

app.use( express.json() );

app.post('/add', (req, res) => {
    const { payer, points, timestamp } = req.body;

    if (!(payer && points && timestamp)) {
        res.status(400).send("You need to define payer, points, and timestamp!");
    }

    try {
        addTransaction({ payer: payer, points: points, timestamp: timestamp });
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post('/spend', (req, res) => {
    const { points } = req.body;

    if (!points) {
        res.status(400).send("You need to define how many points you are spending!");
    }

    try {
        res.json(spend(points));
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/balance', (req, res) => {
    res.json(getBalances());
});

app.listen(PORT, () => console.log(`served at http://localhost:${PORT}`));