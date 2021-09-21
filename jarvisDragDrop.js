/*
Base code from Cesium Sandcastle.
 */

///// FROM VERY FIRST VERSION OF JARVISDRAGDROP ////////////////
//let droparea = document.getElementById('cesiumContainer')
//dropArea.addEventListener('dragenter', handlerFunction, false)
//dropArea.addEventListener('dragleave', handlerFunction, false)
//dropArea.addEventListener('dragover', handlerFunction, false)
//dropArea.addEventListener('drop', handlerFunction, false)
//////////////////////////////////////////////////////////////////

//var viewer = new Cesium.Viewer("cesiumContainer");  // ORIGINAL CESIUM VIEWER


// ADDED FOR SIMPLE GEOJSON UPLOAD EXPERIEMENT ///////////////////
var viewer = new Cesium.Viewer("cesiumContainer", {
    sceneMode: Cesium.SceneMode.SCENE2D,
    timeline: false,
    animation: false,
});
var dataSource = Cesium.GeoJsonDataSource.load(
    "clean_esri.geojson"
);
viewer.dataSources.add(dataSource);
viewer.zoomTo(dataSource);
///////////////////////////////////////////////////


/*  LEFT OVER FROM THE RECTANGLE'S CODE//////////
viewer.scene.debugShowFramesPerSecond = true;
viewer.scene.screenSpaceCameraController.enableTranslate = false;
viewer.scene.screenSpaceCameraController.enableTilt = false;
viewer.scene.screenSpaceCameraController.enableLook = false;
//viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
*/ /////END LEFT OVER FROM THE RECTANGLE'S CODE/////////


////////DRAG AND DROP MIXIN////////////////////////////
//  from https://cesium.com/docs/cesiumjs-ref-doc/viewerDragDropMixin.html
/*
viewer.extend(Cesium.viewerDragDropMixin);
viewer.flyToOnDrop = false;
//clearOnDrop will remove entities and data sources when a file is dragged and dropped
//viewer.clearOnDrop = false;
viewer.dropError.addEventListener(function(viewerArg, source, error) {
    window.alert('Error processing ' + source + ':' + error);
});
 */
///////////////////////////////////////////////////////


/*
//// DOUBLECLICK TO SELECT A POINT /////////////////////////////////
// https://groups.google.com/g/cesium-dev/c/sfm049HSQgk
var scene = viewer.scene;
var handler;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handler.setInputAction(function(click) {

    /* SINGLE PICK EXPERIEMENT //////////////////////////
    var pickedObject = scene.pick(click.position);
    if (Cesium.defined(pickedObject)) {
        // pickedObject.id will get you the entity.
        // pickedObject.id.id will get you the ID of the entity.
        console.log('The picked objects ID is: ' + pickedObject.id.id);
    }
    */ //////END SINGLE PICK EXPERIEMENT//////////////////////////

    /* // DRILL PICK CODE ///////////////////////////////////////////////////////////
    // Scene.drillPick will get an array of all entities that overlap at the mouse click point
    var pickedObjects = scene.drillPick(click.position);
    //console.log(typeof(pickedObjects));
    if (Cesium.defined(pickedObjects)) {
        console.log('Sucessful If Cesium.defined');
        // pickedObject.id will get the entity.
        // pickedObject.id.id will get the ID of the entity.
        for (var i = 0; i < pickedObjects.length; i++) {
            console.log('For loop: ' + [i]);
            console.log(pickedObjects[i].id.id);
            //console.log(pickedObjects[i].id.id.properties.Latitude._value.toString());
        }


        var selectedstat2 = viewer.selectedEntity;
        console.log('selectedstat2: ' + selectedstat2);
        console.log('doubleclick action: ' + selectedstat2.properties);
        console.log(selectedstat2.properties.Latitude._value.toString());
 ///////////// END DRILL PICK CODE //////////////////////////////////////////


    }
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
///////////END DOUBLECLICK TO SELECT A POINT/////////////////////////////////////////////////////
*/

//////// ENTITY SELECTION ////////////////////////////////////////////////////
viewer.selectedEntityChanged.addEventListener(function () {
    console.log('selectedEntityChanged firing:');
    var selectedstat = viewer.selectedEntity;
    //console.log(selectedstat)
    if (selectedstat) {
        console.log(selectedstat.properties); // ADDED FOR SIMPLE GEOJSON UPLOAD EXPIEREMENT
    } // ADDED FOR SIMPLE GEOJSON UPLOAD EXPERIEMENT
}); // ADDED FOR SIMPLE GEOJSON UPLOAD EXPERIEMENT

    /*
        if (typeof selectedstat.properties.ID != "undefined") {
            selectedStation = document.getElementById("Station").value = selectedstat.properties.ID._value;
        } else if (typeof selectedstat.properties.USAF != "undefined") {
            // This sets the value of a new variable called USAF to the value of a property of the
            // selected Entity (also called USAF)  Note the syntax:
            // selectedstat.properties.{propname}._.value
            var USAF = selectedstat.properties.USAF._value.toString();
            var WBAN = selectedstat.properties.WBAN._value.toString();
            while (WBAN.length < 5) {
                WBAN = "0" + WBAN;
            }
            selectedStation = document.getElementById("Station").value = USAF + WBAN;
        } else if (typeof selectedstat.properties.id != "undefined") {
            selectedStation = document.getElementById("Station").value = selectedstat.properties.id._value;
        }
        //      parent.document.getElementById("selectedStation").innerHTML = '&nbsp; ' + selectedStation;
        document.getElementById("run").style.display = "block";

    } else {
        console.log("No Station Selected")
    }
}
*/
////////////////END ENTITY SELECTION/////////////////////////////////////////////
