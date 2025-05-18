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

