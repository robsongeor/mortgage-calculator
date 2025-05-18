import DataInput from "../components/DataInput.js";
import events from "../pubsub.js";
import { applyFunctionToDataStructure, getValueByKey } from "../utils/DataStructureAccess.js";
import { createButton } from "../utils/FormUtils.js";

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

    _createForm(configs) {
        this.createGroups(configs)
        this.createInputs(configs)
        this._createButtons();
    }

    createGroups(configs) {
        //applyFunctionToDataStructure({data: configs})
        applyFunctionToDataStructure({
            groupCallback: this._createGroupDiv.bind(this),
            data: configs
        }
        )

    }

    _createGroupDiv(groupName) {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add(groupName);
        this.el.appendChild(groupDiv);

        // return groupDiv;

    }

    createInputs(configs) {
        // Create each input inside the DIV
        applyFunctionToDataStructure({
            inputCallback: this._createInput.bind(this),
            data: configs,
        })
    }

    _createInput(inputName, props, groupName) {
        const groupDiv = this.el.querySelector(`.${groupName}`)
        const input = new DataInput(props);

        groupDiv.appendChild(input.getElement());
        this.inputs[groupName] = { ...this.inputs[groupName], [inputName]: input }
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
        //console.log(this.getRawInputValue())
    }

    cancel() {
        // Clear form and hide it
        this.clearAndHide();
    }

    getElement() {
        // Return form element for external use (e.g. mounting to DOM)
        return this.el;
    }

    getRawInputValue(inputName, props, groupName) {
        const val = props.el.querySelector("input").value;

        const inObject = { name: props.name, valueType: props.valueType, value: val, }

        return {
            ...inObject
        };
    }

    getRawInputValues() {
        const rawInputValues = applyFunctionToDataStructure({
            inputCallback: this.getRawInputValue.bind(this),
            returns: true,
            data: this.inputs
        })

        return rawInputValues;
    }


    clearInput(inputName, props, groupName) {
        props.el.querySelector("input").value = "";
    }

    clearInputs() {
        applyFunctionToDataStructure({
            inputCallback: this.clearInput.bind(this),
            data: this.inputs
        })
    }

    populateInput(inputName, props, groupName, data) {

        const value = getValueByKey(inputName, data);
        props.el.querySelector("input").value = value;

    }

    populateInputs(data) {

        applyFunctionToDataStructure({
            inputCallback: (inputName, props, groupName) => this.populateInput(inputName, props, groupName, data),
            data: this.inputs,
            returns: true
        })

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
