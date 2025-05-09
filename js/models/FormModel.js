import events from "../pubsub.js";

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
        let data = rawFormData;
        //Process will clean the data, validate and return either an error or success
        // First turn number strings into numbers
        // Check numbers are valid - not less than 0, percents not greater than x%
        // Check dates are valid. optional dates cant be less than start or greater than end of term
        // 
        this.set(rawFormData);

        const cleaned = this.mapOverInputGroups(rawFormData, this.removeNumberFormatting);
        const validatedNumbers = this.mapOverInputGroups(cleaned, this.validateNumbers);

        this.set(validatedNumbers)

        //If all inputs valid, emit with data for calc
        //Else, emit return object with invalid inputs to formView for resubmission

        

        events.emit("formModel:sucessfulValidation", this.mapOverInputGroups(this.data, this.parseValues));

    }

    parseValues = ({ name, value }) => ({ [name]: value });

    validateNumbers = (dataInput) => {
        const checkNumber = dataInput.valueType === "number"
            ? this.isValidNumericValue(dataInput)
            : "not checked"

        return {
            ...dataInput,
            invalid: checkNumber
        };
    }
        
    
    removeNumberFormatting = (dataInput) => {
        const cleanedValue = dataInput.valueType === "number"
            ? this.extractNumberFromString(dataInput.value)
            : dataInput.value;

        return {
            ...dataInput,
            value: cleanedValue
        };
    }

    mapOverInputGroups = (data, operator) => {
        // This iteratates over the input groups object, and applies 'operator' function
        let dataCopy = {}

        for (const group in data) {
            dataCopy[group] = data[group].map(
                dataInput => operator(dataInput)
            );
        }

        return dataCopy;
    }

    //HELPERS TO BE MOVED!//

    extractNumberFromString(str) {
        return parseFloat(str.replace(/[^0-9.]/g, ""));
    }

    isValidNumericValue(dataInput) {
        switch (dataInput.name){
            case "termYears":
            case "termMonths":
               return dataInput.value >= 0;
            case "rate":
                return dataInput.value > 0 && dataInput.value < 50;
            default:
                return dataInput.value > 0;
        }
    }


}