import events from "../pubsub.js";
import { AppModule } from "../views/AppModule.js";
import { FormView } from "../views/FormView.js";
import { TermsModule } from "../models/TermsModule.js";
import {TermCardModule} from "../views/TermCardModule.js"

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
        
            if(this.editing != null){
                // Edit existing term
                this.termsModule.editTerm(this.editing, inputData)
                this.editing = null;
            } else {
                // Add new term
                this.termsModule.addTerm(inputData)
            }

            events.emit("form:close")
        });

        events.on("form:cancel", () => {
            events.emit("form:close")
        })
        
        //Term Created
        events.on("model:termCreated", data => {
            let term = data.term;
            let index = data.index;
            this.termCardModule.addCard(term, index)
        });

        //Term Updated -> update DOM
        events.on("model:termUpdated", data => {
            let term = data.term;
            let index = data.index;
            this.termCardModule.updateCard(term, index)
        })

        //Term Deleted -> update DOM
        events.on("model:termDeleted", ({index}) => {
            this.termCardModule.deleteCard(index);
        })

        events.on("term:requestDelete", index =>{
            this.termsModule.deleteTerm(index);
        });

        //Request term for form
        events.on("term:requestEdit", index => {
            console.log("Editting index" + index)
            this.editing = index;
            const term = this.termsModule.getTerm(index);
            events.emit("form:populate", term);
            events.emit("form:open");
        });

    }
}