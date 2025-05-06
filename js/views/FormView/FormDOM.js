// FormDOM.js
export function getFormDOM() {
    const template = document.querySelector("#template-form").content.firstElementChild.cloneNode(true);
    const parent = document.querySelector(".container");

    return {
        form: template,
        parent,
        buttons: {
            save: template.querySelector(".save"),
            cancel: template.querySelector(".cancel"),
            addMidterm: template.querySelector(".add-midterm")
        },
        staticInputs: {
            amount: template.querySelector("#loan-amount"),
            rate: template.querySelector("#loan-rate"),
            termYears: template.querySelector("#loan-term"),
            termMonths: template.querySelector("#loan-term-months"),
            startDate: template.querySelector("#loan-start-date"),
            payments: template.querySelector("#loan-payments"),
            paymentFreq: template.querySelector("#loan-payment-freq")
        },
        dynamicInputs: {
            midTerm: []
        }
    };
}
