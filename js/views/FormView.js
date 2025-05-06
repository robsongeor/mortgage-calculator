import events from "../pubsub.js";
import {handleMonthInput,handleYearInput,handleDollarInput,handlePercentInput,handleCursorShift,sanitizeNumber} from "../Formatters.js"

export class FormView {
    constructor() {
        this.dom = this.cacheDOM();
        this.bindDOMEvents();
        this.bindEvents();
    }

    cacheDOM() {
        const template = document.querySelector("#template-form").content.firstElementChild.cloneNode(true);

        const parent = document.querySelector(".container");
        parent.insertBefore(template, parent.firstChild);

        return {
            form: template,
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
        const inputBindings = {
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput,
            termYears: handleYearInput,
            termMonths: handleMonthInput,
        };

        // Buttons
        this.dom.buttons.save.addEventListener("click", this.handleSave.bind(this));
        this.dom.buttons.cancel.addEventListener("click", this.handleCancel.bind(this));
        this.dom.buttons.addMidterm.addEventListener("click", this.createMidTermOption.bind(this))

        // Input events 
        for (const [key, handler] of Object.entries(inputBindings)) {
            this.dom.inputs[key].addEventListener("input", handler.bind(this));
        }

        // Cursor shifting
        this.dom.inputs.rate.addEventListener("click", handleCursorShift.bind(this));

        // Remove error class
        Object.values(this.dom.inputs).forEach(input => {
            input.addEventListener("input", () => {
                this.setInputError(input, false);

            });
        });
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

        // Add remove button logic if exists
        const removeBtn = template.querySelector(".remove-midterm");
        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                this.dom.form.removeChild(template);
                this.dom.options.midTerm = this.dom.options.midTerm.filter(el => el !== template);
            });
        }

        this.dom.options.midTerm.push(template);
        this.dom.form.insertBefore(template, this.dom.form.querySelector("button.save"));

        // Auto-focus first input
        amount.focus();

        return template;
    }


    bindEvents() {
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populate.bind(this));
    }

    handleSave() {
        const inputData = this.getInputData();
        let hasError = false;

        // Clear all previous errors
        const inputCells = this.dom.form.querySelectorAll(".input-cell");
        inputCells.forEach(cell => cell.classList.remove("input-error"));

        const invalidParents = new Set();

        for (const [key, input] of Object.entries(this.dom.inputs)) {
            const value = inputData[key].trim();
            const parent = input.closest(".input-cell");
            if (!parent) continue;

            if (value === "") {
                this.setInputError(input, true);
                invalidParents.add(parent);
                hasError = true;
            }
        }

        // ✅ Validate midterms
        this.dom.options.midTerm.forEach(option => {
            const amount = option.querySelector("#payment-change-amount");
            const date = option.querySelector("#payment-change-date");

            if (!amount.value) {
                this.setInputError(amount, true);
                hasError = true;
            }
            if (!date.value) {
                this.setInputError(date, true);
                hasError = true;
            }
        });

        invalidParents.forEach(parent => parent.classList.add("input-error"));
        if (hasError) return;

        events.emit("form:save", inputData);
    }

    handleCancel() {
        events.emit("form:cancel");
    }



    getInputData() {
        // Extract values from static inputs
        const staticInputs = Object.fromEntries(
            Object.entries(this.dom.inputs).map(([key, input]) => [
                key,
                input.value.replace(/[$,%]/g, "")
            ])
        );

        // Extract values from dynamic midterm inputs        
        const midTerms = this.dom.options.midTerm.map(option => {
            const amountInput = option.querySelector("#payment-change-amount");
            const dateInput = option.querySelector("#payment-change-date");

            return {
                amount: amountInput?.value.replace(/[$,%]/g, "") || "",
                date: dateInput?.value || ""
            };
        });

        // Add the midterm data to the result
        return {
            ...staticInputs,
            midTerms
        };
    }

    setInputError(input, isError) {
        const parent = input.closest(".input-cell");
        if (!parent) return;
        parent.classList.toggle("input-error", isError);
    }

    populate(inputData) {
        const formatters = {
            amount: this.handleDollarInput,
            payments: this.handleDollarInput,
            rate: this.handlePercentInput
        };


        for (const [key, input] of Object.entries(this.dom.inputs)) {
            //Skip optional values
            if (inputData[key]) {
                input.value = inputData[key];
            }

            //Format required fields
            if (formatters[key]) {
                formatters[key].call(this, { target: input });
            }
        }

        //Add all midterms
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

        //Clear midterm options
        this.dom.options.midTerm.forEach(midterm => {
            midterm.remove();
        })
        this.dom.options.midTerm = [];
    }

    show() {
        this.dom.form.style.display = "flex";
    }

    hide() {
        this.dom.form.style.display = "none";
    }
}