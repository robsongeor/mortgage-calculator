import events from "../pubsub.js";
import { amortizationAlgorithm } from "../../amortizationHelper.js";

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
            console.log(this.terms)
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

    parseLoanInput(input) {
        return {
            amount: Number(input.amount),
            rate: Number(input.rate),
            termYears: Number(input.termYears),
            termMonths: Number(input.termMonths),
            startDate: input.startDate,
            payments: Number(input.payments),
            paymentFreq: input.paymentFreq
        };
    }

    calculateTermOutputData(inputData) {
        const parsedInput = this.parseLoanInput(inputData);
        const test = amortizationAlgorithm(parsedInput);

        let outputs = {
            interestPaid: test.totalInterest,
            principlePaid: test.totalPrinciple,
            totalPaid: test.totalPayments,
            balance: test.finalBalance
        }

        return outputs;
    }
}
