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
        parent.appendChild(template);

        return {
            form: template,
            buttons: {
                save: template.querySelector(".save"),
                cancel: template.querySelector(".cancel")
            },
            inputs: {
                amount: template.querySelector("#loan-amount"),
                rate: template.querySelector("#loan-rate"),
                term: template.querySelector("#loan-term"),
                termMonths: template.querySelector("#loan-term-months"),
                payments: template.querySelector("#loan-payments"),
                paymentFreq: template.querySelector("#loan-payment-freq")
            }
        };
    }

    bindDOMEvents() {
        this.dom.buttons.save.addEventListener("click", this.handleSave.bind(this));
        this.dom.buttons.cancel.addEventListener("click", this.handleCancel.bind(this));
    }

    bindEvents() {
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populate.bind(this));
    }

    handleSave() {
        const inputData = this.getInputData();
        events.emit("form:save", inputData);  // Controller will listen and decide what to do
    }

    handleCancel() {
        events.emit("form:cancel");
    }

    getInputData() {
        const data = {};
        for (const [key, input] of Object.entries(this.dom.inputs)) {
            data[key] = Number(input.value);
        }
        return data;
    }

    populate(inputData) {
        for (const [key, input] of Object.entries(this.dom.inputs)) {
            input.value = inputData[key];
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
    }

    show() {
        this.dom.form.style.display = "block";
    }

    hide() {
        this.dom.form.style.display = "none";
    }
}