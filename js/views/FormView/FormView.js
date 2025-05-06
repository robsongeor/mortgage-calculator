import events from "../../pubsub.js";
import { handleMonthInput, handleYearInput, handleDollarInput, handlePercentInput, handleCursorShift, removeSigns } from "../../Formatters.js";
import { getFormDOM } from "./FormDOM.js";
import { getInvalidInputs, clearAllInputErrors, setInputError } from "./FormValidator.js";
import { createMidTermOptionUtil, getMidtermData, getInvalidMidtermInputs, clearMidterms } from "./MidtermManager.js";

export class FormView {
    constructor() {
        this.dom = getFormDOM();
        this.render();

        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.createMidTermOption = this.createMidTermOption.bind(this);

        this.bindDOMEvents();
        this.bindEvents();
    }

    setInputError(input, showError) {
        setInputError(input, showError); // delegate to the original function
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
        clearAllInputErrors(this.dom.form);

        const invalidInputs = getInvalidInputs(Object.values(this.dom.staticInputs));
        const midtermErrors = getInvalidMidtermInputs(this.dom);

        if (invalidInputs.length || midtermErrors.length) {
            [...invalidInputs, ...midtermErrors].forEach(input => setInputError(input, true));
            return;
        }

        events.emit("form:save", this.getInputData());
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

    createMidTermOption(prefill) {
        createMidTermOptionUtil(this, prefill);
    }

    populate(inputData) {
        this.clearInputs();
        clearAllInputErrors(this.dom.form);

        Object.entries(this.dom.staticInputs).forEach(([key, input]) => {
            if (inputData[key]) input.value = inputData[key];
        });

        if (inputData.midTerms) {
            inputData.midTerms.forEach(midTerm => this.createMidTermOption(midTerm));
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
