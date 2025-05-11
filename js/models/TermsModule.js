import events from "../pubsub.js";
import { amortizationAlgorithm } from "../../amortizationHelper.js";
import { clearAllValues, getEndDate, getEndDateISO, getInputFromData, setInputValue } from "../views/termCardUtils.js";

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

        console.log({ ...termData, ...outputData });

        return { ...termData, ...outputData };
    }

    deleteTerm(index) {
        if (this.terms[index]) {
            const deletedTerm = this.terms.splice(index, 1)[0];
            events.emit("model:renderCards", this.terms)
            console.log(this.terms)
        } else {
            console.warn(`No term found at index ${index} to delete.`);
        }


    }

    createFromTerm(index) {
        let copy = structuredClone(this.getTerm(index));

        // Get data to copy
        const endDate = getEndDateISO(copy);
        const amount = getInputFromData("balance", copy)

        // Clear any values
        clearAllValues(copy);

        // Copy the stored values
        setInputValue("startDate",endDate ,copy)
        setInputValue("amount", amount, copy);

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

        console.log(test)

        let outputs = [
            { interestPaid: test.totalInterest },
            { principlePaid: test.totalPrinciple },
            { totalPaid: test.totalPayments },
            { balance: test.finalBalance }
        ]

        return {outputs};
    }
}
