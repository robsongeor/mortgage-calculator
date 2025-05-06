// FormValidator.js
export function getInvalidInputs(inputs) {
    return inputs.filter(input => !input.value.trim()).map(input => input.closest(".input-cell")).filter(Boolean);
}

export function setInputError(input, isError) {
    const parent = input.closest(".input-cell");
    if (!parent) return;
    parent.classList.toggle("input-error", isError);
}

export function clearAllInputErrors(form) {
    const inputCells = form.querySelectorAll(".input-cell");
    inputCells.forEach(cell => cell.classList.remove("input-error"));
}
