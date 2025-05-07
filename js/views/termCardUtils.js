export function getLoanDurationInMonths(term) {
    return Number(term.termYears) * 12 + Number(term.termMonths);
}

export function getEndDate(term) {
    const startDate = new Date(term.startDate);
    return new Date(
        startDate.getFullYear() + Number(term.termYears),
        startDate.getMonth() + Number(term.termMonths),
        startDate.getDate()
    );
}

export function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

export function getEndDateISO(term) {
    const date = getEndDate(term);

    return(formatDateToISO(date));
  }


export function getLoanDatesString(term) {
    const startDate = new Date(term.startDate);
    const endDate = getEndDate(term);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString(undefined, options)} to ${endDate.toLocaleDateString(undefined, options)}`;
}

export function getLocaleDollarString(value){
    const amountNumeric = parseInt(value, 10);
    const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
        style: "currency", currency: "NZD", minimumFractionDigits: 0
    });
    return `${formattedAmount}`;
}

export function getTitleString(term) {
    const amountNumeric = parseInt(term.amount, 10);
    const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
        style: "currency", currency: "NZD", minimumFractionDigits: 0
    });
    const duration = formatTermDuration(term);
    return `${formattedAmount}`;
}

export function getTermString(term) {
    const duration = formatTermDuration(term);
    return `${duration}`;
}

export function formatTermDuration(term) {
    const months = Number(term.termMonths) !== 0 ? `${term.termMonths} months` : "";
    const yearsString = Number(term.termYears) === 1 ? "year" : "years";
    const years = Number(term.termYears) !== 0 ? `${term.termYears} ${yearsString}` : "";
    return `${years} ${months}`;
}

export function getEarliestStartDate(terms) {
    return new Date(Math.min(...terms.map(term => new Date(term.startDate))));
}

export function getOriginalIndex(term, terms) {
    return terms.indexOf(term);
}

export function groupByNonOverlappingDates(terms) {
    const rows = [];
    const sorted = [...terms].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    for (const term of sorted) {
        const termStart = new Date(term.startDate);
        const termEnd = getEndDate(term);
        const row = findAvailableRow(termStart, termEnd, rows);
        if (row) row.push(term);
        else rows.push([term]);
    }
    return rows;
}

function findAvailableRow(termStart, termEnd, rows) {
    for (const row of rows) {
        const hasOverlap = row.some(existing => datesOverlap(
            termStart, termEnd,
            new Date(existing.startDate),
            getEndDate(existing)
        ));
        if (!hasOverlap) return row;
    }
    return null;
}

function datesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}
