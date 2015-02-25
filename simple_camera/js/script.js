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

var camera;
var masks;
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
        $('#start').bind('click', function(){
            CameraApp.startCamera();
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

/*
* When the html document model is loaded and ready, start the CameraApp's init function
*/
$(document).ready(CameraApp.init.bind(CameraApp));
