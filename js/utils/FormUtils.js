export function extractNumberFromString(str) {
    return parseFloat(str.replace(/[^0-9.]/g, ""));
}

export function isValidNumericValue(dataInput) {
    switch (dataInput.name) {
        case "termYears":
            return dataInput.value >= 0 && dataInput.value <= 30;
        case "termMonths":
            return dataInput.value >= 0 && dataInput.value <= 12;
        case "rate":
            return dataInput.value > 0 && dataInput.value < 50;
        default:
            return dataInput.value > 0;
    }

} 