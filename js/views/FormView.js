import DataInput from "../components/DataInput.js";
import events from "../pubsub.js";

export default class FormView {
    constructor(inputs, defaultLoanInputConfigs) {
        this.el = document.createElement('form')
        this.el.className = 'form-view'

        this.inputs = inputs;

        this._createForm(defaultLoanInputConfigs);

        //this.getRawInputValues();
    }

    _createForm(defaultLoanInputConfigs) {
        // Create loan inputs
        const loanInputConfigs = defaultLoanInputConfigs;

        loanInputConfigs.forEach(config => {
            this.createInput(config, "loanInputs")
        })

        console.log(this.inputs)
    }

    createInput(config, group) {
        const input = new DataInput(config);
        this.el.appendChild(input.getElement());
        this.inputs[group].push(input)
    }

    save() {
        events.emit("formView:submit", this.getRawInputValues())
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
                    value: dataInput.getValue()
                }

                data[group].push(rawData);
            })
        }

        return data;
    }
}



