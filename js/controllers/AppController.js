import { AppModule } from "../views/AppModule.js";

export class AppController {
    constructor() {
        
        this.AppModule = new AppModule();
        //this.formElement = new FormElement();
        //this.termsModule = new TermsModule();
        //this.termCardModule = new TermCardModule();
        //this.loanCalculator = new LoanCalculator();

        this.registerEvents();
    }

    registerEvents() {
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