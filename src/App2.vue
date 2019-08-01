<template>
  <div class="center">
    <div class="settime">还剩：{{sec}} 秒</div>
    <div v-if="finish" class="finish">
      已录制完成！体积{{fileSize}}
      <br />请点击右下角上传，或点击中间按钮重新录制
    </div>
    <div id="recordingPlayer" ref="recordingPlayer">
      <video ref="video"></video>
    </div>
    <button id="btn-start-recording" ref="btnStartRecording" class="play">
      <span :class="platStatus?'stop': 'start'"></span>
    </button>
    <button class="back" @click="$router.back(-1)">返回</button>
    <button id="save-to-disk" ref="saveToDisk" class="save">上传</button>
  </div>
</template>

<script>
import RecordRTC from 'recordrtc';
import { setInterval, clearInterval } from 'timers';
import VConsole from 'vconsole';
let vConsole = new VConsole();
import axios from 'axios';
let fly = require('flyio');

const duration = 3;
export default {
  data() {
    return {
      winWidth: window.innerWidth,
      platStatus: false, //按钮显示‘开始’
      saveVideo: false,
      sec: duration,
      bloburl: '',
      interval: '',
      finish: false,
      fileSize: '',
    };
  },
  created() {},
  mounted() {
    console.log(this.winWidth);
    const that = this;
    let video = this.$refs.video;
    video.controls = false;
    // https://cdn.webrtc-experiment.com/getHTMLMediaElement.js
    let mediaElement = getHTMLMediaElement(video, {
      buttons: ['full-screen', 'take-snapshot'],
      showOnMouseEnter: false,
      width: that.winWidth,
    });
    this.$refs.recordingPlayer.appendChild(video);

    let div = document.createElement('section');
    mediaElement.media.parentNode.appendChild(div);
    div.appendChild(mediaElement.media);

    let recordingPlayer = mediaElement.media;
    let btnStartRecording = this.$refs.btnStartRecording;
    let saveRecording = this.$refs.saveToDisk;
    let mimeType = 'video/webm';
    let fileExtension = 'webm';
    let recorderType = null;
    let type = 'video';
    let videoBitsPerSecond = null;
    let button = btnStartRecording;
    function setVideoURL(arg, forceNonImage) {
      let url = that.getURL(arg);
      console.log(`setVideoURL: ${url}`);
      let parentNode = recordingPlayer.parentNode;
      parentNode.removeChild(recordingPlayer);
      parentNode.innerHTML = '';
      let elem = 'video';
      recordingPlayer = document.createElement(elem);
      if (arg instanceof MediaStream) {
        recordingPlayer.muted = true;
      }
      recordingPlayer.addEventListener(
        'loadedmetadata',
        function() {
          if (navigator.userAgent.toLowerCase().indexOf('android') == -1)
            return;
          // android
          setTimeout(function() {
            if (typeof recordingPlayer.play === 'function') {
              recordingPlayer.play();
            }
          }, 2000);
        },
        false,
      );
      recordingPlayer.poster = '';
      if (arg instanceof MediaStream) {
        recordingPlayer.srcObject = arg;
      } else {
        recordingPlayer.src = url;
      }
      if (typeof recordingPlayer.play === 'function') {
        recordingPlayer.play();
      }

      recordingPlayer.addEventListener('ended', function() {
        url = that.getURL(arg);

        if (arg instanceof MediaStream) {
          recordingPlayer.srcObject = arg;
        } else {
          recordingPlayer.src = url;
        }
      });
      parentNode.appendChild(recordingPlayer);
    }

    button.mediaCapturedCallback = function() {
      console.log('mediaCapturedCallback');

      let options = {
        type: type,
        mimeType: mimeType,
        getNativeBlob: false, // enable it for longer recordings
        video: recordingPlayer,
      };
      options.ignoreMutedMedia = false;
      button.recordRTC = RecordRTC(button.stream, options);
      button.recordingEndedCallback = function(url) {
        setVideoURL(url);
      };
      button.recordRTC.startRecording();
    };
    //初始化
    let commonConfig = {
      onMediaCaptured: function(stream) {
        // that.finish = false;
        button.stream = stream;
        if (button.mediaCapturedCallback) {
          button.mediaCapturedCallback();
        }

        // button.innerHTML = "停止";
        button.disabled = false;
        that.platStatus = true;
        that.interval = setInterval(() => {
          that.sec--;
          if (that.sec <= 0) {
            clearInterval(that.interval);
            btnStartRecording.onclick();
          }
        }, 1000);
      },
      onMediaStopped: function() {
        // button.innerHTML = "开始";
        that.platStatus = false;
        that.sec = duration;
        if (!button.disableStateWaiting) {
          button.disabled = false;
        }
      },
      onMediaCapturingFailed: function(error) {
        console.error('onMediaCapturingFailed:', error);

        if (
          error.toString().indexOf('no audio or video tracks available') !== -1
        ) {
          alert(
            'RecordRTC failed to start because there are no audio or video tracks available.',
          );
        }

        if (DetectRTC.browser.name === 'Safari') return;

        if (
          error.name === 'PermissionDeniedError' &&
          DetectRTC.browser.name === 'Firefox'
        ) {
          alert('Firefox requires version >= 52. Firefox also requires HTTPs.');
        }

        commonConfig.onMediaStopped();
      },
    };

    //调起摄像头
    function captureUserMedia(
      mediaConstraints,
      successCallback,
      errorCallback,
    ) {
      console.log('captureUserMedia');
      if (mediaConstraints.video == true) {
        mediaConstraints.video = {};
      }

      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then(function(stream) {
          successCallback(stream);
          setVideoURL(stream, true);
        })
        .catch(function(error) {
          if (error && error.name === 'ConstraintNotSatisfiedError') {
            alert(
              'Your camera or browser does NOT supports selected resolutions or frame-rates. \n\nPlease select "default" resolutions.',
            );
          }
          errorCallback(error);
        });
    }

    function addStreamStopListener(stream, callback) {
      console.log('addStreamStopListener');
      let streamEndedEvent = 'ended';
      if ('oninactive' in stream) {
        streamEndedEvent = 'inactive';
      }
      stream.addEventListener(
        streamEndedEvent,
        function() {
          callback();
          callback = function() {};
        },
        false,
      );
      stream.getAudioTracks().forEach(function(track) {
        track.addEventListener(
          streamEndedEvent,
          function() {
            callback();
            callback = function() {};
          },
          false,
        );
      });
      stream.getVideoTracks().forEach(function(track) {
        track.addEventListener(
          streamEndedEvent,
          function() {
            callback();
            callback = function() {};
          },
          false,
        );
      });
    }

    function captureAudioPlusVideo(config) {
      that.finish = false;
      console.log(captureAudioPlusVideo);
      captureUserMedia(
        { video: true, audio: true },
        function(audioVideoStream) {
          config.onMediaCaptured(audioVideoStream);
          if (audioVideoStream instanceof Array) {
            audioVideoStream.forEach(function(stream) {
              addStreamStopListener(stream, function() {
                config.onMediaStopped();
              });
            });
            return;
          }
          addStreamStopListener(audioVideoStream, function() {
            config.onMediaStopped();
          });
        },
        function(error) {
          config.onMediaCapturingFailed(error);
        },
      );
    }

    function stopStream() {
      console.log('stopStream');
      if (button.stream && button.stream.stop) {
        button.stream.stop();
        button.stream = null;
      }

      if (button.stream instanceof Array) {
        button.stream.forEach(function(stream) {
          stream.stop();
        });
        button.stream = null;
      }

      videoBitsPerSecond = null;
      let html = 'Recording status: stopped';
      html += '<br>Size: ' + button.recordRTC.getBlob().size;
    }

    function getFileName(fileExtension) {
      let d = new Date().getTime();
      // let year = d.getUTCFullYear();
      // let month = d.getUTCMonth() + 1;
      // let date = d.getUTCDate();
      return 'RecordRTC-' + d + '.' + fileExtension;
    }

    function saveToDiskOrOpenNewTab(recordRTC) {
      let fileName = getFileName(fileExtension);
      saveRecording.onclick = function(event) {
        if (!recordRTC) return alert('No recording found.');
        let file = new File([recordRTC.getBlob()], fileName, {
          type: mimeType,
        });
        console.log(file.size);

        // recordRTC.save('bbb.mp4');

        // const url = recordRTC.toURL();
        // const link = document.createElement('a');
        // link.href = url;
        // link.setAttribute('download', 'aaa.mp4');
        // document.body.appendChild(link);
        // link.click();

        // let data = new FormData();
        // data.append('file', file);
        // data.append('name', 'aaa.mp4');
        // let config = {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // };
        // let headers = {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // };
        // fly.post(
        //   'http://127.0.0.1:3003/api/upload/attachment',
        //   file,
        //   headers,
        // );

        // that.$store.commit("changeAndroidVideo", file);
        // that.$router.back(-1);
        window.open(URL.createObjectURL(file));
        // RecordRTC.invokeSaveAsDialog(file, file.name);
      };
    }
    //操作录像
    btnStartRecording.onclick = function(event) {
      clearInterval(that.interval);
      console.log(that.platStatus);
      if (that.platStatus == true) {
        button.disabled = true;
        button.disableStateWaiting = true;
        setTimeout(function() {
          button.disabled = false;
          button.disableStateWaiting = false;
        }, 2000);
        // button.innerHTML = "开始";
        that.platStatus = false;
        that.saveVideo = true;
        if (button.recordRTC) {
          if (button.recordRTC.length) {
            button.recordRTC[0].stopRecording(function(url) {
              if (!button.recordRTC[1]) {
                button.recordingEndedCallback(url);
                stopStream();
                saveToDiskOrOpenNewTab(button.recordRTC[0]);
                return;
              }
              button.recordRTC[1].stopRecording(function(url) {
                button.recordingEndedCallback(url);
                stopStream();
              });
            });
          } else {
            button.recordRTC.stopRecording(function(url) {
              button.recordingEndedCallback(url);
              saveToDiskOrOpenNewTab(button.recordRTC);
              stopStream();
            });
          }
        }
        return;
      }
      captureAudioPlusVideo(commonConfig);
    };
  },
  methods: {
    getURL: function(arg) {
      console.log(`getURL: ${arg}`);
      let url = arg;
      let str = typeof arg;
      // if(arg instanceof Blob || arg instanceof File) {
      //   url = window.URL.createObjectURL(arg);
      // }
      // if(arg instanceof RecordRTC || arg.getBlob) {
      //   url = window.URL.createObjectURL(arg.getBlob());
      // }
      // if(arg instanceof MediaStream || arg.getTracks || arg.getVideoTracks || arg.getAudioTracks) {
      //     // url = URL.createObjectURL(arg);
      // }
      if (str == 'string') {
        this.finish = true;
      }
      this.bloburl = url;
      return url;
    },
  },
};
</script>
<style scoped>
.play {
  width: 50px;
  height: 50px;
  line-height: 52px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  position: absolute;
  bottom: 20px;
  left: 50%;
  margin-left: -25px;
  /* color: #fff; */
}
.start {
  display: inline-block;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ccc;
  margin-top: 6px;
}
.stop {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 5px;
  background-color: red;
  margin-top: 16px;
}
.save {
  width: 50px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  position: absolute;
  bottom: 25px;
  right: 20px;
}
.back {
  width: 50px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  position: absolute;
  bottom: 25px;
  left: 20px;
}
.settime {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
}
.finish {
  text-align: center;
  margin-top: 100px;
  padding: 20px;
}
</style>