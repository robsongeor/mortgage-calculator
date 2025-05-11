import DataInput from "../components/DataInput.js";
import events from "../pubsub.js";
import { createButton } from "../utils/FormUtils.js";
import { getInputFromData } from "./termCardUtils.js";

export default class FormView {
    constructor(inputs, defaultGroupConfigs) {
        // Create and configure the form element
        this.el = document.createElement('form');
        this.el.className = 'form-view';

        // Store the inputs reference
        this.inputs = inputs;

        // Build initial form layout and input elements
        this._createForm(defaultGroupConfigs);

        // Subscribe to relevant UI events
        this._registerEvents();
    }

    _registerEvents() {
        // Show, hide, or populate form in response to external events
        events.on("form:open", this.show.bind(this));
        events.on("form:close", this.clearAndHide.bind(this));
        events.on("form:populate", this.populateInputs.bind(this));
    }

    _createForm(defaultGroupConfigs) {
        // Create inputs from default configuration
        for (const group in defaultGroupConfigs){
            console.log(defaultGroupConfigs[group])
            this._createGroupDiv(group);
            defaultGroupConfigs[group].forEach(config => {
                this.createInput(config, group);
            })
        }

        // Create and append Save/Cancel buttons
        this._createButtons();
    }
    _createGroupDiv(group){
        const groupDiv = document.createElement("div");
        groupDiv.classList.add(group);
        this.el.appendChild(groupDiv);

    }

    _createButtons() {
        // Create save and cancel buttons with click handlers
        const buttons = [
            createButton({ text: "save", onClick: this.save.bind(this) }),
            createButton({ text: "cancel", onClick: this.cancel.bind(this) })
        ];

        buttons.forEach(button => {
            this.el.appendChild(button);
        });
    }

    createInput(config, group) {
        // Instantiate input from config and store reference
        const groupDiv = this.el.querySelector(`.${group}`)
        const input = new DataInput(config);
        groupDiv.appendChild(input.getElement());
        this.inputs[group].push(input);
    }

    save() {
        // Emit event with current raw form values
        events.emit("formView:submit", this.getRawInputValues());
    }

    cancel() {
        // Clear form and hide it
        this.clearAndHide();
    }

    getElement() {
        // Return form element for external use (e.g. mounting to DOM)
        return this.el;
    }

    getRawInputValues() {
        // Build a structured object of raw form input values
        let data = {};

        for (const group in this.inputs) {
            data[group] = this.inputs[group].map(dataInput => ({
                name: dataInput.name,
                valueType: dataInput.valueType,
                value: dataInput.getValue(),
            }));
        }

        return data;
    }

    clearInputs() {
        // Reset all inputs to empty string
        for (const group in this.inputs) {
            this.inputs[group].forEach(dataInput => {
                const inputEl = this.el.querySelector(`input[name="${dataInput.name}"]`);
                inputEl.value = "";
            });
        }
    }

    populateInputs(data) {
        // Set input values from provided data object
        for (const group in this.inputs) {
            this.inputs[group].forEach(dataInput => {
                const inputEl = this.el.querySelector(`input[name="${dataInput.name}"]`);
                inputEl.value = getInputFromData(dataInput.name, data);
            });
        }
    }

    clearAndHide() {
        // Wipe inputs and hide form
        this.clearInputs();
        this.hide();
    }

    show() {
        // Show the form
        this.el.style.display = "block";
    }

    hide() {
        // Hide the form
        this.el.style.display = "none";
    }
}
