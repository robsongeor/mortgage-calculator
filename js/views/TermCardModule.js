import events from "../pubsub.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
    }

    createCard(term, index) {

        const template = document.querySelector("#template-term-card").content.cloneNode(true);
        const card = template.querySelector(".term-card");

        card.dataset.index = index; // store index for reference

        // Populate card fields
        card.querySelector(".amount").textContent = `Amount: $${term.amount}`;
        card.querySelector(".rate").textContent = `Rate: ${term.rate}%`;
        card.querySelector(".term-duration").textContent = this.formatTermDuration(term);
        card.querySelector(".payments").textContent = `Payments: ${term.payments}`;
        card.querySelector(".freq").textContent = `Frequency: ${term.paymentFreq}`;

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


        card.querySelector(".amount").textContent = `Amount: $${term.amount}`;
        card.querySelector(".rate").textContent = `Rate: ${term.rate}%`;
        card.querySelector(".term-duration").textContent = this.formatTermDuration(term)
        card.querySelector(".payments").textContent = `Payments: ${term.payments}`;
        card.querySelector(".freq").textContent = `Frequency: ${term.paymentFreq}`;

    }

    deleteCard(index) {
        const card = this.container.querySelector(`[data-index="${index}"]`);
        if (card) {
            this.container.removeChild(card);
        } else {
            console.warn(`Card with index ${index} not found in DOM`);
        }

        // Reindex remaining cards
        const allCards = this.container.querySelectorAll(".term-card");
        allCards.forEach((card, newIndex) => {
            card.dataset.index = newIndex;
        });


    }


    formatTermDuration(term) {
        const months = term.termMonths ? `${term.termMonths} months` : "";
        const years = term.termYears === 1 ? "year" : "years";
        return `Term: ${term.termYears} ${years} ${months}`;
    }


}
