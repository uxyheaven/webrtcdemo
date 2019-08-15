
<template>
  <div class="record-page" style="margin-bottom: 15px;">
    <div>4</div>
    <div>
      格式
      <select name="mimeType" v-model="mimeType">
        <option
          :value="item.name"
          v-for="item in mimeTypeList()"
          v-bind:key="item.name"
        >{{item.name}}</option>
      </select>
    </div>
    <div>
      规格
      <select name="specification" v-model="specification">
        <option
          :value="item"
          v-for="item in specificationList()"
          v-bind:key="item.name"
        >{{item.name}}</option>
      </select>
    </div>
    <div>
      <button @click="onStartRecording" :disabled="videoStart">start</button>
      <button @click="onStopRecording" :disabled="!videoStart">stop</button>
      <button @click="onSave">save</button>
      <button @click="onScreenshot">screenshot</button>
    </div>

    <video class="video" autoplay playsinline ref="video"></video>
    <div>duration: {{duration}}ms</div>
    <div>size: {{size}}</div>
    <canvas class="video" ref="canvas"></canvas>
  </div>
</template>
 
<script>
/* eslint-disable no-console */
import RecordRTC from 'recordrtc';
import VConsole from 'vconsole';
let vConsole = new VConsole();

// 视频类型
let mimeTypeList = [
  { name: 'video/webm' },
  { name: 'video/webm;codecs=vp9' },
  { name: 'video/webm;codecs=vp8' },
  { name: 'video/webm;codecs=h264' }, // 建议这个兼容性最好
  { name: 'video/x-matroska;codecs=avc1' },
  { name: 'video/mpeg' },
  { name: 'video/mp4' },
];

// 预设视频参数
let specificationList = [
  {
    name: '240p',
    size: {
      width: 240,
      height: 320,
    },
    video: 576 * 1024,
    audio: 64 * 1024,
  },
  {
    name: '360p',
    size: {
      width: 480,
      height: 360,
    },
    video: 704 * 1024,
    audio: 64 * 1024,
  },
];

export default {
  data() {
    return {
      video: null,
      videoStart: false,
      recorder: null,
      size: null, // 文件体积
      duration: 5000, // 拍摄时间, 单位ms

      mimeType: null, // 媒体格式
      specification: null, // 视频规格
    };
  },
  created() {},
  mounted() {
    this.video = this.$refs.video;
    this.mimeType = mimeTypeList[0].name;
    this.specification = specificationList[0];
    if (!this.detectWebRTC()) {
      console.log('不支持webrtc');
    }
  },
  methods: {
    // 监测webrtc
    detectWebRTC() {
      const WEBRTC_CONSTANTS = [
        'RTCPeerConnection',
        'webkitRTCPeerConnection',
        'mozRTCPeerConnection',
        'RTCIceGatherer',
      ];

      const isWebRTCSupported = WEBRTC_CONSTANTS.find(item => {
        return item in window;
      });

      const isGetUserMediaSupported =
        navigator &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia;

      if (
        !isWebRTCSupported ||
        typeof isGetUserMediaSupported === 'undefined'
      ) {
        return false;
      }

      return true;
    },
    // 获取摄像头
    captureCamera() {
      return navigator.mediaDevices.getUserMedia(this.userMediaOptions());
    },
    stopRecordingCallback(recording) {
      this.video.src = this.video.srcObject = null;
      try {
        // URL.createObjectURL 已经过期
        console.log(recording);
        this.video.src = recording;
        // window.open(URL.createObjectURL(this.recorder.getBlob()));
      } catch (error) {
        console.log(error);
      }

      this.size = RecordRTC.bytesToSize(this.recorder.getBlob().size);

      this.recorder.stream.stop();
      this.recorder.destroy();
      // this.recorder = null;
    },
    onStartRecording() {
      console.log(`video: ${this.video}`);
      this.videoStart = true;
      let that = this;
      this.captureCamera()
        .then(function(stream) {
          that.recorder = RecordRTC(stream, that.rtcOptions());
          that.recorder.stream = stream;
          that.video.srcObject = stream;
          that.recorder
            .setRecordingDuration(that.duration)
            .onRecordingStopped(that.onStopRecording);
          that.recorder.startRecording();
        })
        .catch(error => {
          console.log(error);
        });
    },
    onStopRecording() {
      this.videoStart = false;
      this.recorder.stopRecording(this.stopRecordingCallback);
    },
    onSave() {
      RecordRTC.invokeSaveAsDialog(
        this.recorder.getBlob(),
        `RecordRTC_${new Date().getTime()}.webm`,
      );
    },
    onScreenshot() {
      let ctx = this.$refs.canvas.getContext('2d');
      ctx.drawImage(
        this.video,
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height,
      );
      // let base64 = this.$refs.canvas.toDataURL('images/png');
    },
    mimeTypeList() {
      return mimeTypeList;
    },
    specificationList() {
      return specificationList;
    },
    rtcOptions() {
      return {
        type: 'video',
        // 流媒体MediaStreamRecorder, 立体声StereoAudioRecorder, WebAssemblyRecorder,
        // CanvasRecorder, GifRecorder, WhammyRecorder
        recorderType: RecordRTC.MediaStreamRecorder,
        mimeType: this.mimeType, // 格式
        audioBitsPerSecond: 64 * 1024, // 音频码率, default 256 * 8 * 1024
        videoBitsPerSecond: 576 * 1024, // 视频码率, default 256 * 8 * 1024
        timeSlice: 3.6e6, // 获取blobs的时间间隔, 单位ms, default 3.6e+6
        // getNativeBlob: true,
        // 以下属性不是对所有的 Recorder都有效
        // frameInterval: 10, // 绘制的间隔(CanvasRecorder / WhammyRecorder), default 10
        // numberOfAudioChannels: 1, // 声道(StereoAudioRecorder), default 2
      };
    },
    userMediaOptions() {
      return {
        video: {
          width: 240,
          height: 320,
          frameRate: 10, // 帧率
        },
        audio: {
          channelCount: 1, // 声道
          sampleRate: 64 * 1024, // 采样率
          sampleSize: 16, // 采样位数
        },
      }; // 细节查看 MediaTrackConstraints
    },
  },
};
</script>
<style scoped>
.video {
  width: 100%;
  border: 1px solid;
}
</style>