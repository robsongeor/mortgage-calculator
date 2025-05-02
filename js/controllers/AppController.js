import events from "../pubsub.js";
import { AppModule } from "../views/AppModule.js";
import { FormView } from "../views/FormView.js";
import { TermsModule } from "../models/TermsModule.js";
import {TermCardModule} from "../views/TermCardModule.js"
import { LoanCalculator } from "../models/LoanCalculator.js";

export class AppController {
    constructor() {
        
        this.AppModule = new AppModule();
        this.formView = new FormView();
        this.termsModule = new TermsModule();
        this.termCardModule = new TermCardModule();
        this.loanCalculator = new LoanCalculator();

        this.editing = null; // stores the index of the term to edit, if null used to create new term

        this.registerEvents();

        this.startWithTest();
    }

    registerEvents() {
        //Form Events
        events.on("form:save", inputData => this.handleFormSave(inputData));
        events.on("form:cancel", () => events.emit("form:close"))
        
        //Update UI Card Events
        // events.on("model:termCreated", ({term, index}) => this.termCardModule.addCard(term, index));
        // events.on("model:termUpdated", ({term, index}) => this.termCardModule.updateCard(term, index));
        // events.on("model:termDeleted", (terms) => this.termCardModule.renderCards(terms));
        events.on("model:renderCards", (terms) => this.termCardModule.renderCards(terms));

        //Term Data Modal Events
        events.on("term:requestDelete", index =>this.termsModule.deleteTerm(index));
        events.on("term:requestEdit", index => this.handleEditRequest(index));

    }

    handleEditRequest(index){
        this.editing = index;
        const term = this.termsModule.getTerm(index);
        events.emit("form:populate", term);
        events.emit("form:open");
    }

    handleFormSave(inputData) {
                    
        if(this.editing != null){
            // Edit existing term
            this.termsModule.editTerm(this.editing, inputData)
            this.editing = null;
        } else {
            // Add new term
            this.termsModule.addTerm(inputData)
        }

        events.emit("form:close")
    }

    startWithTest(){
        const testTerms = [
            {
              startDate: "2025-01-01",
              amount: 200000,
              rate: 5.2,
              termYears: 2,
              termMonths: 0,
              payments: 200,
              paymentFreq: "weekly"
            },
            {
              startDate: "2025-02-01", // overlaps with 1st
              amount: 150000,
              rate: 4.9,
              termYears: 1,
              termMonths: 6,
              payments: 180,
              paymentFreq: "monthly"
            },
            {
              startDate: "2025-04-01", // overlaps with both above
              amount: 175000,
              rate: 5.1,
              termYears: 1,
              termMonths: 0,
              payments: 220,
              paymentFreq: "fortnightly"
            },
            {
              startDate: "2027-01-01", // no overlap with any
              amount: 100000,
              rate: 5.0,
              termYears: 1,
              termMonths: 0,
              payments: 250,
              paymentFreq: "monthly"
            },
            {
              startDate: "2025-06-01", // overlaps with 1, 2, 3
              amount: 130000,
              rate: 5.4,
              termYears: 2,
              termMonths: 0,
              payments: 210,
              paymentFreq: "weekly"
            },
            {
              startDate: "2028-02-01", // no overlap with anything
              amount: 110000,
              rate: 4.7,
              termYears: 1,
              termMonths: 0,
              payments: 190,
              paymentFreq: "fortnightly"
            }
          ];
          

        testTerms.forEach((term) => this.termsModule.addTerm(term))

        //this.termCardModule.groupByNonOverlappingDates(testTerms)
    }
}