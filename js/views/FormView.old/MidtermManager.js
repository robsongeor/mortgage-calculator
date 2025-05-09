import { getInvalidInputs } from './FormValidator.js';
import { removeSigns } from '../../Formatters.js';
import { handleDollarInput } from "../../Formatters.js";


export function createMidTermOptionUtil(view, prefill = { amount: "", date: "" }) {
    const template = createMidTermTemplate(prefill);

    addMidTermListeners(template, view); // Pass the FormView instance
    view.dom.dynamicInputs.midTerm.push(template);
    view.dom.form.insertBefore(template, view.dom.form.querySelector("button.save"));
    template.querySelector('[data-role="payment-change-amount"]').focus();
}

export function getMidtermData(dom) {
    return dom.dynamicInputs.midTerm.map(option => {
        const amountInput = option.querySelector('[data-role="payment-change-amount"]');
        const dateInput = option.querySelector('[data-role="payment-change-date"]');
        return {
            amount: removeSigns(amountInput?.value || ""),
            date: dateInput?.value || ""
        };
    });
}


export function getInvalidMidtermInputs(dom) {
    return dom.dynamicInputs.midTerm.flatMap(option => {
        const amountInput = option.querySelector('[data-role="payment-change-amount"]');
        const dateInput = option.querySelector('[data-role="payment-change-date"]');
        return getInvalidInputs([amountInput, dateInput]);
    });
}

export function clearMidterms(dom) {
    dom.dynamicInputs.midTerm.forEach(midterm => midterm.remove());
    dom.dynamicInputs.midTerm = [];
}


/**
 * Creates a new midterm input section from a template.
 * @param {Object} prefill - Optional prefill values for amount and date.
 * @returns {HTMLElement} - A cloned and populated DOM node from the template.
 */
export function createMidTermTemplate(prefill) {
    // Clone the midterm template from the HTML
    const template = document.querySelector("#template-option-midterm")
        .content.firstElementChild.cloneNode(true);

    // Get input fields from the cloned template
    const amount = template.querySelector('[data-role="payment-change-amount"]');
    const date = template.querySelector('[data-role="payment-change-date"]');

    // Pre-fill values if provided
    amount.value = prefill.amount ?? "";
    date.value = prefill.date ?? "";

    return template;
}

/**
 * Adds event listeners for input formatting, error handling, and removal.
 * @param {HTMLElement} template - The midterm template element.
 * @param {Object} context - Usually an instance of FormView, provides methods and access to the form.
 */
export function addMidTermListeners(template, context) {
    const amount = template.querySelector('[data-role="payment-change-amount"]');
    const date = template.querySelector('[data-role="payment-change-date"]');

    // Add dollar formatting logic, bound to the context (usually FormView)
    amount.addEventListener("input", handleDollarInput.bind(context));

    // Clear input errors on any new input
    [amount, date].forEach(input => {
        input.addEventListener("input", () => {
            context.setInputError(input, false); // Relies on context exposing this method
        });
    });

    // Setup removal logic
    const removeBtn = template.querySelector(".remove-midterm");
    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            // Remove from DOM
            context.dom.form.removeChild(template);

            // Remove from dynamic input tracking
            context.dom.dynamicInputs.midTerm = context.dom.dynamicInputs.midTerm.filter(el => el !== template);
        });
    }
}