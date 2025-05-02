import events from "../pubsub.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
        this.rows = [];
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

    renderCards(terms) {
        // Clear existing cards
        this.container.innerHTML = "";

        // Group terms into rows
        this.rows = this.groupByNonOverlappingDates(terms);

        //For each row create new row-container
        this.rows.forEach((row, index) => {
            const rowDiv = this.createRowContainer(index);

            row.forEach(term => {
                const termsIndex = this.getOriginalIndex(term, terms);
                const card = this.createCard(term, termsIndex);

                rowDiv.appendChild(card);
            })

            this.container.appendChild(rowDiv);
        })

    }

    createRowContainer(index){
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("term-row", `term-row-${index}`);
        return rowDiv;
    }

    getOriginalIndex(term, terms) {
        return terms.indexOf(term);
    }

    groupByNonOverlappingDates(terms) {
        const rows = [];
        const sorted = [...terms].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        for (const term of sorted) {
            const termStart = new Date(term.startDate);
            const termEnd = this.getEndDate(term);

            const row = this.findAvailableRow(termStart, termEnd, rows);

            if (row) {
                row.push(term);
            } else {
                rows.push([term]);
            }
        }
        console.log(rows)
        return rows;
    }

    findAvailableRow(termStart, termEnd, rows) {
        for (const row of rows) {
            const hasOverlap = row.some(existing => this.datesOverlap(
                termStart, termEnd,
                new Date(existing.startDate),
                this.getEndDate(existing)
            ));

            if (!hasOverlap) return row;
        }

        return null;
    }

    datesOverlap(startA, endA, startB, endB) {
        return startA < endB && startB < endA;
    }


    formatTermDuration(term) {
        const months = Number(term.termMonths) !== 0 ? `${term.termMonths} months` : "";
        const years = Number(term.termYears) === 1 ? "year" : "years";
        return `${term.termYears} ${years} ${months}`;
    }

    populateCardFields(card, term) {
        card.querySelector(".loan-title").textContent = this.getTitleString(term)
        card.querySelector(".loan-dates").textContent = this.getLoanDatesString(term)

        card.querySelector(".interest-paid").textContent = `Interest Paid: $${term.interestPaid}`;
        card.querySelector(".principle-paid").textContent = `Principle Paid: $${term.principlePaid}`;
        card.querySelector(".total-paid").textContent = `Total Paid: $${term.totalPaid}`;
        card.querySelector(".balance").textContent = `Balance: $${term.balance}`;
    }

    getEndDate(term) {
        const startDate = new Date(term.startDate);

        const years = Number(term.termYears);
        const months = Number(term.termMonths);

        return new Date(
            startDate.getFullYear() + years,
            startDate.getMonth() + months,
            startDate.getDate()
        )


    }

    getLoanDatesString(term) {

        const startDate = new Date(term.startDate);

        const endDate = this.getEndDate(term);

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
