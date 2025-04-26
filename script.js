class LoanCalculator {
    constructor(loanAmount, loanRate, loanTerm){
        this.loanAmount = loanAmount;
        this.loanRate = loanRate;
        this.loanTerm = loanTerm;
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

        
    }




}

let dh = new DOMHandler()