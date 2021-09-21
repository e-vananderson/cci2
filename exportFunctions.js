/*
Written by Stanton Martin and Daniel Hopp.

exportFunctions.js has generic functions to export data to a .csv and a .json file format. Any selected Cesium
points can be exported to .csv. The NMDC export requires pre-defined entities within the Cesium points.
 */

let exportArray = [];

function exportJSONFile(fileName, string){
    let exportedFilenmae = fileName + '.json' || 'export.json';

    let blob = new Blob([string], { type: 'text/json;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function convertToCSV(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {

    // Convert Object to JSON
    let jsonObject = JSON.stringify(items);

    let csv = this.convertToCSV(jsonObject);

    let exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function createCSVArray(pickedObjects){
    clearExportArray();
    //createCSVHeaders(pickedObjects);
    // pickedObject.id will get you the entity.
    // pickedObject.id.id will get you the ID of the entity.
    console.log('pickedObjects.length: ' + pickedObjects.length);

    let headerCreated = false;
    let arrayLineHeaders = [];

    for (let i = 0; i < pickedObjects.length; i++) {
        let arrayLine = [];

        // ignore the rectangle
        if (pickedObjects[i].id.properties.latitude != 0.0 &&
            pickedObjects[i].id.properties.longitude != 0.0){

            // create column name headers
            if (!headerCreated){
                let columnNames = pickedObjects[i].id.properties.propertyNames;
                columnNames.forEach(getColNames);
                function getColNames(item) {
                    arrayLineHeaders.push(item);
                }
                exportArray.push(arrayLineHeaders);
                headerCreated = true;
            }

            // add properties to an array
            arrayLineHeaders.forEach(getRowData);
            function getRowData(propertyName) {
                arrayLine.push(pickedObjects[i].id.properties[propertyName]._value.toString());
            }

            // add array line to export array
            exportArray.push(arrayLine);
        }
    }
    console.log(exportArray);
    return exportArray;
}

function createJSONarray(pickedObjects){
    clearExportArray();
    let key = "";
    let value = "";
    let arrayString = "";


    for (let i = 0; i < pickedObjects.length; i++) {

        arrayString = "";


        // ignore the rectangle
        if (pickedObjects[i].id.properties.latitude != 0.0 &&
            pickedObjects[i].id.properties.longitude != 0.0){
            arrayString = arrayString + "{";

            //create JSON string for each picked object
            let propertyNames = pickedObjects[i].id.properties.propertyNames;
            propertyNames.forEach(function (property, idx, array) {
                key = property;
                value = pickedObjects[i].id.properties[property]._value.toString();

                arrayString = arrayString + "\"" + key + "\": \"" + value + "\"";

                if (idx !== array.length - 1){
                    arrayString = arrayString + ", ";
                }
            });

            // add line to export array
            arrayString = arrayString + "}";
            exportArray.push(arrayString);
        }
    }
    console.log(exportArray);
    return exportArray;
}

function createArrayBsdSiteIdOnly(pickedObjects){
    clearExportArray();



    for (let i = 0; i < pickedObjects.length; i++) {

        // ignore the rectangle
        if (pickedObjects[i].id.properties.latitude != 0.0 &&
            pickedObjects[i].id.properties.longitude != 0.0){
            // arrayString = arrayString + "{";

            //create JSON string for each picked object
            let propertyNames = pickedObjects[i].id.properties.propertyNames;
            propertyNames.forEach(function (property, idx, array) {
                key = property;
                value = pickedObjects[i].id.properties[property]._value.toString();

                if (key == 'bsd_site_id'){
                    exportArray.push(value);
                }
            });

        }
    }
    console.log(exportArray);
    return exportArray;
}

function createIntegerArray(pickedObjects, keyValue){
    clearExportArray();
    let key = "";
    let value = "";
    let arrayString = "";


    // let headerCreated = false;
    // let arrayLineHeaders = [];

    for (let i = 0; i < pickedObjects.length; i++) {
        // let arrayLine = [];
        // arrayString = "";


        // // ignore the rectangle
        // if (pickedObjects[i].id.properties.latitude != 0.0 &&
        //     pickedObjects[i].id.properties.longitude != 0.0){
        //     arrayString = arrayString + "{";

            //create JSON string for each picked object
            let propertyNames = pickedObjects[i].id.properties.propertyNames;
            propertyNames.forEach(function (property, idx, array) {
                key = property;
                value = pickedObjects[i].id.properties[property]._value.toString();
                console.log(key);
                console.log(value);

                if (key == keyValue){
                    exportArray.push(Number(value));
                }
                // arrayString = arrayString + "\"" + key + "\": \"" + value + "\"";
                //
                // if (idx !== array.length - 1){
                //     arrayString = arrayString + ", ";
                // }
            });

            // add line to export array
            // arrayString = arrayString + "}";
            // exportArray.push(arrayString);
            //exportArray.push(arrayLine);
        // }
    }
    console.log(exportArray);
    return exportArray;
}

function createNMDCjson(pickedObjects){
    // NMDC's expected property names
    let NMDC_headers = {
        lbc:'misc_param', lb_ceq:'misc_param', ph:'ph', ca:'calcium', k:'potassium', mg:'magnesium', mn:'misc_param',
        p:'misc_param', zn:'misc_param', ammonium:'misc_param', no2:'misc_param', no3:'misc_param', c:'tot_carb',
        n:'tot_nitro_content', soil_moisture:'water_content', site:'geo_loc_name', dbh:'misc_param',
        total_tree_height:'misc_param', collection_date:'collection_date', sample_id: 'source_mat_id'
    };

    // NMDC's units
    let NMDC_units = {
        lbc:'ppm CaCO3/pH', lb_ceq:'ppm CaCO3/pH', ca:'mg/kg (ppm)', k:'mg/kg (ppm)', mg:'mg/kg (ppm)', mn:'mg/kg (ppm)',
        p:'mg/kg (ppm)', zn:'mg/kg (ppm)', ammonium:'mg/kg', no2:'mg/kg', no3:'mg/kg', c:'%', n:'%', soil_moisture:'%',
        latitude:'DD(WGS84)', longitude:'DD(WGS84)'
    }

    // NMDCs that do not have a has_numeric_value section
    let NMDC_NaN = ['site', 'collection_date', 'sample_id']

    let jsonString = "{ \"biosample_set\": [";
    let isMultipleBiosamples = false;
    foundString = "";

    for (let i = 0; i < pickedObjects.length; i++) {
        if (pickedObjects[i].id.properties.latitude != 0.0 &&
            pickedObjects[i].id.properties.longitude != 0.0) {

            // if it's a second group of data, seperate biosample_sets with ,
            if (isMultipleBiosamples){
                jsonString = jsonString + ", ";
            }

            jsonString = jsonString + "{\"id\": \"BioScales:";

            // add id "BioScales:sample_id"
            foundString = findPropertyName(pickedObjects[i], 'sample_id');
            jsonString = jsonString + foundString + "\"";

            // add location
            jsonString = jsonString + ", \"location\": \"";
            foundString = findPropertyName(pickedObjects[i], 'tree_id');
            jsonString = jsonString + foundString + "\"";

            // add lat and long
            jsonString = jsonString + ", \"lat_lon\": {\"has_raw_value\": \"";
            let lat = findPropertyName(pickedObjects[i], 'latitude');
            jsonString = jsonString + lat + " ";
            let long = findPropertyName(pickedObjects[i], 'longitude');
            jsonString = jsonString + long + "\", \"latitude\": " + lat + ", \"longitude\": " + long + "}";

            // loop through the rest of the properties, if any
            let propertyNames = pickedObjects[i].id.properties.propertyNames;
            propertyNames.forEach(function(item) {
                // if a match exists, put matching property name in an array/json
                Object.entries(NMDC_headers).forEach(([cesium, nmdc]) => {
                    if (item === cesium){
                        jsonString = jsonString + ", \"" + nmdc + "\": {";

                        //has_raw_value
                        jsonString = jsonString + "\"has_raw_value\": \"" +
                            pickedObjects[i].id.properties[item]._value.toString() + "\"";

                        //has_unit
                        Object.entries(NMDC_units).forEach(([key, value]) => {
                            if(item === key){
                                jsonString = jsonString + ", \"has_unit\": \"" + value + "\"";
                            }
                        });

                        //has_numeric_value. ignore those that have no has_numeric_value
                        let itemHasNumValue = true;
                        NMDC_NaN.forEach(function (NaN_key) {
                            if (item === NaN_key){
                                itemHasNumValue = false;
                            }
                        });
                        if (itemHasNumValue){
                            jsonString = jsonString + ", \"has_numeric_value\": " +
                                pickedObjects[i].id.properties[item]._value.toString();
                        }

                        //if misc_param, type
                        if (nmdc = 'misc_param'){
                            jsonString = jsonString + ", \"type\": \"" + cesium + "\"";
                        }

                        // close section
                        jsonString = jsonString + "}";

                    }
                });
            });

            // close biosample set
            jsonString = jsonString + "}"

            // prep for multipule biosamples
            isMultipleBiosamples = true;

        }
    }
    // close json string
    jsonString = jsonString + "]}";
    return jsonString;
}

function findPropertyName(pickedObject, textToFind) {
    let foundString = "";
    let propertyNames = pickedObject.id.properties.propertyNames;
    propertyNames.forEach(function (property) {
        if (property == textToFind) {
            foundString = pickedObject.id.properties[property]._value.toString();
        }
    });
    return foundString;
}

function clearExportArray(){
    exportArray = [];
}