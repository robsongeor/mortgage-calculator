import events from "../pubsub.js";
import { getLoanDurationInMonths, getLoanDatesString, getTitleString, getEndDate } from "./termCardUtils.js";

export function createTermCard(term, index, baseDate) {
    const template = document.querySelector("#template-term-card").content.cloneNode(true);
    const card = template.querySelector(".term-card");

    card.dataset.index = index;

    populateCardFields(card, term);

    card.querySelector(".edit").addEventListener("click", () => {
        events.emit("term:requestEdit", Number(card.dataset.index));
    });

    card.querySelector(".delete").addEventListener("click", () => {
        events.emit("term:requestDelete", Number(card.dataset.index));
    });

    const startDate = new Date(term.startDate);
    const totalMonths = getLoanDurationInMonths(term);
    const monthsFromBase = (startDate.getFullYear() - baseDate.getFullYear()) * 12 +
        (startDate.getMonth() - baseDate.getMonth());

    card.style.setProperty('--start', monthsFromBase + 1);
    card.style.setProperty('--duration', totalMonths);

    return card;
}

function populateCardFields(card, term) {
    card.querySelector(".loan-title").textContent = getTitleString(term);
    card.querySelector(".loan-dates").textContent = getLoanDatesString(term);
    card.querySelector(".interest-paid").textContent = `Interest Paid: $${term.interestPaid}`;
    card.querySelector(".principle-paid").textContent = `Principle Paid: $${term.principlePaid}`;
    card.querySelector(".total-paid").textContent = `Total Paid: $${term.totalPaid}`;
    card.querySelector(".balance").textContent = `Balance: $${term.balance}`;
}
