import events from "../pubsub.js";
import {
    getLoanDurationInMonths,
    getLoanDatesString,
    getTitleString,
    getTermString,
    getLocaleDollarString,
} from "./termCardUtils.js";

// Main function to create a Term Card
export function createTermCard(term, index, baseDate) {
    const card = createCardFromTemplate();
    card.dataset.index = index;

    populateCardFields(card, term);
    attachCardEventListeners(card);
    setCardStyles(card, term, baseDate);
    renderBarChart(card, term);

    return card;
}

// -- DOM Construction --
function createCardFromTemplate() {
    const template = document.querySelector("#template-term-card").content.cloneNode(true);
    return template.querySelector(".term-card");
}

function populateCardFields(card, term) {
    card.querySelector(".loan-amount").textContent = getTitleString(term);
    card.querySelector(".loan-rate").textContent = `${term.rate}%`;
    card.querySelector(".loan-term").textContent = getTermString(term);
    card.querySelector(".loan-dates").textContent = getLoanDatesString(term);
    card.querySelector(".interest-paid").textContent = `I: ${getLocaleDollarString(term.interestPaid)}`;
    card.querySelector(".principle-paid").textContent = `P: ${getLocaleDollarString(term.principlePaid)}`;
    card.querySelector(".balance").textContent = getLocaleDollarString(term.balance);
}

function attachCardEventListeners(card) {
    card.querySelector(".edit").addEventListener("click", () =>
        events.emit("term:requestEdit", Number(card.dataset.index))
    );
    card.querySelector(".delete").addEventListener("click", () =>
        events.emit("term:requestDelete", Number(card.dataset.index))
    );
}

function setCardStyles(card, term, baseDate) {
    const startDate = new Date(term.startDate);
    const monthsFromBase = (startDate.getFullYear() - baseDate.getFullYear()) * 12 +
        (startDate.getMonth() - baseDate.getMonth());
    const totalMonths = getLoanDurationInMonths(term);

    card.style.setProperty('--start', monthsFromBase + 1);
    card.style.setProperty('--duration', totalMonths);
}

// -- SVG Chart --
function renderBarChart(card, term) {
    const svg = createSVGBarChart(term);
    const container = card.querySelector(".svg-graph");
    container.appendChild(svg);
}

function createSVGBarChart(term) {
    const svgTemplate = document.querySelector('#template-card-bar-chart').content.cloneNode(true);
    const svg = svgTemplate.querySelector("#svg-bar");

    const rects = {
        balance: svg.querySelector("#rect-balance"),
        interest: svg.querySelector("#rect-interest"),
        principle: svg.querySelector("#rect-principle"),
    };

    let showOnlyPaid = false;

    function updateChart() {
        const total = term.balance + term.totalPaid;
        const widths = calculateWidths(term, total, showOnlyPaid);
        const offsets = calculateOffsets(widths, showOnlyPaid);

        setRect(rects.balance, widths.balance, "#acedff", 0);
        setRect(rects.interest, widths.interest, "#83e3ff", offsets.interest);
        setRect(rects.principle, widths.principle, "#45D6ff", offsets.principle);
    }

    svg.addEventListener("click", () => {
        showOnlyPaid = !showOnlyPaid;
        updateChart();
    });

    updateChart();
    return svg;
}

// -- Utility Functions --
function calculateWidths(term, totalWidth, showOnlyPaid) {
    if (showOnlyPaid) {
        return {
            balance: 0,
            interest: (term.interestPaid / term.totalPaid) * 100,
            principle: (term.principlePaid / term.totalPaid) * 100,
        };
    }

    return {
        balance: (term.balance / totalWidth) * 100,
        interest: (term.interestPaid / totalWidth) * 100,
        principle: (term.principlePaid / totalWidth) * 100,
    };
}

function calculateOffsets(widths, showOnlyPaid) {
    if (showOnlyPaid) {
        return { interest: 0, principle: widths.interest };
    }

    return {
        interest: widths.balance,
        principle: widths.balance + widths.interest,
    };
}

function setRect(rect, width, fill, offsetX = 0) {
    rect.style.width = `${width}%`;
    rect.style.fill = fill;
    rect.setAttribute("x", `${offsetX}%`);
}
