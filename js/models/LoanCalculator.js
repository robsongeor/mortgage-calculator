import events from "../pubsub.js";
import calc from './calculatorHelper.js';

export class LoanCalculator {
    constructor() {
        this.bindEvents();
        
    }

    bindEvents() {
        //recieve input values
        events.on("requestCalculator", this.calculate.bind(this))
    }

    calculate(values) {

        //Handles converting freq string into number
        values["payment-freq"] = calc.freqToNumber(values["payment-freq"])

        //convert to Numbers
        for (const [key, value] of Object.entries(values)) {
            values[key] = Number(value)
        }

        //Store calculated outputs into object
        let outputs = function () {

            let totalPaid = values["payment-amt"] * values["payment-freq"];
            let balance = calc.betterCalculateBalance(values);
            let princeplePaid = values["loan-amount"] - balance;
            let interestPaid = totalPaid - princeplePaid;

            return { totalPaid, balance, princeplePaid, interestPaid }
        }()


        console.log(calc.betterCalculateBalance(values))

        let cardData = {
            inputs: values,
            outputs: outputs

        }

        console.log(cardData)

        events.emit("calculateBalance", outputs)

    }

}