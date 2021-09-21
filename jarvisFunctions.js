/*
Written by Stanton Martin, Daniel Hopp, with code snippets used from the below commented websites.

jarvisFunctions.js contains Cesium Viewer initialization, entity selection via click-and-drag, entity exports, and an optional function to select an entity or entities via
a double-click. (Note - The export menu is not connected to this optional function).

Note: all export options are not completed.
 */

var selector;
var polygonSelection = "0 0, 0 0, 0 0, 0 0, 0 0";

// toggle the fetch root url before the push to the depository
// let fetchURLRoot = "http://equipment.ornl.gov/Jarvis/cci2/";
let fetchURLRoot = "http://localhost/";

// Function to setup the viewer
function initializeViewer(){
    viewer = new Cesium.Viewer('cesiumContainer', {
        clock: new Cesium.Clock({ //Timebar code from https://github.com/theplatapi/ClimateStationVisualizer/blob/master/weatherStationVisualize/weatherStationVisualize.js
            startTime: Cesium.JulianDate.fromIso8601('1980-01-01T00:00:00Z'),
            currentTime: Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00Z'),
            stopTime: Cesium.JulianDate.fromIso8601("2021-12-01T00:00:00Z"),
            clockRange: Cesium.ClockRange.CLAMPED,
            canAnimate: false,
            shouldAnimate: false,
            multiplier: 31557600 //Fast forward 1 year a second
        }),
        //Saves GPU memory
        scene3DOnly: true,
        automaticallyTrackDataSourceClocks: false
    });

    //Timebar setup
    //Cesium.Timeline.prototype.zoomTo = _.noop;  // what's _.noop??
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var gregorianDate = new Cesium.GregorianDate(0, 0, 0, 0, 0, 0, 0, false);
    var dateFormatter = function (date) {
        gregorianDate = Cesium.JulianDate.toGregorianDate(date, gregorianDate);
        return monthNames[gregorianDate.month - 1] + ' ' + gregorianDate.year;
    };
    Cesium.Timeline.prototype.makeLabel = dateFormatter;
    viewer.animation.viewModel.dateFormatter = dateFormatter;
    //viewer.animation.viewModel.timeFormatter = _.noop; // what's _.noop??

    screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    viewer.scene.debugShowFramesPerSecond = true;
    scene = viewer.scene;

}

function addRouteNameButtonAction() {
    JSONarray = createArrayBsdSiteIdOnly(pickedObjects);
    userRouteName = document.getElementById("routeNameTextbox").value.trim();
    // userRouteName = userRouteName.trim();
    console.log('userRouteName: ' + userRouteName);
    if (userRouteName.length > 0) {
        exportArray = [JSONarray, dbUserID, userRouteName]; // pass array of selected site IDs, user's DB id, name or user's route
        console.log(exportArray);
        if (exportArray.length > 0) {
            fetchWithNoReturnValue("createUserRouteInDatabase.php", JSON.stringify(exportArray));
            hideRectangleAndMenu();
        }
    }
    else {
        alert("The name cannot be blank!");
    }
}


