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

        let balance = calc.calculateBalance(values);
        let princeplePaid = values["loan-amount"] - balance;
        let totalPaid = values["payment-amt"] * values["payment-freq"]

        let interestPaid =  totalPaid- princeplePaid;

        console.log(calc.betterCalculateBalance(values))

        events.emit("calculateBalance", {balance, princeplePaid, interestPaid, totalPaid})

    }
  
}

class DOMHandler {
    constructor(){
        this.cacheDOM = this.cacheDOM()
        this.eventListeners = this.eventListeners()
        this.bindEvents();
    }

    bindEvents(){
        events.on("calculateBalance", this.updateCalculatorBalance.bind(this))
    }

    cacheDOM(){
        let cacheDOM = {};

        let inputs = {
            loanInput: document.querySelector("#loan-amount"),
            rateInput: document.querySelector("#loan-rate"),
            termInput: document.querySelector("#loan-term"),
            termMonths: document.querySelector("#loan-term-months"),
            paymentAmt: document.querySelector("#payment-amt"),
            paymentFreqInput: document.querySelector("#payment-freq")
        }

        let buttons = {
            calculate: document.querySelector(".calculate-button")
        }

        let outputs = {
            princeplePaid: document.querySelector(".loan-principle").querySelector(".out-value"),
            interestPaid: document.querySelector(".loan-interest").querySelector(".out-value"),
            totalPaid: document.querySelector(".loan-total").querySelector(".out-value"),
            balance: document.querySelector(".loan-remaining").querySelector(".out-value")
        }

        cacheDOM = {inputs, buttons, outputs}

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

        events.emit("requestCalculator", inputValues);
    }

    updateCalculatorBalance(balance){
        this.cacheDOM.outputs.totalPaid.textContent = Math.floor(balance.totalPaid);
        this.cacheDOM.outputs.interestPaid.textContent = Math.floor(balance.interestPaid);
        this.cacheDOM.outputs.princeplePaid.textContent = Math.floor(balance.princeplePaid);
        this.cacheDOM.outputs.balance.textContent = Math.floor(balance.balance)

    }  

}

let dh = new DOMHandler()
let c = new LoanCalculator()