// Rectangle and double-click selection
// Main code from https://gist.github.com/theplatapi/0a7d789afc8028a3c20b
let shapeEditMenu = document.getElementById("exportMenu");
let shapeAddRouteNameMenu = document.getElementById("addRouteNameMenu");
var firstPointSet = false;

function entitySelection() {

    //viewer.scene.screenSpaceCameraController.enableTranslate = false;
    //viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;


    //var selector;
    var rectangleSelector = new Cesium.Rectangle();
    var cartesian = new Cesium.Cartesian3();
    var tempCartographic = new Cesium.Cartographic();
    var firstPoint = new Cesium.Cartographic();
    // var firstPointSet = false;
    var mouseDown = false;
    var camera = viewer.camera;

    //Draw the selector while the user drags the mouse while holding shift
    screenSpaceEventHandler.setInputAction(function drawSelector(movement) {
        if (!mouseDown) {
            return;
        }

        cartesian = camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid, cartesian);

        if (cartesian) {
            //mouse cartographic
            tempCartographic = Cesium.Cartographic.fromCartesian(cartesian, Cesium.Ellipsoid.WGS84, tempCartographic);

            if (!firstPointSet) {
                Cesium.Cartographic.clone(tempCartographic, firstPoint);
                firstPointSet = true;
            } else {
                rectangleSelector.east = Math.max(tempCartographic.longitude, firstPoint.longitude);
                rectangleSelector.west = Math.min(tempCartographic.longitude, firstPoint.longitude);
                rectangleSelector.north = Math.max(tempCartographic.latitude, firstPoint.latitude);
                rectangleSelector.south = Math.min(tempCartographic.latitude, firstPoint.latitude);
                selector.show = true;
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.SHIFT);

    var getSelectorLocation = new Cesium.CallbackProperty(function getSelectorLocation(time, result) {
        return Cesium.Rectangle.clone(rectangleSelector, result);
    }, false);

    // start shift click
    screenSpaceEventHandler.setInputAction(function startClickShift() {
        mouseDown = true;
        selector.rectangle.coordinates = getSelectorLocation;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.SHIFT);

    // end shift click
    screenSpaceEventHandler.setInputAction(function endClickShift() {
            entitySelectionLogic(rectangleSelector);
    }, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.SHIFT);

    screenSpaceEventHandler.setInputAction(function endClickShift() {
        if (selector.show == true){ // to avoid menu widget showing when globe rotates via the mouse
            entitySelectionLogic(rectangleSelector);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    //Hide the rectangle selector and export menu by clicking anywhere
    screenSpaceEventHandler.setInputAction(function hideSelector() {
        hideRectangleAndMenu();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //// DoubleClick to select point(s) /////////////////////////////////
    // Code from https://groups.google.com/g/cesium-dev/c/sfm049HSQgk
    var scene = viewer.scene;
    var handler;
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function (click) {
        // Scene.drillPick will get an array of all entities that overlap at the mouse click point
        // var scene = viewer.scene;
        pickedObjects = viewer.scene.drillPick(click.position);
        //getDrillPickLatLong(pickedObjects);
        getSampleData();


    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    //////////end DoubleClick code////////////////////////////////////////////

    //Add the rectangle to the scene
    selector = viewer.entities.add({
        selectable: false,
        show: false,
        rectangle: {
            coordinates: getSelectorLocation,
            material: Cesium.Color.BLACK.withAlpha(0.5)
        },
        properties: { // 0.0 lat and long for rectangle object
            "latitude": 0.0,
            "longitude": 0.0
        }
    });
}
function entitySelectionLogic(rectangleSelector){
    mouseDown = false;
    firstPointSet = false;
    selector.rectangle.coordinates = rectangleSelector;

    ////////added to get rectangle corner's lat long coords///////////////////
    //NE corner
    var rectangleNE_long = Cesium.Math.toDegrees(rectangleSelector.east);
    var rectangleNE_lat = Cesium.Math.toDegrees(rectangleSelector.north);

    //SW corner
    var rectangleSW_long = Cesium.Math.toDegrees(rectangleSelector.west);
    var rectangleSW_lat = Cesium.Math.toDegrees(rectangleSelector.south);

    //SE corner
    var rectangleSE_lat = rectangleSW_lat;
    var rectangleSE_long = rectangleNE_long;

    //NW corner
    var rectangleNW_long = rectangleSW_long;
    var rectangleNW_lat = rectangleNE_lat;

    //populate variable for postGIS import. long, lat
    polygonSelection = rectangleSW_long + " " + rectangleSW_lat + ", " +
        rectangleSE_long + " " + rectangleSE_lat + ", " +
        rectangleNE_long + " " + rectangleNE_lat + ", " +
        rectangleNW_long + " " + rectangleNW_lat + ", " +
        rectangleSW_long + " " + rectangleSW_lat;

    // translate rectangle lat and long coords into window position lat long coords
    //Center of the Rectangle
    rectCenterCartesian = Cesium.Rectangle.center(rectangleSelector);
    rectCartesian3 = Cesium.Cartographic.toCartesian(rectCenterCartesian);
    WindowCoordsRectCenter = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, rectCartesian3);

    // use 3 corners to compute the width and height in window coords
    RectNECartesian3 = Cesium.Cartesian3.fromDegrees(rectangleNE_long, rectangleNE_lat);
    WindowCoordsRectNE = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, RectNECartesian3);
    RectNWCartesian3 = Cesium.Cartesian3.fromDegrees(rectangleNW_long, rectangleNW_lat);
    WindowCoordsRectNW = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, RectNWCartesian3);
    RectSECartesian3 = Cesium.Cartesian3.fromDegrees(rectangleSE_long, rectangleSE_lat);
    WindowCoordsRectSE = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, RectSECartesian3);

    // get the with and height of the rectangle in window coords
    WindowCoordsRectWidth = (WindowCoordsRectNE.x - WindowCoordsRectNW.x);
    WindowCoordsRectHeight = (WindowCoordsRectSE.y - WindowCoordsRectNW.y);
    // Round to the nearest integer for DrillPick
    WindowCoordsRectWidth = Math.round(WindowCoordsRectWidth);
    WindowCoordsRectHeight = Math.round(WindowCoordsRectHeight);

    // Drill pick via the rectangle
    pickedObjects = drillPick(WindowCoordsRectCenter, null, WindowCoordsRectWidth, WindowCoordsRectHeight);

    //show export menu
    if (Cesium.defined(pickedObjects)) {
        showMenu(WindowCoordsRectSE.x, WindowCoordsRectSE.y, "exportMenu");
    }
    ////////end added code/////////////////////////////////////////////////
}



// end Rectangle and double-click selection

function hideRectangleAndMenu(){
    selector.show = false;
    shapeEditMenu.style.display = "none";
    shapeAddRouteNameMenu.style.display = "none";
}

// function for drill pick
function drillPick(windowPosition, limit = null, width= null, height= null){
    var scene = viewer.scene;
    return scene.drillPick(windowPosition, limit, width, height);
}

// end functions to add a datasource