import events from "../pubsub.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
    }

    createCard(term, index) {

        const template = document.querySelector("#template-term-card").content.cloneNode(true);
        const card = template.querySelector(".term-card");

        card.dataset.index = index; // store index for reference

        this.populateCardFields(card, term);

        // Add event listeners
        card.querySelector(".edit").addEventListener("click", () => {
            events.emit("term:requestEdit", Number(card.dataset.index)); // Ask AppController to provide fresh data

        });

        card.querySelector(".delete").addEventListener("click", () => {
            events.emit("term:requestDelete", Number(card.dataset.index));
        });

        return card;
    }

    addCard(term, index) {
        const card = this.createCard(term, index);
        this.container.appendChild(card);
    }

    updateCard(term, index) {
        const card = this.container.querySelector(`[data-index="${index}"]`);
        if (!card) return;

        this.populateCardFields(card, term);

    }

    reRenderCards(terms) {
        //Remove all cards,
        this.container.innerHTML = ""

        //append all cards - deleted 
        if( Array.isArray(terms) || terms.length){
            terms.forEach((term, index) =>  this.addCard(term, index));
        }
    }


    formatTermDuration(term) {


        const months = Number(term.termMonths) !== 0 ? `${term.termMonths} months` : "";
        const years = Number(term.termYears) === 1 ? "year" : "years";
        return `${term.termYears} ${years} ${months}`;
    }

    populateCardFields(card, term) {
        card.querySelector(".loan-title").textContent = this.getTitleString(term)
        card.querySelector(".loan-dates").textContent = this.getLoanDatesString(term)

        //card.querySelector(".amount").textContent = `Amount: $${term.amount}`;
        //card.querySelector(".rate").textContent = `Rate: ${term.rate}%`;
        //card.querySelector(".term-duration").textContent = `Term: ${this.formatTermDuration(term)}`;
        //card.querySelector(".payments").textContent = `Payments: ${term.payments}`;
        //card.querySelector(".freq").textContent = `Frequency: ${term.paymentFreq}`;

        card.querySelector(".interest-paid").textContent = `Interest Paid: $${term.interestPaid}`;
        card.querySelector(".principle-paid").textContent = `Principle Paid: $${term.principlePaid}`;
        card.querySelector(".total-paid").textContent = `Total Paid: $${term.totalPaid}`;
        card.querySelector(".balance").textContent = `Balance: $${term.balance}`;
    }

    getLoanDatesString(term) {

        const startDate = new Date(term.startDate);

        const years = Number(term.termYears);
        const months = Number(term.termMonths);

        const endDate = new Date(
            startDate.getFullYear() + years,
            startDate.getMonth() + months,
            startDate.getDate()
        )

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric"
        }

        return `From ${startDate.toLocaleDateString(undefined, options)} till ${endDate.toLocaleDateString(undefined, options)}`
    }

    getTitleString(term) {
        const amountNumeric = parseInt(term.amount, 10);

        const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
            style: "currency",
            currency: "NZD",
            minimumFractionDigits: 0
        });

        const duration = this.formatTermDuration(term);

        return `${formattedAmount} fixed at ${term.rate}% for ${duration}`
    }

}