function exportButtonAction(){
    console.log('Export button is clicked!');
    if (Cesium.defined(pickedObjects)) {
        try {
            var shapeEditMenu = document.getElementById("exportMenu");
            // Do action based on user's selection
            //var selection = document.getElementById("exportSelect").value;
            let e = document.getElementById("exportSelect");
            let selection = e.options[e.selectedIndex].text;
            switch (selection){
                case 'Create Sampling Trip':
                    // show html entity to name route
                    // sceneCoords = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, Cesium.Cartesian3.fromDegrees(0.0, 0.0));
                    // showMenu(sceneCoords.x, sceneCoords.y, "addRouteNameMenu");
                    showMenu(WindowCoordsRectSE.x, WindowCoordsRectSE.y + 25, "addRouteNameMenu");
                    document.getElementById("routeNameTextbox").focus();

                    // function to run quries is called from the button in the Route Name menu

                    break;
                case 'Export to CSV':
                    if (isRectangleVisible()){
                        exportArray = createCSVArray(pickedObjects);
                        if (exportArray.length > 0){
                            exportCSVFile('tempHeaderVariable', exportArray, 'csv_selection');
                            hideRectangleAndMenu();
                        }
                    }
                    else{
                        alert('Please select an area.');
                    }
                    break;
                case 'Export to JGI':
                    console.log('jgi function is being called!');
                    break;
                case 'Export to NMDC':
                    console.log('nmdc action is being called!');
                    if (isRectangleVisible()){
                        nmdcJsonString = createNMDCjson(pickedObjects);
                        if (nmdcJsonString.length > 0){
                            // export json string to file
                            exportJSONFile('NMDC', nmdcJsonString);
                            hideRectangleAndMenu();
                        }
                    }
                    else{
                        alert('Please select an area.');
                    }
                    break;
                case 'View in Unreal':
                    console.log('unreal function is being called!');
                    break;
                case 'Publicise Data':
                    console.log('Publicise Data (fairterms) is selected! Note: the DB functions to insert data into the temp tables are currently removed');
                    // see if values can be passed via fetch into PHP variables
                    if (isRectangleVisible()){
                        JSONarray = createJSONarray(pickedObjects);
                        exportArray = [JSONarray, polygonSelection];
                        console.log(exportArray);
                        if (exportArray.length > 0) {
                            // fetchWithNoReturnValue("exportToDatabase.php", JSON.stringify(exportArray));
                            hideRectangleAndMenu();
                        }
                    }
                    else{
                        alert('Please select an area.');
                    }
                    break;
                case 'Predictive Analytics':
                    console.log('predictiveAnalytics function is being called!');
                    break;
                default:
                    console.log('Something is up with the dropdown selection.');
            }
        }
        catch (err){
            exportArray = [];
            nmdcJsonString = "";
            alert('Different data groups cannot be exported together, the selected data does not yet have an export' +
                ' associated with it, or there is an ancaught error! (check console log)');
            console.log(err);
        }
    }
}

function hideExportMenu(shapeEditMenu){
    shapeEditMenu.style.display = "none";
}

function isRectangleVisible(){
    if (selector.show == false){
        return false;
    }
    return true;
}

function myFunction(){
    console.log('A function!');
}

// Function to get min and max creation dates of entities
function getMinMaxCreationDates(entities){
    let creationDateMin = new Date();
    let creationDateMax = new Date(1970, 1, 1);
    console.log('Entities (with Creation Dates) length: ' + entities.length);
    for (var i = 0; i < entities.length; i++) {

        let entity = entities[i];
        let tempDate = new Date(entity.properties.creation_date._value);

        // find max date
        if(tempDate < creationDateMin) {
            creationDateMin = tempDate;
        }
        if(tempDate > creationDateMax) {
            creationDateMax = tempDate;
        }
    }
    console.log('Min Date: ' + creationDateMin);
    console.log('Max Date: ' + creationDateMax);
}
// end to get min and max creation dates


function addGeojsonToCesium(myJson){
    if (myJson.length > 0) {
        myJson.forEach(function (geojson) {
            datasourcePublicData = Cesium.GeoJsonDataSource.load(JSON.parse(geojson), {
            });
            viewer.dataSources.add(datasourcePublicData);
        });
    };
}

function fetchWithNoReturnValue(fetchURL, bdy){
    fetch(fetchURLRoot + fetchURL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: bdy
    })
        .then((response) => {
            console.log(response)
        });
}

function fetchWithTextBodyAndJsonResponse(fetchURL, bdy){
    fetch(fetchURL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: bdy
        // display the returned points
    }).then(function(response) {
        console.log(response.headers);
        response.json().then(function(myJson) {
            console.log(myJson);
            addGeojsonToCesium(myJson);
        });
    });
}

function fetchWithTextBodyAndJsonResponseFlyTo(fetchURL, bdy){
    fetch(fetchURL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: bdy
        // display the returned points
    }).then(function(response) {
        console.log(response.headers);
        response.json().then(function(myJson) {
            console.log(myJson);
            // console.log(myJson[0]);
            // console.log(myJson[1]);
            viewer.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(myJson[0], myJson[1], myJson[2])
            });
        });
    });
}

// temp funciton to get data from the DB
function getSampleData(){
    integerArray = createIntegerArray(pickedObjects, "bsd_sample_id");

    // connect to db
    console.log(exportArray);
    if (exportArray.length > 0) {
        fetch(fetchURLRoot + "getSampleDataFromDB.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(integerArray)
        }).then(function(response) {
            console.log(response.headers);
            response.json().then(function(myJson) {
                console.log(myJson);
            });
        });
    }
}