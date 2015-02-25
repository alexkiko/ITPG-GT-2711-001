var faceX = 0;
var faceY = 0;

'use strict';

// fullscreen kiosk mode
// chrome.windows.getCurrent(null, function(win) {
//     chrome.windows.update(win.id, {state: 'fullscreen'});
// });

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

var CameraApp = {
    /**
     * Instantiate the Camera object.
     */
    init: function()
    {
        // camera = new Camera();
        // camera.startCapture(this.onCameraReady.bind(this), this.onCameraError);

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

        $('#smiley').css({
            'z-index':'10'
        });

        tracker.on('track', function(event) {

            event.data.forEach(function(face) {
                faceX = face.x - 210/2;
                faceY = face.y - 130/2;
                $('#smiley img').css({
                    'left':face.x + $('#video').offset().left,
                    'top':face.y + $('#video').offset().top,
                    'width':face.width,
                    'height':face.height
                });
            });

        });
    },

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

// THREE
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;

var mesh, group1, group2, group3, light;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1800;

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    // shadow

    var canvas = document.createElement( 'canvas' );
    canvas.width = 128;
    canvas.height = 128;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
    gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    var shadowTexture = new THREE.Texture( canvas );
    shadowTexture.needsUpdate = true;

    var shadowMaterial = new THREE.MeshBasicMaterial( { map: shadowTexture } );
    var shadowGeo = new THREE.PlaneBufferGeometry( 300, 300, 1, 1 );

    mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
    mesh.position.y = - 250;
    mesh.rotation.x = - Math.PI / 2;
    scene.add( mesh );

    mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
    mesh.position.y = - 250;
    mesh.position.x = - 400;
    mesh.rotation.x = - Math.PI / 2;
    scene.add( mesh );

    mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
    mesh.position.y = - 250;
    mesh.position.x = 400;
    mesh.rotation.x = - Math.PI / 2;
    scene.add( mesh );

    var faceIndices = [ 'a', 'b', 'c', 'd' ];

    var color, f, f2, f3, p, n, vertexIndex,

        radius = 200,

        geometry  = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry2 = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry3 = new THREE.IcosahedronGeometry( radius, 1 );

    for ( var i = 0; i < geometry.faces.length; i ++ ) {

        f  = geometry.faces[ i ];
        f2 = geometry2.faces[ i ];
        f3 = geometry3.faces[ i ];

        n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        for( var j = 0; j < n; j++ ) {

            vertexIndex = f[ faceIndices[ j ] ];

            p = geometry.vertices[ vertexIndex ];

            color = new THREE.Color( 0xffffff );
            color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );

            f.vertexColors[ j ] = color;

            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.0, ( p.y / radius + 1 ) / 2, 0.5 );

            f2.vertexColors[ j ] = color;

            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.125 * vertexIndex/geometry.vertices.length, 1.0, 0.5 );

            f3.vertexColors[ j ] = color;

        }

    }


    var materials = [

        new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
        new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )

    ];

    group1 = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    group1.position.x = -400;
    group1.rotation.x = -1.87;
    scene.add( group1 );

    group2 = THREE.SceneUtils.createMultiMaterialObject( geometry2, materials );
    group2.position.x = 400;
    group2.rotation.x = 0;
    scene.add( group2 );

    group3 = THREE.SceneUtils.createMultiMaterialObject( geometry3, materials );
    group3.position.x = 0;
    group3.rotation.x = 0;
    scene.add( group3 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}

//

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {
    console.log(faceX);
    console.log(faceY);

    camera.position.x += ( faceX * 10 - camera.position.x ) * 0.05;
    camera.position.y += ( faceY  * 10 - camera.position.y ) * 0.05;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}
