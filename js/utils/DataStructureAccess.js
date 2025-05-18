export function applyFunctionToDataStructure({ name, inputCallback, groupCallback, valueCallback, data, returns = false }) {
    
    const returnData = {};

    for (const [groupName, group] of Object.entries(data)) {
        const groupData = returnData[groupName] = {};

        if (groupCallback && (!name || name === groupName)) {
            groupCallback(groupName, group);
        }

        for (const [inputName, props] of Object.entries(group)) {
            const inputData = groupData[inputName] = {}
            if (inputCallback) {
                let result;
                if((!name || name === inputName)){
                    result = inputCallback(inputName, props, groupName);
                }else{
                    result = props;
                }
                
                
                if (result === true) {
                    return true; // Short-circuit on failure
                }

                groupData[inputName] = result;
            }

            for (const [key, value] of Object.entries(props)) {
                
                if (valueCallback) {
                    inputData[key] =  valueCallback(key, value, inputName, groupName);
                }
            }
        }
    }

    return returns ? returnData : false;
}


// Applies a function to group/s (singular if name not null)
export function applyFunctionToGroup({ name = null, callback, data, returns = false }) {

    for (const [groupName, group] of Object.entries(data)) {


    }
}



export function applyFunctionToInputs({ name = null, callback, group, returns = false }) {


    for (const [inputName, props] of Object.entries(group)) {

        if (!name) {
            callback(inputName, props)
        } else if (name === inputName) {
            callback(inputName, props)
        }
    }
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

export function getValueByKey(key, data) {
    let result;
    const setValue = (val) => result = val;

    applyFunctionToDataStructure({
        name: key,
        data: data,
        inputCallback: getValueByName(key, setValue)
    })

   // console.log(key, result)
    return result
}

function getValueByName(key, setValue) {
    return function(inputName, props) {
        if(inputName == key){
            setValue(props.value)
            return true;
        }
    }
}

