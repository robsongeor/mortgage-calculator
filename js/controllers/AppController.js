import events from "../pubsub.js";
import { AppModule } from "../views/AppModule.js";
import { TermsModule } from "../models/TermsModule.js";
import { TermCardModule } from "../views/TermCardModule.js"

import FormController from "./FormController.js";

export class AppController {
    constructor() {

        this.AppModule = new AppModule();
        this.FormController = new FormController()
        this.termsModule = new TermsModule();
        this.termCardModule = new TermCardModule();

        this.editing = null; // stores the index of the term to edit, if null used to create new term

        this.registerEvents();

        this.startWithTest();

    }

    registerEvents() {
        //Form Events
        events.on("form:save", inputData => this.handleFormSave(inputData));
        events.on("form:cancel", () => events.emit("form:close"))

        //Update UI Card Events
        events.on("model:renderCards", (terms) => this.termCardModule.renderCards(terms));

        //Term Data Modal Events
        events.on("term:requestCreateFrom", index => this.handleCreateFromRequest(index))
        events.on("term:requestDelete", index => this.termsModule.deleteTerm(index));
        events.on("term:requestEdit", index => this.handleEditRequest(index));

    }

    handleCreateFromRequest(index) {
        //Creates a term prefilled with the term end dates and balance
        const newTerm = this.termsModule.createFromTerm(index)
        events.emit("form:populate", newTerm);
        events.emit("form:open");

        console.log(newTerm)
    }

    handleEditRequest(index) {
        this.editing = index;
        const term = this.termsModule.getTerm(index);
        events.emit("form:populate", term);
        events.emit("form:open");
    }

    handleFormSave(inputData) {

        if (this.editing != null) {
            // Edit existing term
            this.termsModule.editTerm(this.editing, inputData)
            this.editing = null;
        } else {
            // Add new term
            this.termsModule.addTerm(inputData)
        }

        events.emit("form:close")
    }

    startWithTest() {
        const testTerms =
            [
                {
                    "loanInputs": [
                        {
                            "amount": 210000,
                            "rate": 6.69,
                            "termYears": 2,
                            "termMonths": 0,
                            "startDate": "2023-09-20",
                            "repayments": 310.76,
                            "repaymentsFreq": "weekly",
                        }
                    ],
                    "repaymentAdjustments": [
                        {
                            "ra_repayments": 550,
                            "ra_date": "2023-12-25"
                        }
                    ],
                    "interestOnlyPeriods": [],
                    "lumpSumPayments": [],
                    "paymentHolidays": []
                }
            ]
            ;


        testTerms.forEach((term) => this.termsModule.addTerm(term))
    }
}


let c = {
    "loanInputs": [
        {
            "amount": 210000,
            "rate": 6.69,
            "termYears": 2,
            "termMonths": 0,
            "startDate": "2023-09-20",
            "repayments": 310.76,
            "repaymentsFreq": "weekly",
        }
    ],
    "repaymentAdjustments": [
        {
            "ra_repayments": 550,
            "ra_date": "2023-12-25"
        }
    ],
    "interestOnlyPeriods": [],
    "lumpSumPayments": [],
    "paymentHolidays": []
}