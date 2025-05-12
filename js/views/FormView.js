import DataInput from "../components/DataInput.js";
import events from "../pubsub.js";
import { applyFunctionToInputs } from "../utils/DataStructureAccess.js";
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
        for (const group in defaultGroupConfigs){
            this._createGroup(group, defaultGroupConfigs[group]);
        }

        this._createButtons();
    }

    _createGroup(groupName, configs) {
        this._createGroupDiv(groupName);
        const groupDiv = this.el.querySelector(`.${groupName}`);
        if (!this.inputs[groupName]) this.inputs[groupName] = [];
    
        const groupObject = {};
    
        configs.forEach(config => {
            const input = new DataInput(config);
            groupDiv.appendChild(input.getElement());
            groupObject[input.name] = input;
        });
    
        this.inputs[groupName].push(groupObject);
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

    getRawInputValue(dataInput){
        return {
            name: dataInput.name,
            valueType: dataInput.valueType,
            value: dataInput.getValue(),
        };
    }

    getRawInputValues() {

        const rawInputValues = applyFunctionToInputs(
            null,
            this.getRawInputValue,
            this.inputs,
            true // enable collection mode
        );

        return rawInputValues;
    }


    clearInput(){
        const inputEl = this.el.querySelector(`input[name="${dataInput.name}"]`);
        inputEl.value = "";
    }

    clearInputs() {
        this.inputs = applyFunctionToInputs(null, this.clearInput.bind(this), this.inputs, false)
    }

    populateInput(data, dataInput){
        const inputEl = this.el.querySelector(`input[name="${dataInput.name}"]`)
        inputEl.value = getInputFromData(dataInput.name, data);

        return dataInput;
    }
    
    populateInputs(data) {
        this.inputs = applyFunctionToInputs(data, this.populateInput.bind(this), this.inputs, true)
    }

    clearAndHide() {
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
