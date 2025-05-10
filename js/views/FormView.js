import DataInput from "../components/DataInput.js";
import events from "../pubsub.js";
import { createButton } from "../utils/FormUtils.js";
import { getInputFromData } from "./termCardUtils.js";

export default class FormView {
    constructor(inputs, defaultLoanInputConfigs) {
        this.el = document.createElement('form')
        this.el.className = 'form-view'

        this.inputs = inputs;

        this._createForm(defaultLoanInputConfigs);

        events.on("form:open", this.show.bind(this))
        events.on("form:close", this.clearAndHide.bind(this))
        events.on("form:populate", this.populateInputs.bind(this))
    }

    _createForm(defaultLoanInputConfigs) {
        // Create loan inputs
        const loanInputConfigs = defaultLoanInputConfigs;

        loanInputConfigs.forEach(config => {
            this.createInput(config, "loanInputs")
        })

        // Create loan buttons
        this._createButtons()
    }

    _createButtons() {
        const buttons = [
            createButton({ text: "save", onClick: this.save.bind(this) }),
            createButton({ text: "cancel", onClick: this.cancel.bind(this) })
        ]

        buttons.forEach(button => {
            this.el.appendChild(button);
        })

    }


    createInput(config, group) {
        const input = new DataInput(config);
        this.el.appendChild(input.getElement());
        this.inputs[group].push(input)
    }

    save() {
        events.emit("formView:submit", this.getRawInputValues())
    }

    cancel() {
        this.clearAndHide();
    }

    getElement() {
        return this.el;
    }

    getRawInputValues() {
        let data = {};

        for (const group in this.inputs) {
            data[group] = [];
            this.inputs[group].forEach(dataInput => {
                const rawData = {
                    name: dataInput.name,
                    valueType: dataInput.valueType,
                    value: dataInput.getValue(),
                    formatter: dataInput.formatter,
                }

                data[group].push(rawData);
            })
        }

        return data;
    }

    clearInputs() {
        for (const group in this.inputs) {
            this.inputs[group].forEach(dataInput => {

                const currentDiv = this.el.querySelector(`input[name="${dataInput.name}"]`)
                currentDiv.value = "";
            })
        }
    }

    populateInputs(data){
        for (const group in this.inputs) {
            this.inputs[group].forEach(dataInput => {

                const currentDiv = this.el.querySelector(`input[name="${dataInput.name}"]`)
                currentDiv.value = getInputFromData(dataInput.name, data)
            })
        }
    }

    clearAndHide() {
        this.clearInputs();
        this.hide();
    }

    show() {
        this.el.style.display = "block";
    }

    hide() {
        this.el.style.display = "none";
    }
}



