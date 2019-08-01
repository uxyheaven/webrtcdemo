<template>
  <div class="record-page" style="margin-bottom: 15px;">
    <button @click="onStartRecording" :disabled="videoStart">start</button>
    <button @click="onStopRecording" :disabled="!videoStart">stop</button>
    <button @click="onSave">save</button>
    <video class="video" autoplay playsinline ref="video"></video>
    <div>duration: {{duration}}ms</div>
    <div>size: {{size}}</div>
    <!-- <div>
      <label for="sel">格式:</label>
      <select name id="sel">
        <option value="video/webm;codecs=vp9">video/webm;codecs=vp9</option>
        <option value="video/webm;codecs=vp8">video/webm;codecs=vp8</option>
        <option value="video/webm;codecs=h264" selected>video/webm;codecs=h264</option>
        <option value="video/x-matroska;codecs=avc1">video/x-matroska;codecs=avc1</option>
        <option value="video/mpeg">video/mpeg</option>
        <option value="video/mp4">video/mp4</option>
      </select>
    </div>-->
  </div>
</template>
 
<script>
import RecordRTC from 'recordrtc';
import VConsole from 'vconsole';
let vConsole = new VConsole();

export default {
  data() {
    return {
      video: null,
      videoStart: false,
      recorder: null,
      size: '', // 文件体积
      duration: 5000, // 拍摄时间, 单位ms
      userMediaOptions: {
        video: {
          width: 360,
          height: 480,
          frameRate: 10, // 帧率
        },
        audio: {
          channelCount: 1, // 声道
          sampleRate: 64 * 1024, // 采样率
          sampleSize: 16, // 采样位数
        },
      }, // 细节查看 MediaTrackConstraints
      rtcOptions: {
        type: 'video',
        mimeType: `video/mpeg`, // 格式
        audioBitsPerSecond: 64 * 1024, // 音频码率, default 256 * 8 * 1024
        videoBitsPerSecond: 896 * 1024, // 视频码率, default 256 * 8 * 1024
        frameInterval: 10, // 绘制的间隔, default 10
        numberOfAudioChannels: 1, // 声道, default 2
        getNativeBlob: false,
      },
    };
  },
  created() {},
  mounted() {
    this.video = this.$refs.video;
  },
  methods: {
    captureCamera(callback) {
      navigator.mediaDevices
        .getUserMedia(this.userMediaOptions)
        .then(function(camera) {
          callback(camera);
        })
        .catch(error => {
          this.$message.error('未找到视频设备');
        });
    },
    stopRecordingCallback() {
      this.video.src = this.video.srcObject = null;
      this.video.muted = false;
      this.video.volume = 1;
      this.video.src = URL.createObjectURL(this.recorder.getBlob());
      // window.open(URL.createObjectURL(this.recorder.getBlob()));
      this.size = RecordRTC.bytesToSize(this.recorder.getBlob().size);

      this.recorder.camera.stop();
      // this.recorder.destroy();
      // this.recorder = null;
    },
    onStartRecording() {
      console.log(`video: ${this.video}`);
      this.videoStart = true;
      this.captureCamera(camera => {
        this.video.muted = true;
        this.video.volume = 0;
        this.video.srcObject = camera;
        // RecordRTC 换成 MediaStreamRecorder 也可以?
        this.recorder = RecordRTC(camera, this.rtcOptions);
        this.recorder.startRecording();
        // release camera on stopRecording
        this.recorder.camera = camera;
        setTimeout(() => {
          if (!this.videoStart) {
            return;
          }
          this.onStopRecording();
        }, this.duration);
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
  },
};
</script>
<style scoped>
.video {
  width: 100%;
  border: 1px solid;
}
</style>