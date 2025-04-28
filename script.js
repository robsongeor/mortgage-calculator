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
        events.emit("openForm", true);
        events.emit("isCreate", true);
    }
}

class FormElement {
    constructor() {
        this.cacheDOM = this.cacheDOM()

        this.bindEvents()
        this.eventListeners()

        this.isEdit = false;
        this.isCreate = false;
    }

    cacheDOM() {
        let template = document.querySelector("#template-form").content.children[0];
        let form = template.cloneNode(true)
        let parentContainer = document.querySelector(".container");

        parentContainer.appendChild(form);

        let buttons = {
            save: form.querySelector(".save"),
            cancel: form.querySelector(".cancel")
        }

        let inputs = {
            amount : form.querySelector("#loan-amount"),
            rate: form.querySelector("#loan-rate"),
            term: form.querySelector("#loan-term"),
            termMonths: form.querySelector("#loan-term-months"),
            payments: form.querySelector("#loan-payments"),
            paymentFreq: form.querySelector("#loan-payment-freq")

        }

        return { form, buttons, inputs }
    }

    display(displayBool) {
        let displayType = "block"
        let displayProp = this.cacheDOM.form;

        displayBool ?
            displayProp.style.setProperty("display", displayType) :
            displayProp.style.setProperty("display", "none")

    }

    clearInputs(){
        //this.cacheDOM.inputs

        for(const value of Object.values(this.cacheDOM.inputs)){
            value.value = null;
        }
    }

    saveData(){
        // Store input values in object
        let inputData = {}

        for (const [key, element] of Object.entries(this.cacheDOM.inputs)){
            inputData[key] = Number(element.value)
        }

        //IF creating new term
        if(this.isCreate){
            events.emit("CreateNewTerm", inputData)
            
        }

        //If editing a term
        if(this.isEdit){
            events.emit("EditTerm", {inputData, index})
        }

        this.isCreate = false;
        this.isEdit = false;
        this.display(false);
        this.clearInputs()
    }

    eventListeners() {
        this.cacheDOM.buttons.save.addEventListener("click", this.saveData.bind(this));
        this.cacheDOM.buttons.cancel.addEventListener("click", () => this.display(false));
    }

    bindEvents() {
        events.on("openForm", this.display.bind(this))
        events.on("closeForm", this.display.bind(this))
        events.on("isCreate", () => this.isCreate = true)
    }

}

class TermsModule {
    //Handles Term data
    constructor (){
        this.termsArray = [];

        this.bindEvents()
    }

    createNewTerm(inputData){
        let index = this.termsArray.length
        let newTerm = new Term(inputData, index);

        this.termsArray.push(newTerm);

        console.log(this.termsArray);

        events.emit("CreateNewTermCard", newTerm)
    }

    editTermAtIndex(dataAndIndex){
        let index = termAndIndex.index;
        let inputData = termAndIndex.inputs;
        console.log(inputData, index)
        //this.termsArray[index].editTerm(inputData)
    }

    bindEvents(){
        events.on("CreateNewTerm", this.createNewTerm.bind(this))
    }
}

class Term {
    constructor (inputs, index){
        this.inputs = inputs;
        this.index = index;
    }

    editTerm(inputData){
        this.inputs = inputData;

        //Get new outputs
    }
}

class TermCardModule{
    //Handles the displaying of the terms
    constructor(){
        this.TermCards = [];

        this.bindEvents()
    }

    createNewTermCard(){
        let newTermCard = new TermCard();
        this.TermCards.push(newTermCard)
        
    }

    bindEvents(){
        events.on("CreateNewTermCard", this.createNewTermCard.bind(this))
    }
}

class TermCard {
    constructor(){
        this.cacheDOM = this.cacheDOM()
    }
    cacheDOM(){
        let template = document.querySelector("#template-term-card").content.children[0];
        let termCard = template.cloneNode(true)
        let parentContainer = document.querySelector(".container");

        let inputs = {
            amount : termCard.querySelector("#loan-amount"),
            rate: termCard.querySelector("#loan-rate"),
            term: termCard.querySelector("#loan-term"),
            termMonths: termCard.querySelector("#loan-term-months"),
            payments: termCard.querySelector("#loan-payments"),
            paymentFreq: termCard.querySelector("#loan-payment-freq")

        }

        parentContainer.appendChild(termCard);

        return {termCard, inputs}
    }
}

let formElement = new FormElement();
let htmlDom = new HTML_DOM();
let termsModule = new TermsModule()

let tcm = new TermCardModule();

let c = new LoanCalculator()