<template>
  <div class="record-page" style="margin-bottom: 15px;">
    <button @click="onStartRecording" :disabled="videoStart">start</button>
    <button @click="onStopRecording" :disabled="!videoStart">stop</button>
    <button @click="onSave">save</button>
    <button @click="onScreenshot">screenshot</button>
    <video class="video" autoplay playsinline ref="video"></video>
    <div>duration: {{duration}}ms</div>
    <div>size: {{size}}</div>
    <canvas class="video" ref="canvas"></canvas>
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
        // 流媒体MediaStreamRecorder, 立体声StereoAudioRecorder, WebAssemblyRecorder,
        // CanvasRecorder, GifRecorder, WhammyRecorder
        recorderType: RecordRTC.MediaStreamRecorder,
        mimeType: `video/webm`, // 格式
        audioBitsPerSecond: 64 * 1024, // 音频码率, default 256 * 8 * 1024
        videoBitsPerSecond: 896 * 1024, // 视频码率, default 256 * 8 * 1024
        timeSlice: 3.6e6, // 获取blobs的时间间隔, 单位ms, default 3.6e+6
        // getNativeBlob: true,
        // 以下属性不是对所有的 Recorder都有效
        // frameInterval: 10, // 绘制的间隔(CanvasRecorder / WhammyRecorder), default 10
        // numberOfAudioChannels: 1, // 声道(StereoAudioRecorder), default 2
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

      // this.recorder.camera.stop();
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
  },
};
</script>
<style scoped>
.video {
  width: 100%;
  border: 1px solid;
}
</style>