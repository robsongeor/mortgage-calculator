import events from "../pubsub.js";
import { amortizationAlgorithm } from "../utils/amortizationHelper.js";
import { clearAllValues, getEndDateISO, getInputFromData, setInputValue } from "../views/termCardUtils.js";
import { getValueByKey } from "../utils/DataStructureAccess.js";

export class TermsModule {
    constructor() {
        this.terms = [];  // Holds all term objects
    }

    addTerm(termData) {
       
        const newTerm = this.buildTerm(termData);

        this.terms.push(newTerm);
        events.emit("model:renderCards", this.terms)
    }

    editTerm(index, updatedTermData) {
        if (this.terms[index]) {
            const newTerm = this.buildTerm(updatedTermData);

            this.terms[index] = newTerm;
            events.emit("model:renderCards", this.terms)
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
            events.emit("model:renderCards", this.terms)
        } else {
            console.warn(`No term found at index ${index} to delete.`);
        }


    }

    createFromTerm(index) {
        let copy = structuredClone(this.getTerm(index));

        // Get data to copy
        const endDate = getEndDateISO(copy);
        const amount = getValueByKey("balance", copy)

        // Clear any values
        copy = clearAllValues(copy);

        // Copy the stored values
        copy = setInputValue("startDate",endDate ,copy)
        copy = setInputValue("amount", amount, copy);

        console.log(copy)

        return copy;
    }


    getTerm(index) {
        return this.terms[index];
    }

    getAllTerms() {
        return [...this.terms];  // Return a copy for safety
    }

    calculateTermOutputData(inputData) {

        const test = amortizationAlgorithm(inputData);

        console.log(inputData)

        let outputs = {
            interestPaid:{ value: test.totalInterest },
            principlePaid:{ value : test.totalPrinciple },
            totalPaid:{ value: test.totalPayments },
            balance:{ value: test.finalBalance }
        }



        return {outputs}
    }
}


