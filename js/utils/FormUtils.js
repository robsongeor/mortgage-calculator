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

export function createButton({ text = "", classes = [], id = "", onClick = null }) {
    const button = document.createElement("button");

    button.textContent = text;

    if (id) button.id = id;

    if (classes.length > 0) {
        button.classList.add(...classes);
    }

    if (typeof onClick === "function") {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            onClick(event);
        });
    }
    return button;
}