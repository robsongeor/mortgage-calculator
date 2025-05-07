import events from "../pubsub.js";
import { AppModule } from "../views/AppModule.js";
import { FormView } from "../views/FormView/FormView.js";
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
        events.on("model:renderCards", (terms) => this.termCardModule.renderCards(terms));

        //Term Data Modal Events
        events.on("term:requestCreateFrom", index => this.handleCreateFromRequest(index))
        events.on("term:requestDelete", index =>this.termsModule.deleteTerm(index));
        events.on("term:requestEdit", index => this.handleEditRequest(index));

    }

    handleCreateFromRequest(index){
        const newTerm = this.termsModule.getDataForCreateFrom(index)
        events.emit("form:populate", newTerm);
        events.emit("form:open");

        console.log(newTerm)
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
            "amount": "510000",
            "rate": "6.89",
            "termYears": "1",
            "termMonths": "6",
            "startDate": "2023-09-20",
            "payments": "770",
            "paymentFreq": "weekly",
            "interestPaid": 50464.76,
            "principlePaid": 9595.24,
            "totalPaid": 60060,
            "balance": 500404.76
        },
        {
            "amount": "210000",
            "rate": "6.69",
            "termYears": "1",
            "termMonths": "6",
            "startDate": "2023-09-20",
            "payments": "310",
            "paymentFreq": "weekly",
            "interestPaid": 20174.05,
            "principlePaid": 4005.95,
            "totalPaid": 24180,
            "balance": 205994.05
        },
        {
            "amount": "500404",
            "rate": "5.79",
            "termYears": "0",
            "termMonths": "6",
            "startDate": "2025-03-20",
            "payments": "800",
            "paymentFreq": "weekly",
            "interestPaid": 13079.85,
            "principlePaid": 7720.15,
            "totalPaid": 20800,
            "balance": 492683.85
        },
        {
            "amount": "205994",
            "rate": "6.69",
            "termYears": "0",
            "termMonths": "6",
            "startDate": "2025-03-20",
            "payments": "560",
            "paymentFreq": "weekly",
            "interestPaid": 6151.6,
            "principlePaid": 8408.4,
            "totalPaid": 14560,
            "balance": 197585.6
        },
        {
            "amount": "210000",
            "rate": "6.69",
            "termYears": "2",
            "termMonths": "0",
            "startDate": "2023-09-20",
            "payments": "310",
            "paymentFreq": "weekly",
            "termPayChgAmt": "560",
            "termPayChgDate": "2025-03-20",
            "interestPaid": 26449.079999999998,
            "principlePaid": 12290.919999999998,
            "totalPaid": 38740,
            "balance": 407709.07999999996
        }
          ];
          

        testTerms.forEach((term) => this.termsModule.addTerm(term))

        //this.termCardModule.groupByNonOverlappingDates(testTerms)
    }
}

[
  {
      "amount": "510000",
      "rate": "6.89",
      "termYears": "1",
      "termMonths": "6",
      "startDate": "2023-09-20",
      "payments": "770",
      "paymentFreq": "weekly",
      "interestPaid": 50464.76,
      "principlePaid": 9595.24,
      "totalPaid": 60060,
      "balance": 500404.76
  },
  {
      "amount": "210000",
      "rate": "6.69",
      "termYears": "1",
      "termMonths": "6",
      "startDate": "2023-09-20",
      "payments": "310",
      "paymentFreq": "weekly",
      "interestPaid": 20174.05,
      "principlePaid": 4005.95,
      "totalPaid": 24180,
      "balance": 205994.05
  },
  {
      "amount": "500404",
      "rate": "5.79",
      "termYears": "0",
      "termMonths": "6",
      "startDate": "2025-03-20",
      "payments": "800",
      "paymentFreq": "weekly",
      "interestPaid": 13079.85,
      "principlePaid": 7720.15,
      "totalPaid": 20800,
      "balance": 492683.85
  },
  {
      "amount": "205994",
      "rate": "6.69",
      "termYears": "0",
      "termMonths": "6",
      "startDate": "2025-03-20",
      "payments": "560",
      "paymentFreq": "weekly",
      "interestPaid": 6151.6,
      "principlePaid": 8408.4,
      "totalPaid": 14560,
      "balance": 197585.6
  }
]