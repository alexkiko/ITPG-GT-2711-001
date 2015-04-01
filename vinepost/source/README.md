VinePost
========

Requirements
------------

Install FFMPEG for video encoding. Command line steps:

1. Install GNU Compiler Collection, Clang and Cython
  > $ gcc

  Select "Install" option in dialog alert that pops up.

2. Install Homebrew
  > $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

3. Install WGET via Homebrew
  > $ brew install wget

4. Install FFMPEG via Homebrew

  > $ brew install ffmpeg --with-fdk-aac --with-ffplay --with-frei0r --with-libvo-aacenc --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-opus --with-rtmpdump --with-schroedinger --with-speex --with-theora --with-tools

Installation
------------

The first time launch of the app will most likely be blocked by Mac OSX -- you'll need to allow its operation as such:
- Open System Preferences
- Open Security & Privacy
- Select General tab
- Allow the requested application to run

Operation
---------

1. Transcoding Video

  The source video needs to be at least 6 seconds in length. We have only tested with videos encoded with h.264 / AVC codec, and with AAC audio at 48000hz, stereo.

  Keep in mind that the app currently injects a silent audio track which overrides the source video's audio.

  We were able to successfully post with videos at 24, 30 and 60 fps, as well as 720p and 1080p resolutions.

  The app does include cropping functionality that we built in for Cannes to ensure that uploaded videos will always be 480x480 -- the code should not affect videos coming from the editors even if they are sent at that resolution.


2. Posting to Vine

  Once the video is successfully transcoded, the app will allow posting to Vine. You'll need to authenticate with a Vine account's username and password every time a Vine is posted; unfortunately this is a limitation of the unreleased API at present.

  Another limitation of the the unreleased API is that we need to wait 10 seconds between authentication and actually posting the video. This is baked into the app, and you'll see a modal dialog indicating as much once you click the "POST TO VINE!" button.