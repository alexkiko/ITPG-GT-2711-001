var context;
var source;
var analyser;
var buffer;
var audioBuffer;

var javascriptNode;
var sourceNode;

var mode = 0;
var depthMultiplier = 2;

var colorIntervalTime;
var colorInterval;

var Biquad = new Cobra.Class({
  __init__: function(self, freq, q) {
    var omega = 2*Math.PI*freq/44100.0;
    var alpha = Math.sin(omega)*(2*q);

    self.b0 = alpha;
    self.b1 = 0.0;
    self.b2 = -alpha;
    self.a0 = 1 + alpha;
    self.a1 = -2*Math.cos(omega);
    self.a2 = 1 - alpha;

    self.y1 = self.y2 = self.x1 = self.x2 = 0.0;
  },

  next: function(self, x) {
    var y = (self.b0 / self.a0)*x + 
      (self.b1 / self.a0)*self.x1 + 
      (self.b2 / self.a0)*self.x2 - 
      (self.a1 / self.a0)*self.y1 - 
      (self.a2 / self.a0)*self.y2;
    self.y2 = self.y1;
    self.y1 = y;
    self.x2 = self.x1;
    self.x1 = x;
    return y;
  }
});

var bands = [
  new Biquad(40.0, 1.0),
  new Biquad(160.0, 1.0),
  new Biquad(640.0, 1.0),
  new Biquad(2560.0, 1.0),
  new Biquad(10240.0, 1.0)
];

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
  //setup processor node
  javascriptNode = context.createScriptProcessor(2048, 1, 1);
  javascriptNode.connect(context.destination);

  javascriptNode.onaudioprocess = function() {

      // get the average for the first channel
      var array =  new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);

      drawSpectrum(array);

  }
  initAudio(stream);
}

function initAudio(stream) {
    
  analyser = context.createAnalyser();
  // analyser.smoothingTimeConstant = .55;
  analyser.fftSize = 2048;

  // Create an AudioNode from the stream.
  var mediaStreamSource = context.createMediaStreamSource(stream);    
  mediaStreamSource.connect(analyser);
  analyser.connect(context.destination);

  // //start colorfade
  // colorIntervalTime = 10000;
  // colorInterval = setInterval('disco()', colorIntervalTime);
}

function disco(){
    var _random = Math.floor(Math.random()*colors.length);
    var _color = colors[_random];
    changeAmbientColor(_color.ambient);
    changeDiffuseColor(_color.diffuse);
    
    if( Math.ceil(Math.random()*5) == 4 ) {
      depthMultiplier = 2;
    }
    else {
      depthMultiplier = 128;
    }

    mode = Math.floor(Math.random()*3);
}

function changeAmbientColor(value) {
  for (i = 0, l = scene.lights.length; i < l; i++) {
    light = scene.lights[i];
    light.ambient.set(value);
    light.ambientHex = light.ambient.format();
  }
}

function changeDiffuseColor(value) {
  for (i = 0, l = scene.lights.length; i < l; i++) {
    light = scene.lights[i];
    light.diffuse.set(value);
    light.diffuseHex = light.diffuse.format();
  }
}

var spectrumData;

function drawSpectrum(data) {

  spectrumData = data;

  // Break the samples up into bins
  var bin_size = Math.floor(data.length / 4);
  for (var i=0; i < 4; i++) {
    var sum = 0;
    for (var j=0; j < bin_size; ++j) {
      sum += data[(i * bin_size) + j];
    }

    // Calculate the average frequency of the samples in the bin
    var average = sum / bin_size;

    // fierceMode = true;
    // depthMultiplier = 2;

    var val;

    if( mode == 0 ) {
      switch ( i ) {
        case 0:
          if ( average > 0 ) {
            if ( average > 80 ) {
              val = (average / 512);
              MESH.xRange = MESH.yRange = val*.5;
            }
            else if ( average > 140 ) {
              val = (average / 256);
              MESH.xRange = MESH.yRange = val*.5;
            }
          }
        case 1:
          if ( average > 0 ) {
            if ( average > 80 ) {
              val = (average / 512);
              MESH.yRange = val*2;
            }
            else if ( average > 120 ) {
              val = (average / 128);
              MESH.yRange = val*2;
            }
          }
        case 2:
          if ( average > 0 ) {
            if ( average > 80 ) {
              val = (average / 512);
              MESH.xRange = val*2;
            }
            else if ( average > 120 ) {
              val = (average / 128);
              MESH.xRange = val*2;
            }
          }
        case 3:
          if ( average > 0 ) {
            var val = (average / 128);
            MESH.depth = 10 + val*50;
          }
      }
    }

    if( mode == 1 ) {
      switch ( i ) {
        case 0:
          if ( average > 80 ) {
            val = (average / 512);
          }
          else if ( average > 140 ) {
            val = (average / 256);
          }
          MESH.xRange = MESH.yRange = val*.5;
        case 1:
          if ( average > 80 ) {
            val = (average / 512);
          }
          else if ( average > 120 ) {
            val = (average / 128);
          }
          MESH.yRange = val*1;
        case 2:
          if ( average > 80 ) {
            val = (average / 512);
          }
          else if ( average > 120 ) {
            val = (average / 128);
          }
          MESH.yRange = val*1;
        case 3:
          if ( average < 0 )
          var val = (average / 64);
          MESH.depth = 10 + val*50;
      }
    }

    else {
      switch( i ) {
        case 0:
          if ( average > 0 ) {
            val = (average / 64);
            MESH.yRange = val*1;
          }
        case 1:
          if ( average > 0 ) {
            val = (average / 64);
            MESH.xRange = val*1;
          }
        case 2:
          if ( average > 0 ) {
            val = (average / depthMultiplier);
            MESH.depth = (val*100)+1000;            
          }
        case 3:
          if ( average > 0 ) {
            val = (average / 256);
            LIGHT.zOffset = 0+(val*250);
          }
      }
    }
    
  }
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
}

window.onload = init;