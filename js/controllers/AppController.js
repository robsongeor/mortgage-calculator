import events from "../pubsub.js";
import { AppModule } from "../views/AppModule.js";
import { FormView } from "../views/FormView.js";
import { TermsModule } from "../models/TermsModule.js";

export class AppController {
    constructor() {
        
        this.AppModule = new AppModule();
        this.formView = new FormView();
        this.termsModule = new TermsModule();
        this.termCardModule = new TermCardModule();
        //this.loanCalculator = new LoanCalculator();

        this.editing = null; // stores the index of the term to edit, if null used to create new term

        this.registerEvents();
    }

    registerEvents() {
        //On save
        events.on("form:save", inputData => {
            
            if(this.editing){
                this.termsModule.editTerm(this.editing, inputData)
                this.editing = null;
            } else {
                this.termsModule.addTerm(inputData)
            }

            events.emit("form:close")
        });

        events.on("form:cancel", () => {
            events.emit("form:close")
        })

        // // Forward calculations from terms to calculator
        // events.on("CreateNewTerm", (inputData) => {
        //     events.emit("requestCalculator", inputData);
        // });

        // events.on("EditTerm", ({ inputData }) => {
        //     events.emit("requestCalculator", inputData);
        // });

        // // When calculator finishes, augment term
        // events.on("calculateBalance", (outputs) => {
        //     // Possibly emit or integrate into card creation/edit
        //     // Up to you whether to store outputs in model directly
        // });
    }
}