import events from "../pubsub.js";
import {
    handleMonthInput,
    handleYearInput,
    handleDollarInput,
    handlePercentInput,
    handleCursorShift,
    removeSigns
} from "../Formatters.js"

export class FormView {
    constructor() {
        this.dom = this.cacheDOM();
        this.render();

        //Bind this
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.createMidTermOption = this.createMidTermOption.bind(this);

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
            staticInputs: {
                amount: template.querySelector("#loan-amount"),
                rate: template.querySelector("#loan-rate"),
                termYears: template.querySelector("#loan-term"),
                termMonths: template.querySelector("#loan-term-months"),
                startDate: template.querySelector("#loan-start-date"),
                payments: template.querySelector("#loan-payments"),
                paymentFreq: template.querySelector("#loan-payment-freq"),
                
            },
            dynamicInputs: {
                midTerm: []
            }
        };
    }

    bindDOMEvents() {
        // Input formatting + validation removal
        this.bindInputEvents({
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput,
            termYears: handleYearInput,
            termMonths: handleMonthInput,
        });
    
        // Buttons
        this.dom.buttons.save.addEventListener("click", this.handleSave);
        this.dom.buttons.cancel.addEventListener("click", this.handleCancel);
        this.dom.buttons.addMidterm.addEventListener("click", this.createMidTermOption);
    }

    bindInputEvents(bindings) {
        // Add event listeners for static inputs
        Object.entries(bindings).forEach(([key, handler]) => {
            const input = this.dom.staticInputs[key];
            input.addEventListener("input", handler.bind(this));
            input.addEventListener("input", () => this.removeInputError(input)); // Remove error on input
        });
    
        // Add event listener for repositioning cursor on rate input
        this.dom.staticInputs.rate.addEventListener("click", handleCursorShift.bind(this));
    }
    
    // Helper function to remove errors on input
    removeInputError(input) {
        this.setInputError(input, false);
    }
    

    bindEvents() {
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populate.bind(this));
    }

    handleSave() {
        const inputData = this.getInputData();
        this.clearAllInputErrors();
    
        const invalidInputs = this.getInvalidStaticInputs();
        const midtermErrors = this.getInvalidMidtermInputs();
    
        if (invalidInputs.length || midtermErrors.length) {
            this.highlightErrors([...invalidInputs, ...midtermErrors]);
            return;
        }
    
        events.emit("form:save", inputData);
    }

    getInvalidStaticInputs() {
        return Object.values(this.dom.staticInputs)
            .filter(input => !input.value.trim())
            .map(input => input.closest(".input-cell"))
            .filter(Boolean);
    }
    
    getInvalidMidtermInputs() {
        return this.dom.dynamicInputs.midTerm.flatMap(option => {
            const { amountInput, dateInput } = this.getMidTermInputs(option); 
            const errors = [];
    
            if (!amountInput.value.trim()) {
                errors.push(amount);
            }
    
            if (!dateInput.value.trim()) {
                errors.push(date);
            }
    
            return errors;
        });
    }

    highlightErrors(inputs) {
        inputs.forEach(input => {
            this.setInputError(input, true);
            const parent = input.closest(".input-cell");
            if (parent) parent.classList.add("input-error");
        });
    }

    handleCancel() {
        events.emit("form:cancel");
    }

    getMidTermInputs(option) {
        const amountInput = option.querySelector('[data-role="payment-change-amount"]');
        const dateInput = option.querySelector('[data-role="payment-change-date"]');
        return { amountInput, dateInput };
    }

    getInputData() {
        const staticInputs = Object.fromEntries(
            Object.entries(this.dom.staticInputs).map(([key, input]) => [
                key,
                input.value = removeSigns(input.value)
            ])
        );

        const midTerms = this.dom.dynamicInputs.midTerm.map(option => {
            const { amountInput, dateInput } = this.getMidTermInputs(option);

            return {
                amount: removeSigns(amountInput ? amountInput.value : ""),
                date: dateInput ? dateInput.value : ""
            };
        });

        return {
            ...staticInputs,
            midTerms
        };
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

        const amount = template.querySelector('[data-role="payment-change-amount"]')
        const date = template.querySelector('[data-role="payment-change-date"]')

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
                this.dom.dynamicInputs.midTerm = this.dom.dynamicInputs.midTerm.filter(el => el !== template);
            });
        }

        this.dom.dynamicInputs.midTerm.push(template);
        this.dom.form.insertBefore(template, this.dom.form.querySelector("button.save"));
        amount.focus();

        return template;
    }

    populate(inputData) {
        this.clearInputs();
        this.clearAllInputErrors();

        this.populateStaticInputs(inputData);
        this.populateMidterms(inputData);
    
        this.show();
    }
    
    // Helper function to populate static inputs
    populateStaticInputs(inputData) {
        const formatters = {
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput
        };
    
        Object.entries(this.dom.staticInputs).forEach(([key, input]) => {
            if (inputData[key]) {
                input.value = inputData[key];
            }
            if (formatters[key]) {
                formatters[key].call(this, { target: input });
            }
        });
    }
    
    // Helper function to populate midterm options
    populateMidterms(inputData) {
        if (inputData.midTerms) {
            inputData.midTerms.forEach(midTerm => {
                this.createMidTermOption(midTerm);
            });
        }
    }
    clearAndHide() {
        this.clearInputs();
        this.hide();
    }

    clearInputs() {
        //Clear static inputs
        for (const input of Object.values(this.dom.staticInputs)) {
            input.value = "";
        }

        //Clear midterm inputs
        this.dom.dynamicInputs.midTerm.forEach(midterm => {
            midterm.remove();
        });

        this.dom.dynamicInputs.midTerm = [];
    }

    show() {
        this.dom.form.style.display = "flex";
    }

    hide() {
        this.dom.form.style.display = "none";
    }
}
