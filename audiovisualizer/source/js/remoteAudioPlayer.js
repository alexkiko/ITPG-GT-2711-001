RemoteAudioPlayer = function(context, url) {
  this.url = url;
  this.source = context.createBufferSource();
  this.buffer = 0;
  this.context = context;
}

RemoteAudioPlayer.prototype.getSource = function() {
  return this.source;
}

RemoteAudioPlayer.prototype.load = function(callback) {
  var request = new XMLHttpRequest();
  var that = this;
  request.open("GET", this.url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    that.buffer = that.context.createBuffer(2, 22050, 41000);
    that.reload();
    callback(request.response);
  }

  request.send();
}

RemoteAudioPlayer.prototype.reload = function(callback) {
  this.source.buffer = this.buffer;
}