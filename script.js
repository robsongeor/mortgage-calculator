import events from './pubsub.js'
import calc from './calculatorHelper.js';


class LoanCalculator {
    constructor(loanAmount, loanRate, loanTerm){
        this.loanAmount = loanAmount;
        this.loanRate = loanRate;
        this.loanTerm = loanTerm;

        this.bindEvents();
    }
    
    bindEvents(){
        //recieve input values
        events.on("requestCalculator", this.calculate.bind(this))
    }

    calculate(values){
        let inputVals = {};

        //Handles converting freq string into number
        values["payment-freq"] = calc.freqToNumber(values["payment-freq"])

        //convert to Numbers
        for(const [key, value] of Object.entries(values)){
            values[key] = Number(value)
        }


        console.log(calc.calculateBalance(values))
        console.log(values)
        //console.log(calc.minimumRepayments(values));
    }
  
}

class DOMHandler {
    constructor(){
        this.cacheDOM = this.cacheDOM()
        this.eventListeners = this.eventListeners()
    }

    cacheDOM(){
        let cacheDOM = {};

        let inputs = {
            loanInput: document.querySelector("#loan-amount"),
            rateInput: document.querySelector("#loan-rate"),
            termInput: document.querySelector("#loan-term"),
            paymentAmt: document.querySelector("#payment-amt"),
            paymentFreqInput: document.querySelector("#payment-freq")
        }

        let buttons = {
            calculate: document.querySelector(".calculate-button")
        }

        cacheDOM = {inputs, buttons}

        return cacheDOM
    }

    eventListeners(){
        this.cacheDOM.buttons.calculate.addEventListener("click", this.dispatchValues.bind(this))
    }

    dispatchValues(){
        let inputValues = {}

        for(const value of Object.values(this.cacheDOM.inputs)){
            inputValues[value.name] = value.value
        }

        console.log(inputValues)
        events.emit("requestCalculator", inputValues);
    }




}

let dh = new DOMHandler()
let c = new LoanCalculator()