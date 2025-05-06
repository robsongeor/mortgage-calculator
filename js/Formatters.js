export function handleMonthInput(e) {
    let months = sanitizeNumber(e.target.value);;

    if (months > 12) {
        months = 12;
    }

    e.target.value = months;
}

export function handleYearInput(e) {
    let years = sanitizeNumber(e.target.value);;

    if (years > 30) {
        years = 30;
    }

    e.target.value = years;

}

export function handleDollarInput(e) {
    const raw = sanitizeNumber(e.target.value);; // Strip non-numeric
    if (raw === "") {
        e.target.value = "";
        return;
    }

    const numericValue = parseInt(raw, 10);
    e.target.value = isNaN(numericValue) // 
        ? ""
        : numericValue.toLocaleString("en-NZ", {
            style: "currency",
            currency: "NZD",
            minimumFractionDigits: 0
        });
}

export function handlePercentInput(e) {
    let value = e.target.value;

    // Get the current cursor position
    const cursorPosition = e.target.selectionStart;

    // Remove non-numeric characters except for the decimal point
    value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // Only allow one decimal

    // If the value already ends with a `%`, avoid appending it again
    if (!value.endsWith('%')) {
        value += '%';
    }

    // Update the input value
    e.target.value = value;

    // Restore the cursor position, adjusting for the added '%'
    e.target.setSelectionRange(cursorPosition, cursorPosition);

}

export function handleCursorShift(e) {
    let cursorPosition = e.target.selectionStart;
    let value = e.target.value;

    // Check if the '%' exists and adjust the cursor position before it
    const percentIndex = value.indexOf('%');
    if (percentIndex !== -1 && cursorPosition > percentIndex) {
        cursorPosition = percentIndex;  // Move cursor before the '%'
    }

    e.target.setSelectionRange(cursorPosition, cursorPosition);
}

export function sanitizeNumber(value) {
    return value.replace(/[^0-9]/g, "");
}

export function removeSigns(value) {
    return value.replace(/[$,%]/g, "")
}