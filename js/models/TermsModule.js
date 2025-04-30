import events from "../pubsub.js";
import { amortizationAlgorithm } from "../../amortizationHelper.js";

export class TermsModule {
    constructor() {
        this.terms = [];  // Holds all term objects
    }

    addTerm(termData) {

        const newTerm = this.buildTerm(termData);

        this.terms.push(newTerm);
        events.emit("model:termCreated", { term: newTerm, index: this.terms.length - 1 });
        console.log(this.terms)
    }

    editTerm(index, updatedTermData) {
        if (this.terms[index]) {
            const newTerm = this.buildTerm(updatedTermData);

            this.terms[index] = newTerm;
            events.emit("model:termUpdated", { term: newTerm, index });
        } else {
            console.warn(`No term found at index ${index} to edit.`);
        }

    }

    buildTerm(termData) {
        const outputData = this.calculateTermOutputData(termData);
        return { ...termData, ...outputData };
    }

    deleteTerm(index) {
        if (this.terms[index]) {
            const deletedTerm = this.terms.splice(index, 1)[0];
            events.emit("model:termDeleted", { term: deletedTerm, index });
        } else {
            console.warn(`No term found at index ${index} to delete.`);
        }


    }

    getTerm(index) {
        return this.terms[index];
    }

    getAllTerms() {
        return [...this.terms];  // Return a copy for safety
    }

    calculateTermOutputData(inputData) {

        let test = amortizationAlgorithm(inputData)

        let outputs = {
            interestPaid: 75,
            principlePaid: 100,
            totalPaid: 100,
            balance: 69
        }

        return outputs;
    }
}
