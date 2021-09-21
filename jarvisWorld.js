/*
Written by Stanton Martin.
 */

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

if ('SpeechRecognition' in window) {
  console.log("Supported")
} else {
  // speech recognition API not supported
}
const commander = new window.SpeechRecognition();
var mode = 'voice';
var viewer;
var commandtyped;

function voiceControlEventListener() {
  var command = '';
  commandtyped = document.getElementById("ShowWorld");
  commandtyped.addEventListener('keypress', function (e) {
    if (e.key === "Enter") {
      command = document.getElementById("ShowWorld").value;
      jarvisCommand(command);
      console.log("Enter detected");
      mode = 'menu';
      document.getElementById("inputmode").innerHTML = "Use Voice";
      e.key = "";
      commander.stop();
    }
  });
}

function voicecommand() {
  commander.lang = "en-US";
  commander.start();
  commander.onerror = function () {
    console.log(event.error)
    if (event.error == 'no-speech') { ignore_onend = true; }
  }
  commander.audiostart = function () { console.log('Audio Started') }
  commander.onstart = function () { console.log('I am Listening'); }
  commander.onend = function () { console.log('Not listening'); console.log(mode); if (mode == 'voice') { commander.start() } }
  commander.onsoundstart = function () { console.log('Some sound detected') };
  commander.continuous = true;
  commander.onspeechstart = function () { console.log('Now we are talking') };
  voiceControlEventListener();


  
  commander.onresult = function () {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        command = event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    command = command.trim()
    commandtyped.value = command;
    jarvisCommand(command);

  }


  //Note this bracket closes the command loop

  commander.onstop = function () { console.log('We stopped dude'); }
  commander.onspeechend = function () {
    console.log('Speech has stopped being detected')
  }

}
