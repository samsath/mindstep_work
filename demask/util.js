export function flattenObject(ob) {
    const toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '_' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

export function toCSVFormat(jsonData) {
    /**
     * This function flattens the given JSON object into a single-level object
     * by recursively converting nested objects into key-value pairs.
     */
    const arrData = flattenObject(jsonData);
    const csv = [arrData].map(row => {
        return Object.keys(row).map(keyName => {
            return "\"" + (row[keyName] || "") + "\"";
        }).join("\t");
    });
    csv.unshift(Object.keys(arrData).join("\t"));
    return csv.join("\r\n");
}


export function CSVtoJson(csvData) {
    /**
     * Splits a string of CSV data into an array of lines.
     * Then pivots the data to be objects with the headers as keys.
     *
     */
    const lines = csvData.split("\n");
    let result = [];

    const headers = lines[0].split("\t");
    for(var i=1; i<lines.length; i++){
        let obj = {};
        let currentLine = lines[i].split("\t");
        for (var j=0; j<headers.length; j++) {
            obj[headers[j]] = currentLine[j].replace(/['"]+/g, '');
        }
        result.push(obj);
    }
    return result;
}

export function normalize(value, fromSource, toSource, fromTarget, toTarget) {
    let result = Math.round((value - fromSource) / (toSource - fromSource) * (toTarget - fromTarget) + fromTarget);
    return result;
}

export function invisibleStatus (num) {
    if(num >= 0 && num < 20) {
        return 'Not invisible';
    } else if(num >= 20 && num < 40) {
        return 'Camouflage';
    } else if(num >= 40 && num < 60) {
        return 'Translucent';
    } else if(num >= 60 && num < 80) {
        return 'Transparent';
    } else if(num >= 80 && num <= 100) {
        return 'Invisible';
    } else {
        return 'Invalid Input';  // in case the input is not within the specified range
    }
}