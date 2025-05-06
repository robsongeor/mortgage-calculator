// MidtermManager.js
import { createMidTermTemplate, addMidTermListeners } from './midtermUtils.js';
import { getInvalidInputs } from './FormValidator.js';
import { removeSigns } from '../../Formatters.js';

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
