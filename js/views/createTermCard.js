import events from "../pubsub.js";
import {
    getLoanDurationInMonths,
    getFormattedInput,
    getTermDuration,
    getTermDates,
    getStartDate,
    getInputFromData,
} from "./termCardUtils.js";

// Main function to create a Term Card
export function createTermCard(term, index, baseDate) {
    
    const card = createCardFromTemplate();
    card.dataset.index = index;

    populateCardFields(card, term) ;
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

    const fields = {
        amount: getFormattedInput("amount", "currency", term),
        rate: getFormattedInput("rate", "percent", term),
        term: getTermDuration(term),
        dates: getTermDates(term),
        interestPaid: getFormattedInput("interestPaid", "currency", term),
        principlePaid: getFormattedInput("principlePaid", "currency", term),
        balance: getFormattedInput("balance", "currency", term)

    }

    card.querySelector(".loan-amount").textContent = fields.amount;
    card.querySelector(".loan-rate").textContent = fields.rate;
    card.querySelector(".loan-term").textContent = fields.term;
    card.querySelector(".loan-dates").textContent = fields.dates;
    card.querySelector(".interest-paid").textContent =  fields.interestPaid;
    card.querySelector(".principle-paid").textContent = fields.principlePaid;
    card.querySelector(".balance").textContent = fields.balance;
}

function attachCardEventListeners(card) {
    card.querySelector(".create-from").addEventListener("click", () => 
        events.emit("term:requestCreateFrom", Number(card.dataset.index))
    )
    card.querySelector(".edit").addEventListener("click", () =>
        events.emit("term:requestEdit", Number(card.dataset.index))
    );
    card.querySelector(".delete").addEventListener("click", () =>
        events.emit("term:requestDelete", Number(card.dataset.index))
    );
}

function setCardStyles(card, term, baseDate) {
    const startDate = getStartDate(term);
    const monthsFromBase = (startDate.getFullYear() - baseDate.getFullYear()) * 12 +
        (startDate.getMonth() - baseDate.getMonth());
    const totalMonths = getLoanDurationInMonths(term);

    card.style.setProperty('--start', monthsFromBase + 1 );
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
        const balance = getInputFromData("balance", term);
        const totalPaid = getInputFromData("totalPaid", term);
        

        const total = balance + totalPaid;
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
    const interestPaid = getInputFromData("interestPaid", term);
    const principlePaid = getInputFromData('principlePaid', term);
    const totalPaid = getInputFromData("totalPaid", term);
    const balance = getInputFromData("balance", term);

    if (showOnlyPaid) {
        return {
            balance: 0,
            interest: (interestPaid / totalPaid) * 100,
            principle: (principlePaid / totalPaid) * 100,
        };
    }

    return {
        balance: (balance / totalWidth) * 100,
        interest: (interestPaid / totalWidth) * 100,
        principle: (principlePaid / totalWidth) * 100,
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
