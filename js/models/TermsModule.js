import events from "../pubsub.js";

export class TermsModule {
    constructor() {
        this.terms = [];  // Holds all term objects
    }

    addTerm(termData) {
        this.terms.push(termData);
        events.emit("model:termCreated", { term: termData, index: this.terms.length - 1 });
    }

    editTerm(index, updatedTermData) {
        if (this.terms[index]) {
            this.terms[index] = updatedTermData;
            events.emit("model:termUpdated", { term: updatedTermData, index });
        } else {
            console.warn(`No term found at index ${index} to edit.`);
        }

    }

    deleteTerm(index) {
        console.log(this.terms)

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
}
