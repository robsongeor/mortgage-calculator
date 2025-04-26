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


}