import events from "../pubsub.js";
import { applyFunctionToInputs } from "../utils/DataStructureAccess.js";
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
        const cleaned = applyFunctionToInputs(null, this.cleanNumbers.bind(this), rawFormData, true);
    
        // Step 2: Validate cleaned values
        const validated = applyFunctionToInputs(null, this.validateNumbers.bind(this), cleaned, true);
    
        // Step 3: Check if any input is invalid (short-circuiting to exit early)
        const hasInvalidInputs = applyFunctionToInputs(null, this.containsInvalid.bind(this), validated, false, true);
    
        if (hasInvalidInputs) {
            events.emit("formModel:validationFailed", validated);
            console.log("Validation failed");
        } else {
            // Step 4: Extract name-value pairs only (for output)
            const parsed = applyFunctionToInputs(null, this.parseValues.bind(this), validated, true);
            events.emit("formModel:validationSuccessful", parsed);
        }
    }

    parseValues(dataInput){
        return { [dataInput.name]: dataInput.value}
    }

    cleanNumbers(dataInput){
        const cleanNumber = dataInput.valueType === "number" ?
        extractNumberFromString(dataInput.value): dataInput.value
        
        return {
            ...dataInput,
            value: cleanNumber
        };
    }

    validateNumbers(dataInput){
        const isValid = dataInput.valueType === "number"
            ? isValidNumericValue(dataInput)
            : "not checked"

        return {
            ...dataInput,
            valid: isValid
        };
    }

    containsInvalid(dataInput) {
        return dataInput.valid === false;
    }

    
}