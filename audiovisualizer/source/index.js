// var gui = require('nw.gui');
// var win = gui.Window.get();


var context;
var analyser;
var frequencybox;
var wavebox;
var audioElement;

var javascriptNode;

var showBars = false;

var audioTracks = [
  "media/jamiexx.mp3",
  "media/oceaan.mp3",
  "media/paradis.mp3"
];

document.onkeypress = function (e) {
    e = e || window.event;
    
    if ( e.keyCode == 98 ) {
      if ( showBars ) {
        showBars = false;
      }
      else {
        showBars = true;
      }
    }
    if ( e.keyCode == 115 ) {

      audioElement.pause();

      loadTrack();

      audioElement.play();

    }
    if ( e.keyCode == 112 ) {
      if ( audioElement.paused ) {
        audioElement.play();
      }
      else {
        audioElement.pause();
      }
    }
};

function loadTrack() {
  audioElement.src = audioTracks[Math.floor(Math.random()*audioTracks.length)];
}

function error() {
  alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
  try {
    navigator.webkitGetUserMedia(dictionary, callback, error);
  } catch (e) {
    alert('webkitGetUserMedia threw exception :' + e);
  }
}

function gotStream(stream) {
  context = new webkitAudioContext();
  initAudio(stream);
}

function initAudio(stream) {

  // Setup frequency domain graph
  frequencybox = new SpectrumBox(2048, 64, "fftbox", context);
  frequencybox.setValidPoints(500);
  frequencybox.getCanvasContext().fillStyle = "rgb(255, 255, 255)";

  // Setup time domain graph
  wavebox = new SpectrumBox(2048, 1000, "wavebox", context);
  wavebox.setType(SpectrumBox.Types.TIME);
  wavebox.getCanvasContext().fillStyle = "rgb(0, 0, 0)";

  audioElement = document.getElementById("player");

  audioElement.addEventListener("canplay", function() {
    var source = context.createMediaElementSource(audioElement);
    var wavenode = wavebox.getAudioNode();
    var frequencynode = frequencybox.getAudioNode();

    source.connect(frequencynode);

    frequencynode.connect(wavenode);
    frequencybox.enable();

    wavenode.connect(context.destination);
    wavebox.enable();
  });

  loadTrack();
  audioElement.play();
}

function animateLight() {
  ox = Math.sin(LIGHT.step[0] * now * LIGHT.speed);
  oy = Math.cos(LIGHT.step[1] * now * LIGHT.speed);
  FSS.Vector3.set(attractor,
    LIGHT.bounds[0]*ox,
    LIGHT.bounds[1]*oy,
    LIGHT.zOffset);
}

function playVideo() {
  
}

function init() {
  initializeShader();
  gotStream();
}

window.onload = init;