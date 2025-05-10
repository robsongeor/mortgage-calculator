import events from "../pubsub.js";
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
        //Process will clean the data, validate and return either an error or success
        // First turn number strings into numbers
        // Check numbers are valid - not less than 0, percents not greater than x%
        // Check dates are valid. optional dates cant be less than start or greater than end of term
        // 
        const cleaned = this.mapOverInputGroups(rawFormData, this.removeNumberFormatting);
        const validated = this.validateInputs(cleaned);
        const invalidInputs = this.getInvalidInputs(validated);

        
        if (Object.keys(invalidInputs).length > 0) {
            events.emit("formModel:validationFailed", invalidInputs);
            console.log("failed")
        } else {
            const parsed = this.mapOverInputGroups(validated, this.parseValues);
            events.emit("formModel:validationSuccessful", parsed);
        }
    }

    parseValues = ({ name, value, formatter }) => ({ [name]: value,  formatter });

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

    validateNumbers = (dataInput) => {
        const isValid = dataInput.valueType === "number"
            ? isValidNumericValue(dataInput)
            : "not checked"

        return {
            ...dataInput,
            valid: isValid
        };
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
}