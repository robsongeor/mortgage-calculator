import events from "../pubsub.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
        this.cards = [];
    }

    createCard(term, index) {
       // console.log(term)
    
        const template = document.querySelector("#template-term-card").content.cloneNode(true);
        const card = template.querySelector(".term-card");
        
        card.dataset.index = index; // store index for reference

        const termMonthsString = term.termMonths ? `${term.termMonths} months` : "";
        const termYearsString = term.termYears == 1 ? `year` : 'years'

        // Populate card fields
        card.querySelector(".amount").textContent = `Amount: $${term.amount}`;
        card.querySelector(".rate").textContent = `Rate: ${term.rate}%`;
        card.querySelector(".term-duration").textContent = `Term: ${term.termYears} ${termYearsString} ${termMonthsString}`;
        card.querySelector(".payments").textContent = `Payments: ${term.payments}`;
        card.querySelector(".freq").textContent = `Frequency: ${term.paymentFreq}`;

        // Add event listeners
        card.querySelector(".edit").addEventListener("click", () => {
            card.querySelector(".edit").addEventListener("click", () => {
                events.emit("term:editIndex", index); // Set index first
                events.emit("term:requestEdit", index); // Ask AppController to provide fresh data
            });
        });

        card.querySelector(".delete").addEventListener("click", () => {
            events.emit("term:delete", index);
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


        const termMonthsString = term.termMonths ? `${term.termMonths} months` : "";
        const termYearsString = term.termYears == 1 ? `year` : 'years'

        card.querySelector(".amount").textContent = `Amount: $${term.amount}`;
        card.querySelector(".rate").textContent = `Rate: ${term.rate}%`;
        card.querySelector(".term-duration").textContent = `Term: ${term.termYears} ${termYearsString} ${termMonthsString}`;
        card.querySelector(".payments").textContent = `Payments: ${term.payments}`;
        card.querySelector(".freq").textContent = `Frequency: ${term.paymentFreq}`;

        // Update other fields if needed
    }

    deleteCard(index) {
        const card = this.container.querySelector(`[data-index="${index}"]`);
        if (card) {
            this.container.removeChild(card);
        }
    }
}
