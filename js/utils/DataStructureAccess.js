//Data is the data to apply to the inputs 


// Apply the callback function to each input (with or without 'data')
export function applyFunctionToInputs(data = null, callback, inputs, collect = false) {
    const result = initializeResultStructure(collect);

    for (const group in inputs) {
        processGroup(group, inputs[group], callback, data, collect, result);
    }

    return result;
}

// Initialize the result structure depending on whether we want to collect values
function initializeResultStructure(collect) {
    return collect ? {} : null;
}

// Process each group in the inputs
function processGroup(group, dataRows, callback, data, collect, result) {
    if (collect) result[group] = [];

    dataRows.forEach(dataRow => {
        const outputRow = processDataRow(dataRow, callback, data);
        
        if (collect) result[group].push(outputRow);
    });
}

// Process each row in the group by applying the callback to each data input
function processDataRow(dataRow, callback, data) {
    return Object.entries(dataRow).map(([key, dataInput]) => {
        return applyCallbackToDataInput(callback, data, dataInput);
    });
}

// Apply the callback to a data input based on whether 'data' is needed
function applyCallbackToDataInput(callback, data, dataInput) {
    if (callback.length === 2) {
        return callback(data, dataInput);  // Call with 'data' if the callback expects it
    } else {
        return callback(dataInput);  // Call without 'data' if it's not needed
    }
}


    /* FUNCTION UN ABSTRACTED //

    applyFunctionToInputs(data = null, callback, inputs, collect = false) {
        const result = collect ? {} : null;
    
        for (const group in inputs) {
            if (collect) result[group] = [];
    
            inputs[group].forEach((dataRow, rowIndex) => {
                const outputRow = [];
    
                for (const [key, dataInput] of Object.entries(dataRow)) {
                    const output = callback.length === 2
                        ? callback(data, dataInput)
                        : callback(dataInput); 
    
                    if (collect) outputRow.push(output);
                }
    
                if (collect) result[group].push(outputRow);
            });
        }
    
        return collect ? result : { ...inputs };
    }
    */


const dataObject = {
    "loanInputs": [
        {
            "amount": 210000,
            "rate": 6.69,
            "termYears": 2,
            "termMonths": 0,
            "startDate": "2023-09-20",
            "repayments": 310.76,
            "repaymentsFreq": "weekly"
        }
    ],
    "repaymentAdjustments": [
        {
            "ra_repayments": 550,
            "ra_date": "2023-12-25"
        }
    ],
    "interestOnlyPeriods": [],
    "lumpSumPayments": [],
    "paymentHolidays": [],
    "outputs": [
        {
            "interestPaid": 0,
            "principlePaid": 0,
            "totalPaid": 0,
            "balance": 210000,
        }
    ]
}