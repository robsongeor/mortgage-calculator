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
            console.log(inputData)
            this.termsModule.addTerm(inputData)
        }

        events.emit("form:close")
    }

    startWithTest() {
        const testTerms =
            [{
                loanInputs: {
                  amount: { value: 210000 },
                  rate: { value: 6.69 },
                  termYears: { value: 2 },
                  termMonths: { value: 0 },
                  startDate: { value: "2023-09-20" },
                  repayments: { value: 310.76 },
                  repaymentsFreq: { value: "weekly" }
                },
                repaymentAdjustments: {
                  ra_0_repayments: { value: 550 },
                  ra_0_date: { value: "2025-03-20" }
                },
                interestOnlyPeriods: {},
                lumpSumPayments: {},
                paymentHolidays: {}
              },
              {
                "loanInputs": {
                    "amount": {
                        "value": 510000
                    },
                    "rate": {
                        "value": 6.89
                    },
                    "termYears": {
                        "value": 1
                    },
                    "termMonths": {
                        "value": 6
                    },
                    "startDate": {
                        "value": "2023-09-20"
                    },
                    "repayments": {
                        "value": 770.25
                    },
                    "repaymentsFreq": {
                        "value": "weekly"
                    }
                },
                "repaymentAdjustments": {
                    "ra_0_date": {
                        "value": "2025-05-18"
                    },
                    "ra_0_repayments": {
                        "value": 1
                    }
                },
                "interestOnlyPeriods": {},
                "lumpSumPayments": {},
                "paymentHolidays": {}
            },
            {
                "loanInputs": {
                    "amount": {
                        "value": 500384.31
                    },
                    "rate": {
                        "value": 5.79
                    },
                    "termYears": {
                        "value": 0
                    },
                    "termMonths": {
                        "value": 6
                    },
                    "startDate": {
                        "value": "2025-03-20"
                    },
                    "repayments": {
                        "value": 800
                    },
                    "repaymentsFreq": {
                        "value": "weekly"
                    }
                },
                "repaymentAdjustments": {
                    "ra_0_date": {
                        "value": "2026-01-31"
                    },
                    "ra_0_repayments": {
                        "value": 1
                    }
                },
                "interestOnlyPeriods": {},
                "lumpSumPayments": {},
                "paymentHolidays": {}
            }
            
            ]
            ;



        testTerms.forEach((term) => this.termsModule.addTerm(term))
    }
}


let c = {
    loanInputs: {
      amount: { value: 210000 },
      rate: { value: 6.69 },
      termYears: { value: 2 },
      termMonths: { value: 0 },
      startDate: { value: "2023-09-20" },
      repayments: { value: 310.76 },
      repaymentsFreq: { value: "weekly" }
    },
    repaymentAdjustments: {
      ra_0_repayments: { value: 550 },
      ra_0_date: { value: "2023-12-25" }
    },
    interestOnlyPeriods: {},
    lumpSumPayments: {},
    paymentHolidays: {}
  };
