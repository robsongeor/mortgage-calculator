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

    containsInvalid(dataInput){
        if(dataInput.valid === false){
            return true;
        }
        return
    }

    process(rawFormData) {
        const cleaned =  applyFunctionToInputs(null, this.cleanNumbers.bind(this), rawFormData, true);
        const validated = applyFunctionToInputs(null, this.validateNumbers.bind(this), cleaned, true);
        const containsInvalid = applyFunctionToInputs(null, this.containsInvalid.bind(this), validated, false, true)
        console.log(containsInvalid)

        if (containsInvalid) {
            events.emit("formModel:validationFailed", validated);
            console.log("failed")
        } else {
            const parsed = applyFunctionToInputs(null, this.parseValues.bind(this), validated, true, false)
            console.log(parsed)
            events.emit("formModel:validationSuccessful", parsed);
        }
    }



    parseValues(dataInput){
        return { [dataInput.name]: dataInput.value}
    }

    getInvalidInputs(data) {
        const invalidInputs = {};

        for (const group in data) {
            const invalidGroupInputs = data[group].filter(input => input.valid === false);
            if (invalidGroupInputs.length > 0) {
                invalidInputs[group] = invalidGroupInputs;
            }
        }

        return invalidInputs;
    }

    validateInputs(data) {

        //Check all numbers
        const validatedNumbers = this.mapOverInputGroups(data, this.validateNumbers);

        //Special check for termYears && termMonths
        const validatedTermDuration = this.validateTermDuration(validatedNumbers);

        return validatedTermDuration;
    }

    validateTermDuration(data) {
        console.log(this.getValueByKey("termYears", data))

        const termYears = data.loanInputs.find(input => input.name === "termYears");
        const termMonths = data.loanInputs.find(input => input.name === "termMonths");

        const bothZero = (termYears?.value ?? 0) === 0 && (termMonths?.value ?? 0) === 0;

        if (bothZero) {
            // Mark both as invalid
            termYears.valid = false;
            termMonths.valid = false;
        }

        return data;
    }

 

    removeNumberFormatting = (dataInput) => {
        const cleanedValue = dataInput.valueType === "number"
            ? extractNumberFromString(dataInput.value)
            : dataInput.value;

        return {
            ...dataInput,
            value: cleanedValue
        };
    }

    mapOverInputGroups = (data, operator) => {
        const dataCopy = {};

        for (const group in data) {
            if (Array.isArray(data[group])) {
                dataCopy[group] = data[group].map(dataInput => operator(dataInput));
            }
        }

        return dataCopy;
    }

    // The modified search function with key argument
    searchForKey(key, _, dataInput) {

        if (dataInput.name === key) {  // Compare the 'name' property with the given key
            return dataInput[key];  // Return the value if the key matches
        }
        return undefined;  // Return undefined if the key doesn't match
    }

    // Example function to search for a key in the data structure
    getValueByKey(key, rawData) {

        return applyFunctionToInputs(
            null,  // No need for 'data' in this case
            this.searchForKey.bind(null, key),  // Bind the 'key' argument to the callback
            rawData,
            true // Collect mode
        );
    }
}