import events from './pubsub.js'
import calc from './calculatorHelper.js';


class LoanCalculator {
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

class HTML_DOM {
    //Handle DOM on page

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
        this.editIndex = 0;
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
            let index = this.editIndex;
            events.emit("EditTerm", {inputData, index})
        }

        this.isCreate = false;
        this.isEdit = false;
        this.display(false);
        this.clearInputs()
    }

    recieveInputs(inputAndIndex){
        this.display(true);
        this.isEdit = true;
        this.editIndex = inputAndIndex.index;
        
        let inputs = inputAndIndex.inputData;

        for(const [key, value] of Object.entries(this.cacheDOM.inputs)){
            value.value = inputs[key]
        }
    }

    eventListeners() {
        this.cacheDOM.buttons.save.addEventListener("click", this.saveData.bind(this));
        this.cacheDOM.buttons.cancel.addEventListener("click", () => this.display(false));
    }

    bindEvents() {
        events.on("openForm", this.display.bind(this))
        events.on("closeForm", this.display.bind(this))
        events.on("isCreate", () => this.isCreate = true)
        events.on("EditThisTerm", this.recieveInputs.bind(this))
    }

}

//

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

        events.emit("CreateNewTermCard", newTerm)
    }

    editTermAtIndex(dataAndIndex){

        let index = dataAndIndex.index;
        let inputData = dataAndIndex.inputData;

        this.termsArray[index].editTerm(inputData)
    }

    sendTermDataToForm(index){
        let inputData = this.termsArray[index].inputs

        events.emit("EditThisTerm", {inputData, index})
    }

    deleteTermAtIndex(index){
        //remove element from array
        this.termsArray.splice(index, 1);

        //update indices for each item
        this.updateIndices()

    }

    updateIndices(){
        this.termsArray.forEach((element, index) => {
            element.index = index;
        });
    }

    bindEvents(){
        events.on("CreateNewTerm", this.createNewTerm.bind(this))
        events.on("EditTerm", this.editTermAtIndex.bind(this))
        events.on("DeleteTermButton", this.deleteTermAtIndex.bind(this))
        events.on("EditTermButton", this.sendTermDataToForm.bind(this))
    }
}

class Term {
    constructor (inputs, index){
        this.inputs = inputs;
        this.index = index;
    }

    editTerm(inputData){
        //updating term data from form
        this.inputs = inputData;
        
        //updating DOM
        events.emit("UpdatedTerm", this)
    }
}

class TermCardModule{
    //Handles the displaying of the terms
    constructor(){
        this.termCards = [];

        this.bindEvents()
    }

    createNewTermCard(term){
        let newTermCard = new TermCard(term.index);
        newTermCard.updateContent(term)

        this.termCards.push(newTermCard)
        
    }

    updateTermCard(term){
        let index = term.index;

        this.termCards[index].updateContent(term)
    }

    
    deleteTermAtIndex(index){
        //Remove element from DOM
        this.termCards[index].cacheDOM.termCard.remove();
        
        //remove element from array
        this.termCards.splice(index, 1);

        //update indices for each item
        this.updateIndices()
    }

    updateIndices(){
        this.termCards.forEach((element, index) => {
            console.log
            element.index = index;
        });
    }


    bindEvents(){
        events.on("CreateNewTermCard", this.createNewTermCard.bind(this))
        events.on("DeleteTermButton", this.deleteTermAtIndex.bind(this))
        events.on("UpdatedTerm", this.updateTermCard.bind(this))
    }
}

class TermCard {
    constructor(index){
        this.cacheDOM = this.cacheDOM()
        this.index = index;

        this.eventListeners()
    }
    cacheDOM(){
        let template = document.querySelector("#template-term-card").content.children[0];
        let termCard = template.cloneNode(true)
        let parentContainer = document.querySelector(".container");

        let inputs = {
            amount : termCard.querySelector(".loan-amount"),
            rate: termCard.querySelector(".loan-rate"),
            term: termCard.querySelector(".loan-term"),
            termMonths: termCard.querySelector(".loan-term-months"),
            payments: termCard.querySelector(".loan-payments"),
            paymentFreq: termCard.querySelector(".loan-payment-freq")
        }

        let buttons = {
            edit : termCard.querySelector(".edit-button"),
            delete : termCard.querySelector(".delete-button")
        }

        parentContainer.appendChild(termCard);

        return {termCard, inputs, buttons}
    }

    updateContent(term){   
        //Update input text
        for( const [key, value] of Object.entries(this.cacheDOM.inputs)){
            value.textContent = term.inputs[key]
        }
    }

    editTerm(){
        events.emit("EditTermButton", this.index)
    }

    deleteTerm(){
        events.emit("DeleteTermButton", this.index)
    }

    eventListeners(){
        this.cacheDOM.buttons.edit.addEventListener("click", this.editTerm.bind(this))
        this.cacheDOM.buttons.delete.addEventListener("click", this.deleteTerm.bind(this))
    }
}

let formElement = new FormElement();
let htmlDom = new HTML_DOM();
let termsModule = new TermsModule()

let tcm = new TermCardModule();

let c = new LoanCalculator()