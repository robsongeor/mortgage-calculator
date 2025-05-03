import { createTermCard } from "./createTermCard.js";
import { getEarliestStartDate, groupByNonOverlappingDates, getOriginalIndex } from "./termCardUtils.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
        this.rows = [];
    }

    renderCards(terms) {
        this.container.innerHTML = "";
        this.rows = groupByNonOverlappingDates(terms);
        const baseDate = getEarliestStartDate(terms);

        this.rows.forEach((row, rowIndex) => {
            const rowDiv = this.createRowContainer(rowIndex);
            row.forEach(term => {
                const index = getOriginalIndex(term, terms);
                const card = createTermCard(term, index, baseDate);
                rowDiv.appendChild(card);
            });
            this.container.appendChild(rowDiv);
        });
    }

    createRowContainer(index) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("term-row", `term-row-${index}`);
        return rowDiv;
    }
}
