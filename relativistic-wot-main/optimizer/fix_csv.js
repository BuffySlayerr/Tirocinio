const fs = require('fs').promises;
let headers = [];
const timeDiff = 10;
const timeKey = 'time(millisecond)';
let prevTime = 0;
let timeColIndex = -1;
const newContent = [];
const properties = ['rc_throttle(percent)', 'rc_rudder(percent)', 'rc_elevator(percent)', 'rc_aileron(percent)', 'time(millisecond)', 'latitude', 'longitude', 'height_above_takeoff(feet)'];
const actionProperties = ['rc_throttle(percent)', 'rc_rudder(percent)', 'rc_elevator(percent)', 'rc_aileron(percent)'];
const colIndexes = []
const actionPropertiesIndexes = []
let prevLineValues = [];
const file = process.argv[2];
(async () => {
    try {
        let content = await fs.readFile(file, "utf-8");
        // content = content.replace('\n', "")
        // console.log(content)
        // return
        content.split(/\r?\n/).forEach((line, index) =>  {
            if (index === 0) {
                headers = line.replace(/\s/g, "").split(',').filter((el, colIndex) => {
                    console.log(el)
                    const index = properties.indexOf(el);
                    if (el === timeKey) {
                        timeColIndex = colIndex;
                    }
                    if (index > -1) {
                        colIndexes.push(colIndex);
                        if (actionProperties.indexOf(el) > -1) {
                            actionPropertiesIndexes.push(colIndex);
                        }
                    }
                    return index > -1;
                }).map(el => `"${el}"`);
                headers.unshift("\"operation\"");
                newContent.push(renameHeaders(headers).join(','));
                return;
            }
            if (line == '') {
                return;
            }

            let newLine = [];
            const lineValues = line.split(',');
            const values = colIndexes.map(i => lineValues[i]);
            values.forEach((value, index) => {
                const floatValue = parseFloat(value);
                if (isNaN(floatValue)) {
                    newLine.push(`"${value}"`)
                } else {
                    const columnName = headers[index + 1].replaceAll('"', ""); // +1 since operation column added
                    value = rescaleValues(columnName, value);
                    newLine.push(value);
                }
            });
            newLine.unshift("\"observation\"");
            const lastLine = [...newLine];
            newContent.push(newLine.join(','));
            if (index === 1) {
                const line = [...newLine];
                line[0] = '"action"';
                newContent.push(line.join(','));
            }
            const prevActionValues = prevLineValues.filter((el, index) => actionPropertiesIndexes.indexOf(index) > -1)
            const currentActionValues = lineValues.filter((el, index) => actionPropertiesIndexes.indexOf(index) > -1)
            const currentTime = lineValues[timeColIndex];
            const diff = currentTime - prevTime;
            // console.log(diff)
            // console.log(currentActionValues)
            if(diff > timeDiff && checkActionInvoked(currentActionValues, prevActionValues)) {
                lastLine[0] = "\"action\"";
                newContent.push(lastLine.join(','));
                prevTime = currentTime;
            }
            prevLineValues = lineValues;
            // console.log(`Line from file: ${line}`);
          });
    } catch (e) {
        console.log(e)
    }
    // console.log(newContent)
    await fs.writeFile(file + '_fixed', newContent.join('\n'), 'utf-8');
    // await fs.writeFile(file + '_fixed', newContent, 'utf-8');
})();

function checkActionInvoked(currentValues, oldValues) {
    let index = 0;
    for (const val of currentValues) {
        if (oldValues.lenght < index + 1) {
            return true;
        }
        if (oldValues[index] !== currentValues[index]) {
            return true;
        }
        index++;
    } 
    return false;
}

function rescaleValues(key, value) {
    if (key === 'latitude') {
        const latitude_scale = 111798; // [m/°] in Bologna
        return latitude_scale * value;
    } else if (key === 'longitude') {
        const longitude_scale = 79243; // [m/°] in Bologna
        return longitude_scale * value
    } else if (key === 'height_above_takeoff(feet)') {
        return 0.3048 * value; // [m/feet]
    } else if (key === 'time(millisecond)') {
        return 0.001 * value;
    }
    return value;
}

function renameHeaders(headers) {
    return headers.map(el => {
        el = el.replaceAll('"', "");
        switch(el) {
            case "time(millisecond)":
                return '"timestamp"';
            case "latitude":
                return '"positionX"';
            case "longitude":
                return '"positionY"';
            case "height_above_takeoff(feet)":
                return '"positionZ"';
            case "rc_aileron(percent)":
                return '"aileron"';
            case "rc_throttle(percent)":
                return '"throttle"';
            case "rc_rudder(percent)":
                return '"rudder"';
                case "rc_elevator(percent)":
                    return '"elevator"';
            default:
                return `"${el}"`;
        }
    })
}