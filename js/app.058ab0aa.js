(function(e){function t(t){for(var r,a,c=t[0],s=t[1],d=t[2],l=0,v=[];l<c.length;l++)a=c[l],n[a]&&v.push(n[a][0]),n[a]=0;for(r in s)Object.prototype.hasOwnProperty.call(s,r)&&(e[r]=s[r]);u&&u(t);while(v.length)v.shift()();return i.push.apply(i,d||[]),o()}function o(){for(var e,t=0;t<i.length;t++){for(var o=i[t],r=!0,c=1;c<o.length;c++){var s=o[c];0!==n[s]&&(r=!1)}r&&(i.splice(t--,1),e=a(a.s=o[0]))}return e}var r={},n={app:0},i=[];function a(t){if(r[t])return r[t].exports;var o=r[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,a),o.l=!0,o.exports}a.m=e,a.c=r,a.d=function(e,t,o){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(a.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(o,r,function(t){return e[t]}.bind(null,r));return o},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],s=c.push.bind(c);c.push=t,c=c.slice();for(var d=0;d<c.length;d++)t(c[d]);var u=s;i.push([0,"chunk-vendors"]),o()})({0:function(e,t,o){e.exports=o("56d7")},"375f":function(e,t,o){"use strict";var r=o("5d67"),n=o.n(r);n.a},"56d7":function(e,t,o){"use strict";o.r(t);o("cadf"),o("551c"),o("f751"),o("097d");var r=o("2b0e"),n=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("div",{staticClass:"record-page",staticStyle:{"margin-bottom":"15px"}},[o("button",{attrs:{disabled:e.videoStart},on:{click:e.onStartRecording}},[e._v("start")]),o("button",{attrs:{disabled:!e.videoStart},on:{click:e.onStopRecording}},[e._v("stop")]),o("button",{on:{click:e.onSave}},[e._v("save")]),o("button",{on:{click:e.onScreenshot}},[e._v("screenshot")]),o("video",{ref:"video",staticClass:"video",attrs:{autoplay:"",playsinline:""}}),o("div",[e._v("duration: "+e._s(e.duration)+"ms")]),o("div",[e._v("size: "+e._s(e.size))]),o("canvas",{ref:"canvas",staticClass:"video"})])},i=[],a=o("a9ee"),c=o.n(a),s=o("3a34"),d=o.n(s),u=(new d.a,{data:function(){return{video:null,videoStart:!1,recorder:null,size:"",duration:5e3,userMediaOptions:{video:{width:360,height:480,frameRate:10},audio:{channelCount:1,sampleRate:65536,sampleSize:16}},rtcOptions:{type:"video",recorderType:c.a.MediaStreamRecorder,mimeType:"video/mpeg",audioBitsPerSecond:65536,videoBitsPerSecond:917504,timeSlice:36e5}}},created:function(){},mounted:function(){this.video=this.$refs.video},methods:{captureCamera:function(e){var t=this;navigator.mediaDevices.getUserMedia(this.userMediaOptions).then(function(t){e(t)}).catch(function(e){t.$message.error("未找到视频设备")})},stopRecordingCallback:function(){this.video.src=this.video.srcObject=null,this.video.muted=!1,this.video.volume=1,this.video.src=URL.createObjectURL(this.recorder.getBlob()),this.size=c.a.bytesToSize(this.recorder.getBlob().size),this.recorder.camera.stop()},onStartRecording:function(){var e=this;console.log("video: ".concat(this.video)),this.videoStart=!0,this.captureCamera(function(t){e.video.muted=!0,e.video.volume=0,e.video.srcObject=t,e.recorder=c()(t,e.rtcOptions),e.recorder.startRecording(),e.recorder.camera=t,setTimeout(function(){e.videoStart&&e.onStopRecording()},e.duration)})},onStopRecording:function(){this.videoStart=!1,this.recorder.stopRecording(this.stopRecordingCallback)},onSave:function(){c.a.invokeSaveAsDialog(this.recorder.getBlob(),"RecordRTC_".concat((new Date).getTime(),".webm"))},onScreenshot:function(){var e=this.$refs.canvas.getContext("2d");e.drawImage(this.video,0,0,this.$refs.canvas.width,this.$refs.canvas.height)}}}),l=u,v=(o("375f"),o("2877")),f=Object(v["a"])(l,n,i,!1,null,"0a2790d0",null),p=f.exports;r["a"].config.productionTip=!1,new r["a"]({render:function(e){return e(p)}}).$mount("#app")},"5d67":function(e,t,o){}});
//# sourceMappingURL=app.058ab0aa.js.map