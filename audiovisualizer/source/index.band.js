var context;
var source;
var analyser;
var buffer;
var audioBuffer;

var javascriptNode;
var sourceNode;

var fierceMode;

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
  var processor = context.createScriptProcessor(2048, 2, 2);
  // javascriptNode.connect(context.destination);
  processor.onaudioprocess = updateSpectrum;

  // var mediaStreamSource = context.createMediaStreamSource(stream);
  var channels = 2;
  var frameCount = context.sampleRate * 2.0;
  var audio = context.createBuffer(channels, frameCount, context.sampleRate);
  var source = context.createMediaStreamSource(stream);
  source.buffer = audio;
  // source.noteOn(0.0);
  source.connect(processor);
  processor.connect(context.destination);
}

function disco(){
    var _random = Math.floor(Math.random()*colors.length);
    var _color = colors[_random];
    changeAmbientColor(_color.ambient);
    changeDiffuseColor(_color.diffuse);
    //
    // if( fierceMode ) {
    //   fierceMode = false;
    // }
    // else {
    //   fierceMode = true;
    // }
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

var bands = [
  new Biquad(100.0, 1.0),
  new Biquad(220.0, 1.0),
  new Biquad(640.0, 1.0),
  new Biquad(2560.0, 1.0),
  new Biquad(10240.0, 1.0)
];

function updateSpectrum(ev) {
  var fb = ev.inputBuffer;
  var outb = ev.outputBuffer;
  var sumsq = [0.0, 0.0, 0.0, 0.0, 0.0];
  var inputL = fb.getChannelData(0);
  var inputR = fb.getChannelData(1);
  var outputL = outb.getChannelData(0);
  var outputR = outb.getChannelData(1);

  for (var i = 0; i < inputL.length; ++i) {
    /* average to get mono channel */
    var center = (inputL[i] + inputR[i])/2.0;

    /* copy to output */
    outputL[i] = inputL[i];
    outputR[i] = outputR[i];

    /* feed to bp filters */
    for (var j = 0; j < 5; ++j) {
      var out = bands[j].next(outputL[i]);
      sumsq[j] += out*out;
    }
  }

  for (var i = 0; i < 5; ++i) { 
    /* calculate rms amplitude */
    var rms = Math.sqrt(sumsq[i] / inputL.length);

    /* update bar */
    var db = Math.log(rms) / Math.log(2.0);
    // var length = 450 + 10.0*db;
    // if (length < 1) {
    //   length = 1;
    // }
    // var bar = document.getElementById("bar" + i);
    // bar.style.width = length + "px";

    var val = Math.ceil(16 + db)/16;
    // var val = db;

    switch(i) {
      case 0:
        // console.log("100hz val = " + val);
        MESH.xRange = val;
        break;
      case 1:
        console.log("220hz val = " + val);
        MESH.yRange = val*1;
        break;
      case 2:
        MESH.depth = val*50;
        break;
      case 3:
        LIGHT.zOffset = val*200;
        break;
      case 4:
        // console.log("10240hz = " + db);
        break;
    }
  }
}

function playVideo() {

}


function init() {
  initializeShader();
  getUserMedia({audio:true}, gotStream);
  document.querySelector("body").style.cursor = "none";
}

window.onload = init;

var context;
var analyser;

var javascriptNode;

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
  analyser.smoothingTimeConstant = 0.96;
  analyser.fftSize = 2048;

  // Create an AudioNode from the stream.
  var mediaStreamSource = context.createMediaStreamSource(stream);    
  mediaStreamSource.connect(analyser);
  analyser.connect(context.destination);
}

function drawSpectrum(data) {

  var frequencyBands = 16;

  // Break the samples up into bins
  var bin_size = Math.floor(data.length / frequencyBands);
  for (var i=0; i < frequencyBands; i++) {
    var sum = 0;
    for (var j=0; j < bin_size; ++j) {
      sum += data[(i * bin_size) + j];
    }

    // Calculate the average frequency of the samples in the bin
    var average = sum / bin_size;

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
          if ( average <= 0 )
          var val = (average / 64);
          MESH.depth = 10 + val*50;
      }
    }

    // else {
    //   switch( i ) {
    //     case 0:
    //       if ( average > 0 ) {
    //         val = (average / 64);
    //         MESH.yRange = val*1;
    //       }
    //     case 1:
    //       if ( average > 0 ) {
    //         val = (average / 64);
    //         MESH.xRange = val*1;
    //       }
    //     case 2:
    //       if ( average > 0 ) {
    //         val = (average );
    //         MESH.depth = (val*100)+1000;            
    //       }
    //     case 3:
    //       if ( average > 0 ) {
    //         val = (average / 256);
    //         LIGHT.zOffset = 0+(val*250);
    //       }
    //   }
    // }
    
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