import events from "../pubsub.js";

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
            amount: this.handleDollarInput,
            payments: this.handleDollarInput,
            rate: this.handlePercentInput,
            termYears: this.handleYearInput,
            termMonths: this.handleMonthInput,
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
        this.dom.inputs.rate.addEventListener("click", this.handleCursorShift.bind(this));

        // Remove error class
        Object.values(this.dom.inputs).forEach(input => {
            input.addEventListener("input", () => {
                this.setInputError(input, false);

            });
        });
    }

    createMidTermOption() {
        const template = document.querySelector("#template-option-midterm").content.firstElementChild.cloneNode(true);

        // Input events [options]
        const amount = template.querySelector("#payment-change-amount");

        amount.addEventListener("input", this.handleDollarInput.bind(this))


        this.dom.options.midTerm.push(template)

        this.dom.form.insertBefore(template, this.dom.form.querySelector("button"))

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

        // Group inputs by parent cell
        const invalidParents = new Set();

        for (const [key, input] of Object.entries(this.dom.inputs)) {
            const value = inputData[key].trim();

            const parent = input.closest(".input-cell");
            if (!parent) continue;

            if (value === "") {
                this.setInputError(input, true);
                invalidParents.add(parent); // Track parents with any invalid inputs
                hasError = true;
            }
        }

        // Add error class to invalid parents
        invalidParents.forEach(parent => parent.classList.add("input-error"));

        if (hasError) return;
        events.emit("form:save", inputData);
    }

    handleCancel() {
        events.emit("form:cancel");
    }

    handleMonthInput(e) {
        let months = this.sanitizeNumber(e.target.value);;

        if (months > 12) {
            months = 12;
        }

        e.target.value = months;
    }

    handleYearInput(e) {
        let years = this.sanitizeNumber(e.target.value);;

        if (years > 30) {
            years = 30;
        }

        e.target.value = years;

    }

    handleDollarInput(e) {
        const raw = this.sanitizeNumber(e.target.value);; // Strip non-numeric
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

    handlePercentInput(e) {
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

    handleCursorShift(e) {
        let cursorPosition = e.target.selectionStart;
        let value = e.target.value;

        // Check if the '%' exists and adjust the cursor position before it
        const percentIndex = value.indexOf('%');
        if (percentIndex !== -1 && cursorPosition > percentIndex) {
            cursorPosition = percentIndex;  // Move cursor before the '%'
        }

        e.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    sanitizeNumber(value) {
        return value.replace(/[^0-9]/g, "");
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
        if(inputData.midTerms){
            inputData.midTerms.forEach(midTerm =>{
                const mt = this.createMidTermOption();
    
                mt.querySelector("#payment-change-amount").value = midTerm.amount;
                mt.querySelector("#payment-change-date").value = midTerm.date;
    
            })
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