/*
   SpectrumBox - A JavaScript spectral analyzer.
   Mohit Cheppudira - 0xfe.blogspot.com
*/

/**
  @constructor
  Create an n-point FFT based spectral analyzer.

  @param num_points - Number of points for transform.
  @param num_bins - Number of bins to show on canvas.
  @param canvas_id - Canvas element ID.
  @param audio_context - An AudioContext instance.
*/
SpectrumBox = function(num_points, num_bins, canvas_id, audio_context, type) {
  this.init(num_points, num_bins, canvas_id, audio_context, type);
}

SpectrumBox.Types = {
  FREQUENCY: 1,
  TIME: 2
}

SpectrumBox.prototype.init = function(
    num_points, num_bins,
    canvas_id, audio_context, type) {
  this.num_bins = num_bins;
  this.num_points = num_points;
  this.canvas_id = canvas_id;
  // this.update_rate_ms = 50;
  // this.smoothing = 0.75;
  this.update_rate_ms = 10;
  this.smoothing = 0.67;
  this.type = type || SpectrumBox.Types.FREQUENCY;

  // Number of points we actually want to display. If zero, display all points.
  this.valid_points = 0;

  // Determine the boundaries of the canvas.
  this.canvas = document.getElementById(canvas_id);
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  if (this.type == SpectrumBox.Types.FREQUENCY) {
    this.bar_spacing = 3;
  } else {
    this.bar_spacing = 1;
  }

  this.ctx = this.canvas.getContext('2d');
  this.actx = audio_context;

  // Create the spectral analyzer
  this.fft = this.actx.createAnalyser();
  this.fft.fftSize = this.num_points;
  this.data = new Uint8Array(this.fft.frequencyBinCount);
}

/* Returns the AudioNode of the FFT. You can route signals into this. */
SpectrumBox.prototype.getAudioNode = function() {
  return this.fft;
}

/* Returns the canvas' 2D context. Use this to configure the look
   of the display. */
SpectrumBox.prototype.getCanvasContext = function() {
  return this.ctx;
}

/* Set the number of points to work with. */
SpectrumBox.prototype.setValidPoints = function(points) {
  this.valid_points = points;
  return this;
}

/* Set the domain type for the graph (TIME / FREQUENCY. */
SpectrumBox.prototype.setType = function(type) {
  this.type = type;
  return this;
}

/* Enable the analyzer. Starts drawing stuff on the canvas. */
SpectrumBox.prototype.enable = function() {
  var that = this;
  if (!this.intervalId) {
    this.intervalId = window.setInterval(
        function() { that.update(); }, this.update_rate_ms);
  }
  return this;
}

/* Disable the analyzer. Stops drawing stuff on the canvas. */
SpectrumBox.prototype.disable = function() {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
  return this;
}

/* Updates the canvas display. */
SpectrumBox.prototype.update = function() {
  // Get the frequency samples
  data = this.data;

  if (this.type == SpectrumBox.Types.FREQUENCY) {
    this.fft.smoothingTimeConstant = this.smoothing;
    this.fft.getByteFrequencyData(data);
  } else {
    this.fft.smoothingTimeConstant = 0;
    this.fft.getByteFrequencyData(data);
    this.fft.getByteTimeDomainData(data);
  }

  var length = data.length;
  if (this.valid_points > 0) length = this.valid_points;

  // Clear canvas then redraw graph.
  this.ctx.clearRect(0, 0, this.width, this.height);

  // Break the samples up into bins
  var bin_size = Math.floor(length / this.num_bins);
  for (var i=0; i < this.num_bins; ++i) {
    var sum = 0;
    for (var j=0; j < bin_size; ++j) {
      sum += data[(i * bin_size) + j];
    }

    // Calculate the average frequency of the samples in the bin
    var average = sum / bin_size;

    // Draw the bars on the canvas
    var bar_width = this.width / this.num_bins;
    var bar_height = (average / 256) * this.height;

    // var perc = (average/256)*document.body.clientWidth + 'px';
    // document.getElementById('volumeBar').style.width = perc;

    // if ()

    if (this.type == SpectrumBox.Types.FREQUENCY) {

      if (showBars) {
        this.ctx.fillRect(
          i * bar_width,
          this.height,
          bar_width - this.bar_spacing,
          -bar_height
        );
      }

      // this.ctx.fillRect(
      //   i * bar_width,
      //   this.height - bar_height + 2,
      //   bar_width - this.bar_spacing,
      //   -1
      // );

      var avg = (average/256);

      if ( i > 20 && i < 40 ) {

        if ( avg > 0.15 ) {
          LIGHT.gravity = avg*1000000;
          // LIGHT.zOffset = avg*75;
        }
        else if ( avg > 0.1 ) {
          LIGHT.gravity = avg * 10000;
          // LIGHT.zOffset = avg * 10;
        }
        else {
          LIGHT.gravity = 1000;
          // LIGHT.zOffset = 20;
        }

      }
      
      if ( i > 20 && i < 40 ) {

        MESH.depth = (avg * 25);

      }

      if ( i == 0 ) {
        // console.log(avg)
        
        if ( avg > 0.5 ) {
          MESH.xRange = avg * 0.4
          MESH.yRange = avg * 0.4;
        }
        else {
          MESH.xRange = avg * 0.1;
          MESH.yRange = avg * 0.1;
        }
      }

      // if ( i == 18 ) {

      //   if ( avg > 0.5 ) {
      //     MESH.xRange = avg * 0.8
      //     MESH.yRange = avg * 0.8;
      //   }
      //   else {
      //     MESH.xRange = avg * 0.2;
      //     MESH.yRange = avg * 0.2;
      //   }

      // }

      if ( i == 40) {
        // console.log(avg)
        if ( avg > 0.2 ) {
          LIGHT.zOffset = 50 + avg * 10;
        }
        else if ( avg > 0.1 ) {
          LIGHT.zOffset = 50 + avg * 1;
        }
        // else {
        //   LIGHT.zOffset = avg;
        // }
      }
    }
  }
}
