import events from './pubsub.js'
import calc from './calculatorHelper.js';


class LoanCalculator {
    constructor(loanAmount, loanRate, loanTerm) {
        this.loanAmount = loanAmount;
        this.loanRate = loanRate;
        this.loanTerm = loanTerm;

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

class HTML_DOM {
    constructor() {
        this.cacheDOM = this.cacheDOM();

        this.eventListeners()
    }

    cacheDOM() {
        let buttons = {
            createNew: document.querySelector(".create"),
        }

        return { buttons }
    }

    eventListeners() {
        this.cacheDOM.buttons.createNew.addEventListener("click", this.createNew)
    }

    createNew() {
        events.emit("openForm", true)
    }
}

class FormElement {
    constructor() {
        this.cacheDOM = this.cacheDOM()

        this.bindEvents()
    }

    cacheDOM() {
        let template = document.querySelector("#template-form").content.children[0];
        let form = template.cloneNode(true)
        let parentContainer = document.querySelector(".container");

        parentContainer.appendChild(form);


        return { form }
    }

    display(displayBool) {
        let displayType = "block"
        let displayProp = this.cacheDOM.form;

        displayBool ?
            displayProp.style.setProperty("display", displayType) :
            displayProp.style.setProperty("display", "none")

    }

    bindEvents() {
        events.on("openForm", this.display.bind(this))
        events.on("closeForm", this.display.bind(this))
    }

}

let formElement = new FormElement();
let htmlDom = new HTML_DOM();

let c = new LoanCalculator()