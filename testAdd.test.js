const { addTransaction } = require('./data');

it("should throw an error when attempting to substract more points than a payer has available", () => {

    addTransaction({ payer: "DANNON", points: 200, timestamp: "2022-10-31T14:00:00Z" });
    expect(() => addTransaction({ payer: "DANNON", points: -300, timestamp: "2022-10-31T15:00:00Z" }).toThrow(Error))

});

