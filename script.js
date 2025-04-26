import events from './pubsub.js'

class LoanCalculator {
    constructor(loanAmount, loanRate, loanTerm){
        this.loanAmount = loanAmount;
        this.loanRate = loanRate;
        this.loanTerm = loanTerm;

        events.on("requestCalculator", this.calculate.bind(this))
    }

    calculate(){
        console.log("calculate")
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

        events.emit("requestCalculator", inputValues);
    }




}

let dh = new DOMHandler()
let c = new LoanCalculator()