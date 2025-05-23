import FormView from "../views/FormView.js";
import FormModel from "../models/FormModel.js";
import events from "../pubsub.js";

export default class FormController {
    constructor() {
        this.view = new FormView(defaultInputGroups(), defaultGroupConfigs());
        this.model = new FormModel(defaultInputGroups());

        this.renderForm()
        this.registerEvents();


    }
    renderForm() {
        document.querySelector('.container').appendChild(this.view.getElement());
    }

    registerEvents() {
        //View events
        events.on("formView:submit", (rawFormData) => events.emit("formModel:processInput", rawFormData))

        //Model events
        events.on("formModel:validationSuccessful", (parsedValues) => events.emit("form:save", parsedValues))


    }

}


const defaultInputGroups = () => ({
    loanInputs: {},               // Base loan data (e.g., amount, rate, term)
    repaymentAdjustments: {},     // Multiple changes to repayment amount
    interestOnlyPeriods: {},      // Can be plural if multiple intervals allowed
    lumpSumPayments: {},          // One-off extra payments
    paymentHolidays: {},          // Periods of paused or reduced payments
})

const defaultGroupConfigs = () => ({
    loanInputs: defaultLoanInputConfigs(),               // Base loan data (e.g., amount, rate, term)
    repaymentAdjustments: repaymentAdjustmentConfigs(),     // Multiple changes to repayment amount
    interestOnlyPeriods: {},      // Can be plural if multiple intervals allowed
    lumpSumPayments: {},          // One-off extra payments
    paymentHolidays: {},          // Periods of paused or reduced payments
})

const defaultLoanInputConfigs = () => ({
    amount : { name: "amount", label: "Loan Amount", type: "text", value: "", formatter: "currency", valueType: "number" },
    rate: { name: "rate", label: "Interest Rate", type: "text", value: "", formatter: "percentage", valueType: "number" },
    termYears: { name: "termYears", label: "Term (Years)", type: "number", value: "", formatter: null, valueType: "number" },
    termMonths: { name: "termMonths", label: "Term (Months)", type: "number", value: "", formatter: null, valueType: "number" },
    startDate: { name: "startDate", label: "Start Date", type: "date", value: getDefaultDate(), formatter: null, valueType: "string" },
    repayments: { name: "repayments", label: "Repayment Amount", type: "text", value: "", formatter: "currency", valueType: "number" },
    repaymentsFreq: { name: "repaymentsFreq", label: "Repayment Frequency", type: "select", value: "weekly", options: ["weekly", "fortnightly", "monthly"], formatter: null, valueType: "string" }
})

const repaymentAdjustmentConfigs = () => ({
    ra_0_date : { name: "ra__0_date", label: "Adjustment Date", type: "date", value: getDefaultDate(), formatter: null, valueType: "string" },
    ra_0_repayments: { name: "ra_0_repayments", label: "Adjustment Amount", type: "text", value: "", formatter: "currency", valueType: "number" },
})



function getDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months are zero-based
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd; // Add leading zero for single-digit days
    if (mm < 10) mm = '0' + mm; // Add leading zero for single-digit months

    return `${yyyy}-${mm}-${dd}`; // Format as YYYY-MM-DD
}