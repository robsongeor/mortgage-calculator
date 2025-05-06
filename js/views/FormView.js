import events from "../pubsub.js";
import {
    handleMonthInput,
    handleYearInput,
    handleDollarInput,
    handlePercentInput,
    handleCursorShift,
    sanitizeNumber
} from "../Formatters.js"

export class FormView {
    constructor() {
        this.dom = this.cacheDOM();
        this.render();
        this.bindDOMEvents();
        this.bindEvents();
    }

    render(){
        this.dom.parent.insertBefore(this.dom.form, this.dom.parent.firstChild);
    }

    cacheDOM() {
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
            inputs: {
                amount: template.querySelector("#loan-amount"),
                rate: template.querySelector("#loan-rate"),
                termYears: template.querySelector("#loan-term"),
                termMonths: template.querySelector("#loan-term-months"),
                startDate: template.querySelector("#loan-start-date"),
                payments: template.querySelector("#loan-payments"),
                paymentFreq: template.querySelector("#loan-payment-freq"),
            },
            options: {
                midTerm: []
            }
        };
    }

    bindDOMEvents() {
        this.bindInputEvents({
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput,
            termYears: handleYearInput,
            termMonths: handleMonthInput,
        });

        this.dom.buttons.save.addEventListener("click", this.handleSave.bind(this));
        this.dom.buttons.cancel.addEventListener("click", this.handleCancel.bind(this));
        this.dom.buttons.addMidterm.addEventListener("click", this.createMidTermOption.bind(this));
    }

    bindInputEvents(bindings) {
        for (const [key, handler] of Object.entries(bindings)) {
            this.dom.inputs[key].addEventListener("input", handler.bind(this));
        }

        this.dom.inputs.rate.addEventListener("click", handleCursorShift.bind(this));

        Object.values(this.dom.inputs).forEach(input => {
            input.addEventListener("input", () => {
                this.setInputError(input, false);
            });
        });
    }

    bindEvents() {
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populate.bind(this));
    }

    handleSave() {
        const inputData = this.getInputData();
        this.clearAllInputErrors();

        const invalidInputs = Object.values(this.dom.inputs)
            .map(input => this.validateRequiredInput(input))
            .filter(Boolean);

        const midtermErrors = this.dom.options.midTerm.flatMap(option => {
            const amount = option.querySelector("#payment-change-amount");
            const date = option.querySelector("#payment-change-date");
            const errors = [];

            if (!amount.value.trim()) {
                this.setInputError(amount, true);
                errors.push(amount);
            }

            if (!date.value.trim()) {
                this.setInputError(date, true);
                errors.push(date);
            }

            return errors;
        });

        if (invalidInputs.length || midtermErrors.length) {
            invalidInputs.forEach(parent => parent.classList.add("input-error"));
            return;
        }

        events.emit("form:save", inputData);
    }

    handleCancel() {
        events.emit("form:cancel");
    }

    getInputData() {
        const staticInputs = Object.fromEntries(
            Object.entries(this.dom.inputs).map(([key, input]) => [
                key,
                input.value.replace(/[$,%]/g, "")
            ])
        );

        const midTerms = this.dom.options.midTerm.map(option => {
            const amountInput = option.querySelector('[data-role="payment-change-amount"]');
            const dateInput = option.querySelector('[data-role="payment-change-amount"]')

            return {
                amount: amountInput?.value.replace(/[$,%]/g, "") || "",
                date: dateInput?.value || ""
            };
        });

        return {
            ...staticInputs,
            midTerms
        };
    }

    validateRequiredInput(input) {
        const parent = input.closest(".input-cell");
        const value = input.value.trim();
        const isEmpty = value === "";
        this.setInputError(input, isEmpty);
        return isEmpty ? parent : null;
    }

    clearAllInputErrors() {
        const inputCells = this.dom.form.querySelectorAll(".input-cell");
        inputCells.forEach(cell => cell.classList.remove("input-error"));
    }

    setInputError(input, isError) {
        const parent = input.closest(".input-cell");
        if (!parent) return;
        parent.classList.toggle("input-error", isError);
    }

    createMidTermOption(prefill = { amount: "", date: "" }) {
        const template = document.querySelector("#template-option-midterm").content.firstElementChild.cloneNode(true);

        const amount = template.querySelector("#payment-change-amount");
        const date = template.querySelector("#payment-change-date");

        amount.value = prefill.amount;
        date.value = prefill.date;

        amount.addEventListener("input", handleDollarInput.bind(this));
        [amount, date].forEach(input => {
            input.addEventListener("input", () => this.setInputError(input, false));
        });

        const removeBtn = template.querySelector(".remove-midterm");
        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                this.dom.form.removeChild(template);
                this.dom.options.midTerm = this.dom.options.midTerm.filter(el => el !== template);
            });
        }

        this.dom.options.midTerm.push(template);
        this.dom.form.insertBefore(template, this.dom.form.querySelector("button.save"));
        amount.focus();

        return template;
    }

    populate(inputData) {
        const formatters = {
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput
        };

        for (const [key, input] of Object.entries(this.dom.inputs)) {
            if (inputData[key]) {
                input.value = inputData[key];
            }
            if (formatters[key]) {
                formatters[key].call(this, { target: input });
            }
        }

        if (inputData.midTerms) {
            inputData.midTerms.forEach(midTerm => {
                this.createMidTermOption(midTerm);
            });
        }

        this.show();
    }

    clearAndHide() {
        this.clearInputs();
        this.hide();
    }

    clearInputs() {
        for (const input of Object.values(this.dom.inputs)) {
            input.value = "";
        }

        this.dom.options.midTerm.forEach(midterm => {
            midterm.remove();
        });
        this.dom.options.midTerm = [];
    }

    show() {
        this.dom.form.style.display = "flex";
    }

    hide() {
        this.dom.form.style.display = "none";
    }
}
