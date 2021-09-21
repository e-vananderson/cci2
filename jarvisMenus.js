/*
Written by Stanton Martin and Daniel Hopp.
 */

function switchinputmodes(){
    if (mode =="voice"){
        document.getElementById("catalogue").classList.toggle("Show");
        document.getElementById("ShowMeTheWorld").innerHTML = "<label id=\"googleUser\">" + response + "</label><button id=\"inputmode\" onClick=\"switchinputmodes('Voice')\">Use Voice </button>";
        if (!response) {
            document.getElementById("googleUser").style.display = "none";
        }
    mode="menu";
    commander.stop();
    }
    else{
        let label = '<label id="googleUser">' + response + '</label>';
        let textbox ='<input id="ShowWorld" type="text" size = "50" value="Typed or spoken commands for Jarvis are shown here"></input>'

        document.getElementById("ShowMeTheWorld").innerHTML = label + textbox + "<button id=\"inputmode\" onClick=\"switchinputmodes('Menus')\">Use Menus </button>";
        if (!response) {
            document.getElementById("googleUser").style.display = "none";
        }
        voiceControlEventListener();
        mode="voice"
        voicecommand();
    }
}

// Function for menu show and design
function showMenu(WindowCoordsRectX, WindowCoordsRectY, elementName){
    var shapeEditMenu = document.getElementById(elementName);
    if (shapeEditMenu.style.display === "none") {
        shapeEditMenu.style.display = "block";
    } else {
        shapeEditMenu.style.display = "none";
    }
    shapeEditMenu.style.left = WindowCoordsRectX + 'px';
    shapeEditMenu.style.top = WindowCoordsRectY + 'px';
    shapeEditMenu.style.background = 'rgba(42, 42, 42, 0.8)';
    shapeEditMenu.style.border = '1px solid #888';
}