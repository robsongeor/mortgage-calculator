// Main utility: Applies a callback to each input object in the nested input structure.
// - `data` is optional context passed into the callback
// - `callback` is the function to run for each input
// - `inputs` is the structured data object (with groups like loanInputs, etc.)
// - `collect`: if true, gathers and returns callback results
// - `shortCircuit`: if true, exits early when a condition is met (typically for validation)
export function applyFunctionToInputs(
    data = null,
    callback,
    inputs,
    collect = false,
    shortCircuit = false,
    earlyReturnValueMode = false // ✅ new option
) {
    const result = initializeResultStructure(collect);

    for (const group in inputs) {
        const groupResult = processGroup(group, inputs[group], callback, data, collect, shortCircuit, earlyReturnValueMode);

        if (earlyReturnValueMode && groupResult !== undefined) {
            return groupResult; // ✅ return actual result from callback
        }

        if (collect) {
            result[group] = groupResult;
        } else if (shortCircuit && groupResult === false) {
            return true;
        }
    }

    return collect ? result : (shortCircuit ? false : { ...inputs });
}


// Initializes an empty result structure if we're collecting outputs
function initializeResultStructure(collect) {
    return collect ? {} : null;
}

// Processes each "group" (like loanInputs), which is an array of rows (arrays of data objects)
function processGroup(group, dataRows, callback, data, collect, shortCircuit, earlyReturnValueMode) {
    if (collect) {
        return dataRows.map(row => processDataRow(row, callback, data, shortCircuit, earlyReturnValueMode));
    }

    for (const row of dataRows) {
        const result = processDataRow(row, callback, data, shortCircuit, earlyReturnValueMode);
        if (earlyReturnValueMode && result !== undefined) return result;
        if (shortCircuit && result === false) return false;
    }
}

// Processes each row (a row is an object with multiple dataInputs)
function processDataRow(dataRow, callback, data, shortCircuit, earlyReturnValueMode) {
    const outputRow = [];

    for (const [key, dataInput] of Object.entries(dataRow)) {
        const result = applyCallbackToDataInput(callback, data, dataInput);

        if (earlyReturnValueMode && result !== undefined) {
            return result; // ✅ stop and return found value
        }

        if (shortCircuit && result === true) return false;

        outputRow.push(result);
    }

    return outputRow;
}

// Applies the callback function to a single data input
// - If the callback expects two args, pass both `data` and `dataInput`
// - Otherwise, pass only `dataInput`
function applyCallbackToDataInput(callback, data, dataInput) {
    if (callback.length === 2) {
        return callback(data, dataInput);
    } else {
        return callback(dataInput);
    }
}

export function getValueByKey(key , data){
    let value = applyFunctionToInputs(key, getValueByName, data, false, false, true);

    //If returns array value is undefined
    return Array.isArray(value) ? null : value;
}

function getValueByName(key, dataInput) {
    const [keyName] = Object.keys(dataInput)

    if(keyName === key){
        return dataInput[keyName]
    } 

  
    
}

