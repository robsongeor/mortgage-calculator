import { createTermCard } from "./createTermCard.js";
import { getEarliestStartDate, groupByNonOverlappingDates, getOriginalIndex } from "./termCardUtils.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
    }

    renderCards(terms) {
        this.clearContainer();
        const rows = groupByNonOverlappingDates(terms);
        const baseDate = getEarliestStartDate(terms);
        const fragment = document.createDocumentFragment();

        rows.forEach((row, rowIndex) => {
            const rowDiv = this.createRowContainer(rowIndex);
            row.forEach(term => {
                this.addTermCardToRow(term, terms, rowDiv, baseDate);
            });
            fragment.appendChild(rowDiv);
        });

        this.container.appendChild(fragment);
    }

    clearContainer() {
        this.container.innerHTML = "";
    }

    createRowContainer(index) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("term-row", `term-row-${index}`);
        return rowDiv;
    }

    addTermCardToRow(term, terms, rowDiv, baseDate) {
        const index = getOriginalIndex(term, terms);
        const card = createTermCard(term, index, baseDate);
        rowDiv.appendChild(card);
    }
}
