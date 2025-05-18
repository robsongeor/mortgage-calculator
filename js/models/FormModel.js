import events from "../pubsub.js";
import { applyFunctionToDataStructure } from "../utils/DataStructureAccess.js";
import { extractNumberFromString, isValidNumericValue } from "../utils/FormUtils.js";

export default class FormModel {
    constructor(defaultInputGroups) {
        this.data = defaultInputGroups;

        this.registerEvents();
    }

    registerEvents() {
        events.on("formModel:processInput", (rawFormData) => this.process(rawFormData))
    }

    set(rawFormData) {
        this.data = { ...rawFormData }
    }

    process(rawFormData) {
        // Step 1: Clean raw input values (e.g., strip "$", convert to numbers)
        const cleaned = applyFunctionToDataStructure({
            inputCallback: this.cleanNumbers.bind(this),
            data: rawFormData,
            returns: true
        })
    
        // Step 2: Validate cleaned values
        const validated = applyFunctionToDataStructure({
            inputCallback: this.validateNumbers.bind(this),
            data: cleaned,
            returns: true,
        })

        // Step 3: Check if any input is invalid (short-circuiting to exit early)
        const hasInvalidInputs = applyFunctionToDataStructure({
            inputCallback: this.containsInvalid.bind(this),
            data: validated,
        })

        if (hasInvalidInputs) {
            events.emit("formModel:validationFailed", validated);
            console.log("Validation failed");
        } else {
            // Step 4: Extract name-value pairs only (for output)
            //const parsed = applyFunctionToInputs(null, this.parseValues.bind(this), validated, true);
            const parsed = applyFunctionToDataStructure({
                inputCallback: this.parseValues.bind(this),
                data: validated,
                returns: true,
            })
            events.emit("formModel:validationSuccessful", parsed);
        }
    }

    parseValues(inputName, props, groupName){
        return { value: props.value}
    }

    cleanNumbers(inputName, props, groupName){
        const cleanNumber = props.valueType === "number" ?
        extractNumberFromString(props.value): props.value
        
        return {
            ...props,
            value: cleanNumber
        };
    }

    validateNumbers(inputName, props, groupName){
        const isValid = props.valueType === "number"
            ? isValidNumericValue(props)
            : "not checked"

        return {
            ...props,
            valid: isValid
        };
    }

    containsInvalid(inputName, props, groupName) {
        return props.valid === false;
    }

    
}