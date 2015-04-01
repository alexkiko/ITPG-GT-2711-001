// var gui = require('nw.gui');
// var win = gui.Window.get();


var context;
var analyser;

var javascriptNode;

var showBars = false;

document.onkeypress = function (e) {
    e = e || window.event;
    // console.log(e.keyCode);
    if ( e.keyCode == 115 ) {
      if ( showBars ) {
        showBars = false;
      }
      else {
        showBars = true;
      }
    }
    if ( e.keyCode == 102 ) {
      win.toggleFullscreen();
    }
};

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
  // //setup processor node
  // javascriptNode = context.createScriptProcessor(2048, 1, 1);
  // javascriptNode.connect(context.destination);

  // javascriptNode.onaudioprocess = function() {

  //     // get the average for the first channel
  //     var array =  new Uint8Array(analyser.frequencyBinCount);
  //     analyser.getByteFrequencyData(array);

  //     // drawSpectrum(array);

  // }
  initAudio(stream);
}

var frequencybox;
var wavebox;
var audioElement;

function initAudio(stream) {
    
  // analyser = context.createAnalyser();
  // analyser.smoothingTimeConstant = 0.75;
  // analyser.fftSize = 2048;

  // Setup frequency domain graph
  frequencybox = new SpectrumBox(2048, 64, "fftbox", context);
  frequencybox.setValidPoints(500);
  frequencybox.getCanvasContext().fillStyle = "rgb(255, 255, 255)";

  // Setup time domain graph
  wavebox = new SpectrumBox(2048, 1000, "wavebox", context);
  wavebox.setType(SpectrumBox.Types.TIME);
  wavebox.getCanvasContext().fillStyle = "rgb(0, 0, 0)";

  // audioElement = document.getElementById("player");
  // audioElement.addEventListener("canplay", function() {
  //   var source = context.createMediaElementSource(audioElement);
    

  //   // analyser.connect(context.destination);

  //   var wavenode = wavebox.getAudioNode();
  //   var frequencynode = frequencybox.getAudioNode();

  //   source.connect(frequencynode);
  //   frequencynode.connect(wavenode)
  //   wavenode.connect(context.destination);
  // });

  var wavenode = wavebox.getAudioNode();
  var frequencynode = frequencybox.getAudioNode();

  // Create an AudioNode from the stream.
  var mediaStreamSource = context.createMediaStreamSource(stream);    
  mediaStreamSource.connect(frequencynode);

  // source.connect(frequencynode);
  frequencynode.connect(wavenode)
  // wavenode.connect(context.destination);

  // wavebox.enable();
  frequencybox.enable();

  // audioElement.play(); 
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
  getUserMedia({audio:true}, gotStream);
  document.querySelector("body").style.cursor = "none";
  // gotStream();
}

window.onload = init;