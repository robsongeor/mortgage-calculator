// Main utility: Applies a callback to each input object in the nested input structure.
// - `data` is optional context passed into the callback
// - `callback` is the function to run for each input
// - `inputs` is the structured data object (with groups like loanInputs, etc.)
// - `collect`: if true, gathers and returns callback results
// - `shortCircuit`: if true, exits early when a condition is met (typically for validation)
export function applyFunctionToInputs(data = null, callback, inputs, collect = false, shortCircuit = false) {
    const result = initializeResultStructure(collect); // result is either an object (collect=true) or null

    for (const group in inputs) {
        // Apply the callback logic to each group (e.g., loanInputs)
        const groupResult = processGroup(group, inputs[group], callback, data, collect, shortCircuit);

        if (collect) {
            result[group] = groupResult; // Store results per group
        } else if (shortCircuit && groupResult === false) {
            return true; // Exit early if short-circuit condition met (e.g., an invalid input found)
        }
    }

    // Final result:
    // - If collecting, return the full result object
    // - If short-circuiting, return false if nothing triggered early return
    // - Otherwise return a shallow copy of the original inputs
    return collect ? result : (shortCircuit ? false : { ...inputs });
}

// Initializes an empty result structure if we're collecting outputs
function initializeResultStructure(collect) {
    return collect ? {} : null;
}

// Processes each "group" (like loanInputs), which is an array of rows (arrays of data objects)
function processGroup(group, dataRows, callback, data, collect, shortCircuit) {
    if (collect) {
        // If collecting, map each row to a processed output row
        return dataRows.map(dataRow => processDataRow(dataRow, callback, data, shortCircuit));
    }

    // If not collecting, and using short-circuiting, loop and exit early if needed
    for (const dataRow of dataRows) {
        const shouldExit = processDataRow(dataRow, callback, data, shortCircuit);
        if (shortCircuit && shouldExit === false) return false;
    }
}

// Processes each row (a row is an object with multiple dataInputs)
function processDataRow(dataRow, callback, data, shortCircuit) {
    const outputRow = [];

    for (const [key, dataInput] of Object.entries(dataRow)) {
        const result = applyCallbackToDataInput(callback, data, dataInput);

        // Short-circuit condition: if a match is found, return false immediately
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
