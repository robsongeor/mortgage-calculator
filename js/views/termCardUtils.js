import { applyFunctionToDataStructure, getValueByKey } from "../utils/DataStructureAccess.js";

export function getLoanDurationInMonths(term) {
    const termYears = getValueByKey("termYears", term);
    const termMonths = getValueByKey("termMonths", term);

    return Number(termYears) * 12 + Number(termMonths);
}

export function getStartDate(data){
    const startDate = getValueByKey("startDate", data)
    return new Date(startDate);
}

export function getEndDate(data) {
    const startDate = getStartDate(data);
    const termYears = getValueByKey("termYears", data)
    const termMonths = getValueByKey("termMonths", data)

    const endDate = new Date(
        startDate.getFullYear() + Number(termYears),
        startDate.getMonth() + Number(termMonths),
        startDate.getDate()
    );
    return endDate;
}

export function getInputFromData(key, data){
    for (const group in data){
        const match = data[group].find(input => input.hasOwnProperty(key));
        if (match) {
            return match[key];
        }

    }
    return undefined;
}

function clearValue(){
    return {value: ""};
}

export function clearAllValues(data) {
    return applyFunctionToDataStructure({
        inputCallback: clearValue,
        data: data,
        returns: true
    })
}

function setValue( value){
    return {value: value}
}

export function setInputValue(key, value, data){
    return applyFunctionToDataStructure({
        inputCallback: () => setValue(value),
        data: data,
        returns: true,
        name: key
    })
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

export function getFormattedAmount(term) {
    const amount = getInputFromData("amount", term)

    const amountNumeric = parseInt(amount, 10);
    const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
        style: "currency", currency: "NZD", minimumFractionDigits: 0
    });

    return `${formattedAmount}`;
}

const formatters = {
    percent: getFormattedPercent,
    currency: getFormattedCurrency,

}

export function getFormattedCurrency(input) {
    const amountNumeric = parseInt(input, 10);
    const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
        style: "currency", currency: "NZD", minimumFractionDigits: 0
    });

    return `${formattedAmount}`;
}

export function getFormattedPercent(input){
    return `${input}%`
}


export function getFormattedInput(name, formatter, term){
    const input = getValueByKey(name, term);
    const formatterFunction = formatters[formatter];

    return formatterFunction(input);    
}

export function getTermString(term) {
    const duration = formatTermDuration(term);
    return `${duration}`;
}

export function getTermDuration(term){
    const termYears = getValueByKey("termYears", term);
    const termMonths = getValueByKey("termMonths", term);

    const months = termMonths !== 0 ? `${termMonths} months` : "";
    const yearsString = termYears === 1 ? "year" : "years";
    const years = termYears !== 0 ? `${termYears} ${yearsString}` : "";
         return `${years} ${months}`;
}

export function getTermDates(term){
    const startDate = getStartDate(term);
    const endDate = getEndDate(term);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString(undefined, options)} to ${endDate.toLocaleDateString(undefined, options)}`;

}


export function getEarliestStartDate(terms) {
    return new Date(Math.min(...terms.map(term => getStartDate(term))));
}

export function getOriginalIndex(term, terms) {
    return terms.indexOf(term);
}


export function groupByNonOverlappingDates(terms) {
    const rows = [];
    
    //Sort the terms
    const sorted = terms.sort((a, b) => getStartDate(a) - getStartDate(b));

    for (const term of sorted) {
        
        const termStart = getStartDate(term);
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
            getStartDate(existing),
            getEndDate(existing)
        ));
        if (!hasOverlap) return row;
    }
    return null;
}

function datesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}
