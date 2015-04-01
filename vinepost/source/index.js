var exec = require('child_process').exec;
var Vineapple = require('vineapple');

$(document).ready(function() {
    // prevent default behavior from changing page on dropped file
    window.ondragover = function(e) { e.preventDefault(); return false };
    window.ondrop = function(e) { e.preventDefault(); return false };

    var holder = document.getElementById('holder');
    holder.ondragover = function () { this.className = 'hover'; return false; };
    holder.ondragleave = function () { this.className = ''; return false; };
    holder.ondragend = function () { this.className = ''; return false; };
    holder.ondrop = function (e) {
        e.preventDefault();

        for (var i = 0; i < e.dataTransfer.files.length; ++i) {
            console.log(e.dataTransfer.files[i].path);
            POSTVINE.videoPath = e.dataTransfer.files[i].path;
            holder.innerHTML = getFileName(e.dataTransfer.files[i].path);
            POSTVINE.fileName = getFileName(e.dataTransfer.files[i].path);
        }

        POSTVINE.enableTranscode();

        return false;
    };

    $('input').bind('focus', function(e){
        $(this).removeClass('error');
    });

    $('button#reload').bind('click', function(e){
        document.location.reload();
    });

});

var POSTVINE = {
    
    fileName: "",
    videoPath: "",
    vineThumbPath: "",
    vineVideoPath: "",    

    enableTranscode: function() {
        POSTVINE.hideModal();
        $('button#transcode').addClass('active');
        $('button#transcode').bind('click', function(e){
            POSTVINE.transcode(POSTVINE.videoPath);
        });
    },

    enablePostToVine: function() {
        POSTVINE.hideModal();
        $('button#submit').addClass('active');
        $('button#submit').bind('click', function(e){
            var err = 0;

            $('input').each(function(i,input){
                if ( $(this).val().length < 4 ) {
                    $(this).addClass('error');
                    err++;
                }
            });

            if ( err == 0 ) {
                POSTVINE.postToVine($('input#username').val(), $('input#password').val(), $('input#caption').val());
            }
        });
    },

    transcode: function(filePath) {      
        POSTVINE.showModal("transcoding video...");
        // transcode the video for vine +6 seconds from beginning, 30 fps, 480x480 pixels, 1000k bitrate
        var fileNameRoot = POSTVINE.fileName.split(".")[0];
        POSTVINE.vineVideoPath = './media/'+fileNameRoot+'.mp4';
        POSTVINE.vineThumbPath = './media/'+fileNameRoot+'.jpg';

        var child = exec('/usr/local/bin/ffmpeg -i '+POSTVINE.videoPath+' -i ./media/silence-10sec.mp3 -r 30 -ss 0 -t 6 -vf "crop=ih:ih:(iw-ih)/2:ih, scale=480:480" -b:v 1000k -bufsize 1000k -vcodec h264 -y '+POSTVINE.vineVideoPath, function (error, stdout, stderr) {
            console.log('stdout: '+stdout);
            console.log('stderr: '+stderr);
            if (error) {
                console.log("!================");
                console.log('exec error video: '+error);
                POSTVINE.showModal("Video Transcoding Error!");
            }
            else {
                POSTVINE.generatePoster();
            }
        });
    },

    generatePoster: function() {
        POSTVINE.showModal("generating poster image...");
        var childVThumb = exec('/usr/local/bin/ffmpeg  -itsoffset -4  -i '+POSTVINE.vineVideoPath+' -vcodec mjpeg -vframes 1 -an -f rawvideo -s 480x480 -y '+POSTVINE.vineThumbPath, function (error, stdout, stderr) {
            console.log('stdout: '+stdout);
            console.log('stderr: '+stderr);

            if (error) {
                console.log("!================");
                console.log('exec error poster: '+error);
                POSTVINE.showModal("Poster Generation Error!");
            }
            else {
                POSTVINE.enablePostToVine();
            }
        });
    },

    vinePost: function(_client, _thumbPath, _videoPath, _caption, _locationId, callback) {

        console.log('attempting to upload a new vine');
        POSTVINE.showModal("uploading...");

        var opts = {
            thumbnail: _thumbPath,
            video: _videoPath,
            desc: _caption
        };
        if (_locationId) opts.location_id = _locationId;
        _client.post(opts, callback);
    },

    postToVine: function(userEmail, userPassword, caption) {

        console.log('attempting to authenticate with vine');
        POSTVINE.showModal("authenticating...");

        var vine = new Vineapple();
        vine.login(userEmail, userPassword, function (error, client) {
            if (error) {
                console.log('Vine Auth', error, client);
                POSTVINE.reset("Authentication Error!");
            }
            else {
                POSTVINE.showModal("waiting 10 sec before uploading...");
                setTimeout(function() {
                    POSTVINE.vinePost(vine, POSTVINE.vineThumbPath, POSTVINE.vineVideoPath, caption, null, POSTVINE.postToVineCallback);
                }, 10500);
            }
        });
    },

    postToVineCallback: function(res, body) {
        console.log(res);
        console.log(body);
        POSTVINE.showModal("Done!", true);
    },

    showModal: function(message, reset) {
        POSTVINE.hideModal();

        $('#modal span').html(message);

        if (reset) {
            $('#modal button').bind('click', function(e){
                document.location.reload();
            });
            $('#modal button').show();
        }

        $('#modal').show();
    },

    hideModal: function() {
        $('#modal span').html('');
        $('#modal button').hide();
        $('#modal').hide();
    }

}

function getFileName(fullPath) {
    var fSlash = fullPath.lastIndexOf("/");
    var bSlash = fullPath.lastIndexOf("\\");
    var slashIndex = fSlash > bSlash ? fSlash : bSlash;
    return fullPath.substr(slashIndex + 1);
}