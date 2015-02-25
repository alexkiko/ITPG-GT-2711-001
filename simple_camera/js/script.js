'use strict';

// fullscreen kiosk mode
//chrome.windows.getCurrent(null, function(win) {
   // chrome.windows.update(win.id, {state: 'fullscreen'});
//});

/**
 * CONFIGURABLE SETTINGS
 */

/**
 * width of on-screen 'preview' video in pixels
 */
var cameraWidth = 960;

/**
 * height of on-screen 'preview' video in pixels
 */
var cameraHeight = 720;

/**
 *
 */
var tracker;

/************************************************/

var bw;
var frameNum = 0;
var camera;
var masks;
var started = false;
var CameraApp = {
    /**
     * Instantiate the Camera object.
     */

    init: function()
    {
        // camera = new Camera();
        // camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);

        masks = document.getElementsByClassName('mask');


        tracker = new tracking.ObjectTracker('face');
        tracker.setInitialScale(4);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);

        tracking.track('#video', tracker, { camera: true });

        this.start();



    },

    /**
     * Set a CLICK event listener on the "start" html element. When it is clicked, call the startCamera function
     */
    start: function()
        {

        $('#mode-select > button').click(function(){
            CameraApp.startCamera();
            //$('#mode-select > button').css({'z-index':'8'});
            $('#mode-select > button').hide();

        });



        // if (started == true){
            $('#start').bind('click', function(){
                
            });
        // };

        //execute these functions when the black and white mode is active
        $('#bw').click(function(){
            $('video').css({
                 '-webkit-filter': 'grayscale(1)'
            });
            $('#camera div[id^=mask]').css({
                '-webkit-filter': 'grayscale(1)'
            });

        });

        $('#inverted').click(function(){
            $('video').css({
                 '-webkit-filter': 'invert(1)'
            });
            $('#camera div[id^=mask]').css({
                '-webkit-filter': 'invert(1)'
            });

        });


        $('#comic').click(function(){
            $('video').css({
                '-webkit-filter': 'grayscale(1) contrast(10) brightness(3)'
            });

            $('#camera div[id^=mask]').css({
                '-webkit-filter': 'grayscale(1) contrast(10) brightness(3)'
        });

        });


        $('#school').click(function(){
            $('video').css({
                '-webkit-filter': 'blur(1px) contrast(5.9) sepia(1)'
            });

            $('#camera div[id^=mask]').css({
                '-webkit-filter': 'blur(1px) contrast(5.9) sepia(1)'
        });

        });



    },

    /**
     * If the camera is available and ready, create the "monitor" canvas element and its dimensions
     */
    onCameraReady: function() {
        this.monitor = new CanvasImage($('#monitor'), cameraWidth, cameraHeight);
        $('#monitor').css({
            'min-width': cameraWidth,
            'min-height': cameraHeight
        });
    },

    /**
     * If the camera is not available or ready, attempt to re-connect it
     */
    onCameraError: function() {
        if ( this.onCameraReady) {
            camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);
        }
    },

    /**
     * Call the onNewFrame function, but set the camera mode to be ON before making the call
     */
    startCamera: function() {
        $('#start').hide();
        $('#mode-select').hide();

        this.cameraEnabled = true;
        // this.onNewFrame();

        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        tracker.on('track', function(event) {

            console.log(event.data.length);

            event.data.forEach(function(face,myIndex) {
               var video = document.getElementById("video");
               var masks = document.getElementsByClassName("mask");

                masks[myIndex].style.opacity = "1";
                masks[myIndex].style.top = (face.y + video.offsetTop)+"px";
                masks[myIndex].style.left = (face.x + video.offsetLeft)+"px";
                masks[myIndex].style.width = face.width + "px";
                masks[myIndex].style.height = face.height + "px";



            });


            for(var k = event.data.length; k < 3; k++){
                var masks = document.getElementsByClassName("mask");
                masks[k].style.opacity = 0;
            }

        });
     
     },



//     for (i = 0; i < mask.length; i++) { 
//     text += cars[i] + "<br>";
// }

    /**
     * Call the onNewFrame function, but set the camera mode to be OFF before making the call
     */
    stopCamera: function() {
        this.cameraEnabled = false;
    },

    /**
     * Set the "monitor" html element to receive image data from live camera video and render it
     */
    onNewFrame: function() {
        this.monitor.setImage(camera.video);
        if (this.cameraEnabled) {
            requestAnimationFrame(this.onNewFrame.bind(this));

        }
    }
};

 //---------------my code



//------


/*
* When the html document model is loaded and ready, start the CameraApp's init function
*/
$(document).ready(CameraApp.init.bind(CameraApp));
