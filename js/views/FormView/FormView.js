import events from "../../pubsub.js";
import { handleMonthInput, handleYearInput, handleDollarInput, handlePercentInput, handleCursorShift, removeSigns } from "../../Formatters.js";
import { getFormDOM } from "./FormDOM.js";
import { getInvalidInputs, clearAllInputErrors, setInputError } from "./FormValidator.js";
import { createMidTermOptionUtil, getMidtermData, getInvalidMidtermInputs, clearMidterms } from "./MidtermManager.js";

export class FormView {
    constructor() {
        this.dom = getFormDOM();
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    init() {
        this.render();
        this.bindDOMEvents();
        this.bindEvents();
    }

    setInputError(input, showError) {
        //Adds error class to element
        setInputError(input, showError);
    }

    render() {
        this.dom.parent.insertBefore(this.dom.form, this.dom.parent.firstChild);
    }

    bindDOMEvents() {
        this.bindInputEvents({
            amount: handleDollarInput,
            payments: handleDollarInput,
            rate: handlePercentInput,
            termYears: handleYearInput,
            termMonths: handleMonthInput,
        });

        this.dom.buttons.save.addEventListener("click", this.handleSave);
        this.dom.buttons.cancel.addEventListener("click", this.handleCancel);
        this.dom.buttons.addMidterm.addEventListener("click", () => createMidTermOptionUtil(this));
    }

    bindInputEvents(bindings) {
        Object.entries(bindings).forEach(([key, handler]) => {
            const input = this.dom.staticInputs[key];
            input.addEventListener("input", handler.bind(this));
            input.addEventListener("input", () => setInputError(input, false));
        });

        this.dom.staticInputs.rate.addEventListener("click", handleCursorShift.bind(this));
    }

    bindEvents() {
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populate.bind(this));
    }

    handleSave() {
        //Clear Errors
        clearAllInputErrors(this.dom.form);

        const errors = this.getValidationErrors();
        if (errors.length) {
            this.displayErrors(errors);
            return;
        }

        const data = this.getInputData();
        events.emit("form:save", data);

        events.emit("form:save", this.getInputData());
    }

    getValidationErrors() {
        const invalidInputs = getInvalidInputs(Object.values(this.dom.staticInputs));
        const midtermErrors = getInvalidMidtermInputs(this.dom);
        return [...invalidInputs, ...midtermErrors];
    }

    displayErrors(inputs) {
        inputs.forEach(input => setInputError(input, true));
    }

    handleCancel() {
        events.emit("form:cancel");
    }

    getInputData() {
        const staticInputs = Object.fromEntries(
            Object.entries(this.dom.staticInputs).map(([key, input]) => [key, removeSigns(input.value)])
        );

        const midTerms = getMidtermData(this.dom);

        return { ...staticInputs, midTerms };
    }



    populate(inputData) {
        this.clearInputs();
        clearAllInputErrors(this.dom.form);

        Object.entries(this.dom.staticInputs).forEach(([key, input]) => {
            if (inputData[key]) input.value = inputData[key];
        });

        if (inputData.midTerms) {
            inputData.midTerms.forEach(midTerm => createMidTermOptionUtil(this, midTerm));
        }

        this.show();
    }

    clearInputs() {
        Object.values(this.dom.staticInputs).forEach(input => input.value = "");
        clearMidterms(this.dom);
    }

    clearAndHide() {
        this.clearInputs();
        this.hide();
    }

    show() {
        this.dom.form.style.display = "flex";
    }

    hide() {
        this.dom.form.style.display = "none";
    }
}
