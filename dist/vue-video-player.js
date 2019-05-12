!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.VideoBase=t():e.VideoBase=t()}(window,function(){return function(e){var t={};function i(o){if(t[o])return t[o].exports;var A=t[o]={i:o,l:!1,exports:{}};return e[o].call(A.exports,A,A.exports,i),A.l=!0,A.exports}return i.m=e,i.c=t,i.d=function(e,t,o){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(i.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var A in e)i.d(o,A,function(t){return e[t]}.bind(null,A));return o},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/",i(i.s=1)}([function(e,t,i){"use strict";var o,A="object"==typeof Reflect?Reflect:null,n=A&&"function"==typeof A.apply?A.apply:function(e,t,i){return Function.prototype.apply.call(e,t,i)};o=A&&"function"==typeof A.ownKeys?A.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var r=Number.isNaN||function(e){return e!=e};function a(){a.init.call(this)}e.exports=a,a.EventEmitter=a,a.prototype._events=void 0,a.prototype._eventsCount=0,a.prototype._maxListeners=void 0;var s=10;function u(e){return void 0===e._maxListeners?a.defaultMaxListeners:e._maxListeners}function d(e,t,i,o){var A,n,r,a;if("function"!=typeof i)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof i);if(void 0===(n=e._events)?(n=e._events=Object.create(null),e._eventsCount=0):(void 0!==n.newListener&&(e.emit("newListener",t,i.listener?i.listener:i),n=e._events),r=n[t]),void 0===r)r=n[t]=i,++e._eventsCount;else if("function"==typeof r?r=n[t]=o?[i,r]:[r,i]:o?r.unshift(i):r.push(i),(A=u(e))>0&&r.length>A&&!r.warned){r.warned=!0;var s=new Error("Possible EventEmitter memory leak detected. "+r.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");s.name="MaxListenersExceededWarning",s.emitter=e,s.type=t,s.count=r.length,a=s,console&&console.warn&&console.warn(a)}return e}function h(e,t,i){var o={fired:!1,wrapFn:void 0,target:e,type:t,listener:i},A=function(){for(var e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);this.fired||(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,n(this.listener,this.target,e))}.bind(o);return A.listener=i,o.wrapFn=A,A}function l(e,t,i){var o=e._events;if(void 0===o)return[];var A=o[t];return void 0===A?[]:"function"==typeof A?i?[A.listener||A]:[A]:i?function(e){for(var t=new Array(e.length),i=0;i<t.length;++i)t[i]=e[i].listener||e[i];return t}(A):v(A,A.length)}function c(e){var t=this._events;if(void 0!==t){var i=t[e];if("function"==typeof i)return 1;if(void 0!==i)return i.length}return 0}function v(e,t){for(var i=new Array(t),o=0;o<t;++o)i[o]=e[o];return i}Object.defineProperty(a,"defaultMaxListeners",{enumerable:!0,get:function(){return s},set:function(e){if("number"!=typeof e||e<0||r(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");s=e}}),a.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},a.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||r(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},a.prototype.getMaxListeners=function(){return u(this)},a.prototype.emit=function(e){for(var t=[],i=1;i<arguments.length;i++)t.push(arguments[i]);var o="error"===e,A=this._events;if(void 0!==A)o=o&&void 0===A.error;else if(!o)return!1;if(o){var r;if(t.length>0&&(r=t[0]),r instanceof Error)throw r;var a=new Error("Unhandled error."+(r?" ("+r.message+")":""));throw a.context=r,a}var s=A[e];if(void 0===s)return!1;if("function"==typeof s)n(s,this,t);else{var u=s.length,d=v(s,u);for(i=0;i<u;++i)n(d[i],this,t)}return!0},a.prototype.addListener=function(e,t){return d(this,e,t,!1)},a.prototype.on=a.prototype.addListener,a.prototype.prependListener=function(e,t){return d(this,e,t,!0)},a.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.on(e,h(this,e,t)),this},a.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.prependListener(e,h(this,e,t)),this},a.prototype.removeListener=function(e,t){var i,o,A,n,r;if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);if(void 0===(o=this._events))return this;if(void 0===(i=o[e]))return this;if(i===t||i.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete o[e],o.removeListener&&this.emit("removeListener",e,i.listener||t));else if("function"!=typeof i){for(A=-1,n=i.length-1;n>=0;n--)if(i[n]===t||i[n].listener===t){r=i[n].listener,A=n;break}if(A<0)return this;0===A?i.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(i,A),1===i.length&&(o[e]=i[0]),void 0!==o.removeListener&&this.emit("removeListener",e,r||t)}return this},a.prototype.off=a.prototype.removeListener,a.prototype.removeAllListeners=function(e){var t,i,o;if(void 0===(i=this._events))return this;if(void 0===i.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==i[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete i[e]),this;if(0===arguments.length){var A,n=Object.keys(i);for(o=0;o<n.length;++o)"removeListener"!==(A=n[o])&&this.removeAllListeners(A);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=i[e]))this.removeListener(e,t);else if(void 0!==t)for(o=t.length-1;o>=0;o--)this.removeListener(e,t[o]);return this},a.prototype.listeners=function(e){return l(this,e,!0)},a.prototype.rawListeners=function(e){return l(this,e,!1)},a.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):c.call(e,t)},a.prototype.listenerCount=c,a.prototype.eventNames=function(){return this._eventsCount>0?o(this._events):[]}},function(e,t,i){"use strict";i.r(t);var o=i(0),A=i.n(o),n={VIDEO_SOURSE_MIME_TYPE:{mp4:"video/mp4",m3u8:"application/x-mpegURL;application/vnd.apple.mpegURL;video/MP2T"},MEDIA_STATE:{IDLE:"IDLE",PLAYING:"PLAYING",BUFFERING:"BUFFERING",PAUSE:"PAUSED",COMPLETE:"COMPLETE"},VIDEO_QUALITY:{SD:1,HD:2,SHD:3},VIDEO_QUALITY_NAME:{1:"标清",2:"高清",3:"超高清"},ERROR_CODE:{VIDEO_DATA_ERROR_NO_URL:3,VIDEO_DATA_ERROR_ENCRYPT:4,MEDIA_ERROR_VIDEOTAG_NOT_SUPPORT:5,MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT:6,MEDIA_ERROR_SOURCE_ERROR:7,MEDIA_ERROR_VIDEO_ERROR:8,MEDIA_ERROR_M3U8_DECRYPT_ERROR:9,MEDIA_ERROR_HLS_ERROR:10,MEDIA_ERROR_FLV_ERROR:11},VARCONST:{SEEK_STEP:10,VOLUME_STEP:.2}};function r(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var a=function(){function e(t,i){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),!t)throw new Error("no video data");this._config=i,this.defaultQuality=this._config.defaultQuality||n.VIDEO_QUALITY.SD,t.lines?this._createLines(t):this._createMovieItem(t.ratios||[t]),this.originVideoData=t}var t,i,o;return t=e,(i=[{key:"_createLines",value:function(e){this.lines=[],this.currentLine=null;for(var t,i=e.lines,o=0;o<i.length;o++)if(void 0!==(t=i[o]).type&&t.ratios&&t.ratios.length){var A={type:t.type,name:t.name,ratios:t.ratios};this.lines.push(A),_data.lineSwitch&&_data.lineSwitch==t.type&&(this.currentLine=A)}this.currentLine||(this.currentLine=this.lines[0]),this._createMovieItem(this.currentLine.ratios)}},{key:"_createMovieItem",value:function(e){var t;this.movieItemList=[],this.currentMovieItem=null;for(var i=0;i<e.length;i++)if((t=e[i]).url){var o=this._getMediaType(t);this.movieItemList.push({quality:t.quality,qualityName:t.qualityName||this._getQualityName(t.quality),urls:[A(t.url)],fileType:o})}function A(e){return e?e.replace(/^(http:|https:)/,window.location.protocol):""}for(var n=0;n<this.movieItemList.length;n++)this.movieItemList[n].quality==this.defaultQuality&&(this.currentMovieItem=this.movieItemList[n]);this.currentMovieItem=this.currentMovieItem||this.movieItemList[0],this.currentQuality=this.currentMovieItem.quality}},{key:"_getQualityName",value:function(e){return n.VIDEO_QUALITY_NAME[e+""]||"未知"}},{key:"_getMediaType",value:function(e){return e.format?e.format:_mediaUtil.getMediaType(e.videoUrl)}},{key:"changeQuality",value:function(e){if(e)for(var t=0;t<this.movieItemList.length;t++)if(this.movieItemList[t].quality==_data.newData.quality){this.currentMovieItem=this.movieItemList[t],this.currentQuality=e;break}}},{key:"changeLine",value:function(e){if((!e||!this.currentLine||e!==this.currentLine.type)&&this.lines){for(var t=0;t<this.lines.length;t++)if(this.lines[t].type===e){this.currentLine=this.lines[t];break}this._createMovieItem(this.currentLine.ratios)}}}])&&r(t.prototype,i),o&&r(t,o),e}(),s={VIDEO_READY:"videoReady",BEFORE_LOAD:"beforeLoad",START_LOAD:"startLoad",META:"meta",STATE:"state",BEFORE_PLAY:"beforePlay",QUALITY_CHANGE:"qualityChange",RATE_CHANGE:"rateChange",BUFFER:"buffer",BUFFER_FULL:"bufferFull",TIME:"time",ERROR:"error",VOLUME:"volume",VOLUME_INCREASE:"volumeIncrease",VOLUME_DECREASE:"volumeDecrease",MUTE:"mute",SEEK:"seek",SEEK_FORWARD:"seekForward",SEEK_BACKWARD:"seekBackward"};var u={log:function(e){}};var d={isMobileAll:function(){return!1},isWeixin:function(){return!1},isAndroid:function(){return!1}},h=document.createElement("video");function l(){var e=!1,t=/Chrome[\/\s]*(\d+)\./i.exec(window.navigator.userAgent);t&&t[1]&&Number(t[1])<=49&&(e=!0);var i=window.MediaSource||window.WebKitMediaSource,o=window.SourceBuffer||window.WebKitSourceBuffer,A=i&&"function"==typeof i.isTypeSupported&&i.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'),n=!o||o.prototype&&"function"==typeof o.prototype.appendBuffer&&"function"==typeof o.prototype.remove;return!!A&&!!n&&!e}var c={supportVideo:function(){var e=!!h.canPlayType;try{h.canPlayType("video/mp4")}catch(t){e=!1}return e},supportHLS:function(){return d.isMobileAll()||l()},supportFlv:function(){return l()},supportMSEH264:l,checkVideoCanPlay:function(e){for(var t=e.split(";"),i=!1,o=0;o<t.length;o++)if(i=""!=h.canPlayType(t[o]))return i;return i},getVideoMIMEType:function(e){if(!e)return!1;var t=e.split(/\?/)[0].split("."),i=t[t.length-1],o=n.VIDEO_SOURSE_MIME_TYPE[i];return o||!1},supportAutoPlay:function(e,t){if(!e.autoStart)return t(!1);if(d.isMobileAll())return t(e.autoStart);var i=navigator.userAgent.toLowerCase(),o=!1;if(i.indexOf("chrome")>-1&&i.indexOf("66")>-1&&(o=!0),e.autoStart&&e.mute&&o)return t(!0);var A=document.createElement("video");A.autoplay=!0,A.src="data:video/mp4;base64,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",A.load();var n=A.play();n&&n.then?n.then(function(){A.pause(),t(!0)}).catch(function(e){A.pause(),t(!1)}):(A.pause(),t(!0))},supportVolumeChange:function(){try{var e=h.volume;return h.volume=e/2+.1,e!==h.volume}catch(e){return!1}},supportRateChange:function(){try{var e=h.playbackRate;return h.playbackRate=e/2+.1,e!==h.playbackRate}catch(e){return!1}},getMediaType:function(e){var t=e.split("?")[0].split("."),i="";return t&&t.length>0&&(i=t[t.length-1]),"m3u8"==(i=i.toLowerCase())&&(i="hls"),i}};function v(e,t){return 0!=(t=t||"").replace(/\s/g,"").length&&new RegExp(" "+t+" ").test(" "+e.className+" ")}var _={createEl:function(e,t){var i=document.createElement(e||"div");if(t&&i.setAttribute)for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&i.setAttribute(o,t[o]);return i},getByTagName:function(e,t){return t=t[0]?t[0]:t||document,e?t.getElementsByTagName(e):null},setStyle:function(e,t,i){e.style[t]=i},addClassName:function(e,t){v(e,t)||(e.className=""==e.className?t:e.className+" "+t)},delClassName:function(e,t){if(v(e,t)){for(var i=" "+e.className.replace(/[\t\r\n]/g,"")+" ";i.indexOf(" "+t+" ")>=0;)i=i.replace(" "+t+" "," ");e.className=i.replace(/^\s+|\s+$/g,"")}},attr:function(e,t,i){e.setAttribute(t,i)},addEvent:function(e,t,i){e.addEventListener(t,i)},clearEvent:function(e,t,i){e.removeEventListener(t,i)}},f=Object.prototype.toString;var p={isFunction:function(e){return"[object Function]"===f.call(e)},isNumber:function(e){return"[object Number]"===f.call(e)},makeArray:function(e){var t=null;try{t=Array.prototype.slice.call(e,0)}catch(A){t=new Array;for(var i=0,o=e.length;i<o;i++)t.push(e[i])}return t}};function y(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var E=function(){function e(t,i,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._videoParentNode=t,this._cfg=i,this._options=o,this._mute=!!this._cfg.mute,this._volume=this._cfg.volume||0,this._mute&&(this._volume=0),this._rate=this._cfg.rate||0,this._hasDoLoad=!1,this._hasGetMetaData=!1,this._errorCount=0,this._setState(n.MEDIA_STATE.IDLE)}var t,i,o;return t=e,(i=[{key:"_doOptionFn",value:function(e,t){this._options[e]&&this._options[e]({type:e,data:t})}},{key:"_initTech",value:function(){this._initVideoNode(),this._initVideoNodeEvent(),this._doOptionFn(s.MEDIA_VIDEO_READY,this._videoNode||null)}},{key:"_initVideoNode",value:function(){if(c.supportVideo()){if(!this._videoNode){var e={};this._cfg.autoStart&&(e.autoplay=""),d.isMobileAll()&&(e.playsinline="",e["webkit-playsinline"]=""),d.isWeixin()&&d.isAndroid()&&this._cfg.x5Fullscreen&&(u.log("this._cfg.x5Fullscreen"),e["x5-video-player-type"]="h5",e["x5-video-player-fullscreen"]="true"),this._cfg.useNative&&(e.controls="controls"),this._videoNode=_.createEl("video",e),this._videoParentNode.appendChild(this._videoNode),u.log("create video node complete")}}else this._doOptionFn(s.MEDIA_ERROR,n.ERROR_CODE.MEDIA_ERROR_VIDEOTAG_NOT_SUPPORT)}},{key:"_initVideoNodeEvent",value:function(){this._videoNode&&(_.addEvent(this._videoNode,"loadstart",function(){this._doOptionFn(s.MEDIA_START_LOAD,{videoNode:this._videoNode,movieData:this._movieData})}.bind(this)),_.addEvent(this._videoNode,"canplaythrough",function(){u.log("canplaythrough"),!this._state==n.MEDIA_STATE.PAUSE&&this._onvideoPlaying()}.bind(this)),_.addEvent(this._videoNode,"canplay",function(){u.log("canplay")}.bind(this)),_.addEvent(this._videoNode,"loadedmetadata",this._onvideoLoadedmetadata.bind(this)),_.addEvent(this._videoNode,"ended",this._onvideoEnded.bind(this)),_.addEvent(this._videoNode,"error",this._onvideoError.bind(this)),_.addEvent(this._videoNode,"playing",this._onvideoPlaying.bind(this)),_.addEvent(this._videoNode,"progress",this._onvideoProgress.bind(this)),_.addEvent(this._videoNode,"seeked",this._onvideoSeeked.bind(this)),_.addEvent(this._videoNode,"seeking",this._onvideoSeeking.bind(this)),_.addEvent(this._videoNode,"timeupdate",this._onvideoTimeupdate.bind(this)),_.addEvent(this._videoNode,"waiting",this._onvideoWaiting.bind(this)),_.addEvent(this._videoNode,"play",this._onvideoPlaying.bind(this)),_.addEvent(this._videoNode,"pause",this._onvideoPause.bind(this)),d.isWeixin()&&(_.addEvent(this._videoNode,"x5videoenterfullscreen",this._onx5VideoEnterFullScreen.bind(this)),_.addEvent(this._videoNode,"x5videoexitfullscreen",this._onx5VideoExitFullScreen.bind(this))))}},{key:"getVideoNode",value:function(){return this._videoNode||null}},{key:"fullscreenVideo",value:function(){this.canFullscreenVideo()&&this._videoNode.webkitEnterFullscreen()}},{key:"canFullscreenVideo",value:function(){return this._videoNode&&p.isFunction(this._videoNode.webkitEnterFullscreen)}},{key:"setMovieData",value:function(e){this._movieData=e}},{key:"load",value:function(e){u.log("load moivedata"),this._setState(n.MEDIA_STATE.BUFFERING),this._videoNode||this._initTech(),this._movieData=e||this._movieData,this._item=this._movieData.currentMovieItem,this._doBeforeLoad(),this._hasGetMetaData=!1,this._hasAutoSeek=!1,this._hasDoLoad=!0,this._isNotFirst||(this._errorCount=0),this._doOptionFn(s.MEDIA_QUALITY_CHANGE,this._item),this.volume(this._volume),this.rate(this._rate)}},{key:"reload",value:function(e){e=e||this._movieData,"live"==this._cfg.mode?e.start=0:e.start=this._position||this._movieData.start||0,this._isNotFirst=!0,this.stop(),this.load(e)}},{key:"_doBeforeLoad",value:function(){this._cfg.beforeLoad&&!this._movieData.hasDoBeforeLoad&&(this._movieData.hasDoBeforeLoad=!0,this._doOptionFn(s.MEDIA_BEFORE_LOAD))}},{key:"_catchPlay",value:function(){var e=this._videoNode.play();e&&e.catch&&e.then(function(){u.log("try to play success")}).catch(function(e){u.error("try to play fail")})}},{key:"play",value:function(){this._hasDoLoad||!this._movieData?this.isCompleted()?this.seek(0):this._setState(n.MEDIA_STATE.PLAYING):this.load(this._movieData)}},{key:"pause",value:function(){this._setState(n.MEDIA_STATE.PAUSE)}},{key:"_seek",value:function(e){if(u.log("_seek"),this._canSeek())try{this._videoNode.currentTime=e}catch(e){u.log(e.message)}}},{key:"seek",value:function(e){if(this._canSeek()){u.log("_canSeek");var t=p.isNumber(e)?e:e.newData;t=(t=!t||t<0?0:t)>this._duration?0:t;var i=this._position;this._seek(t),this._catchPlay(),this._doOptionFn(s.MEDIA_SEEK,{oldData:i,newData:t})}}},{key:"seekForward",value:function(){if(u.log("seekForward"),this._canSeek()){var e=this._position+n.VARCONST.SEEK_STEP>this._duration?this._duration:this._position+n.VARCONST.SEEK_STEP;this.isCompleted()&&(e=0),this._doOptionFn(s.MEDIA_SEEK_FORWARD,{oldData:{position:this._position,duration:this._duration},newData:{position:e,duration:this._duration}}),this.seek(e)}}},{key:"seekBackward",value:function(){if(u.log("seekBackward"),this._canSeek()){var e=this._position-n.VARCONST.SEEK_STEP<0?0:this._position-n.VARCONST.SEEK_STEP;this._doOptionFn(s.MEDIA_SEEK_BACKWARD,{oldData:{position:this._position,duration:this._duration},newData:{position:e,duration:this._duration}}),this.seek(e)}}},{key:"volume",value:function(e){e=e>1?1:e<0?0:e,this._videoNode.volume=e,this._volume=e,0==this._volume?this.mute(!0):this.mute(!1),this._doOptionFn(s.MEDIA_VOLUME,e)}},{key:"volumeIncrease",value:function(){var e=this._videoNode.volume;e=e+n.VARCONST.VOLUME_STEP>1?1:e+n.VARCONST.VOLUME_STEP,this._videoNode.volume=e,this._volume=e,this._doOptionFn(s.MEDIA_VOLUME_INCREASE,e)}},{key:"volumeDecrease",value:function(){var e=this._videoNode.volume;e=e-n.VARCONST.VOLUME_STEP<0?0:e-n.VARCONST.VOLUME_STEP,this._videoNode.volume=e,this._volume=e,this._doOptionFn(s.MEDIA_VOLUME_DECREASE,e)}},{key:"mute",value:function(e){this._videoNode.muted=e,this._mute=e,this._doOptionFn(s.MEDIA_MUTE,e)}},{key:"stop",value:function(){this.pause(),this.clear(),this._setState(n.MEDIA_STATE.IDLE)}},{key:"state",value:function(){return this._state}},{key:"getPosition",value:function(){return this._position}},{key:"isCompleted",value:function(){return this._videoNode.ended}},{key:"rate",value:function(e){e="live"==this._cfg.mode?1:e||1,this._videoNode.defaultPlaybackRate=e,this._videoNode.playbackRate=e,this._rate=e,this._doOptionFn(s.MEDIA_RATE_CHANGE,e)}},{key:"isBlock",value:function(){var e;return this._isbLastFrameCount=this._isbLastFrameCount||0,this._videoNode.webkitDecodedFrameCount?(this._isbNowFrameCount=this._videoNode.webkitDecodedFrameCount,e=this._isbNowFrameCount-this._isbLastFrameCount,this._isbLastFrameCount=this._isbNowFrameCount):this._videoNode.mozDecodedFrames&&(this._isbNowFrameCount=this._videoNode.mozDecodedFrames,e=this._isbNowFrameCount-this._isbLastFrameCount,this._isbLastFrameCount=this._isbNowFrameCount),null!=e&&e<=10}},{key:"metaFPS",value:function(){return 0}},{key:"currentFPS",value:function(){this._cfpsLastFrameCount=this._cfpsLastFrameCount||0;var e=0;return this._videoNode.webkitDecodedFrameCount?(this._cfpsNowFrameCount=this._videoNode.webkitDecodedFrameCount,e=this._cfpsNowFrameCount-this._cfpsLastFrameCount,this._cfpsLastFrameCount=this._cfpsNowFrameCount):this._videoNode.mozDecodedFrames&&(this._cfpsNowFrameCount=this._videoNode.mozDecodedFrames,e=this._cfpsNowFrameCount-this._cfpsLastFrameCount,this._cfpsLastFrameCount=this._cfpsNowFrameCount),e}},{key:"currentKbps",value:function(){this._cfpslastByteLoaded=this._cfpslastByteLoaded||0;var e=0;return this._videoNode.webkitVideoDecodedByteCount&&(this._cfpsNowByteLoaded=this._videoNode.webkitVideoDecodedByteCount,e=this._cfpsNowByteLoaded-this._cfpslastByteLoaded,this._cfpslastByteLoaded=this._cfpsNowByteLoaded),8*e/1e3}},{key:"_canSeek",value:function(){return!!this._duration&&isFinite(this._duration)&&!!this._hasGetMetaData||"live"==this._cfg.mode}},{key:"_setState",value:function(e){this._state!=e&&(this._doOptionFn(s.MEDIA_STATE,{newState:e,oldState:this._state}),this._state=e)}},{key:"_onvideoLoadedmetadata",value:function(e){this._hasGetMetaData||(this._duration=this._videoNode.duration,this._videoNode.duration&&isFinite(this._videoNode.duration)||"live"==this._cfg.mode?this._doMetaReady():this._checkDuration())}},{key:"_checkDuration",value:function(){if(this._videoNode){var e=0;this._checkMetaTimer=setInterval(function(){return++e>=50&&!this._videoNode.duration?(clearInterval(this._checkMetaTimer),this._checkMetaTimer=null,this._duration=this._movieData.duration||0,void this._doMetaReady()):this._videoNode.duration&&isFinite(this._videoNode.duration)?(clearInterval(this._checkMetaTimer),this._checkMetaTimer=null,this._duration=this._videoNode.duration,void this._doMetaReady()):void 0}.bind(this),200)}else this._checkMetaTimer&&(clearInterval(this._checkMetaTimer),this._checkMetaTimer=null)}},{key:"_doMetaReady",value:function(){this._hasGetMetaData=!0;var e={duration:Math.floor(this._duration),width:this._videoNode.videoWidth,height:this._videoNode.videoHeight};this._doOptionFn(s.MEDIA_META,e)}},{key:"_onvideoTimeupdate",value:function(e){this._videoNode.duration&&isFinite(this._videoNode.duration)&&(this._duration=this._videoNode.duration);var t={currentTime:Math.floor(this._videoNode.currentTime),duration:Math.floor(this._videoNode.duration)};this._position=t.currentTime,this._doOptionFn(s.MEDIA_TIME,t),this._state!=n.MEDIA_STATE.PAUSE&&this._state!=n.MEDIA_STATE.PLAYING&&this._setState(n.MEDIA_STATE.PLAYING)}},{key:"_onvideoProgress",value:function(e){this._doOptionFn(s.MEDIA_BUFFER,{bufferPercent:this._getBufferedPercent()})}},{key:"_getBufferedPercent",value:function(){var e,t=this._videoNode.buffered,i=0;if(!t||t.length<1)return 0;if(t&&1==t.length)i=Math.floor(t.end(0));else{for(var o=this._videoNode.currentTime||0,A=0,n=t.length;A<n;A++)e=Math.floor(t.start(A)),o<=Math.floor(t.end(A))&&o>=e&&(i=Math.floor(t.end(A)));i||(i=Math.floor(t.end(t.length-1)))}return this._duration?i/this._duration:0}},{key:"_onvideoPlaying",value:function(e){this._setState(n.MEDIA_STATE.PLAYING),u.log("_onvideoPlaying")}},{key:"_onvideoPause",value:function(e){this._setState(n.MEDIA_STATE.PAUSE),u.log("_onvideoPause")}},{key:"_onvideoWaiting",value:function(e){this._setState(n.MEDIA_STATE.BUFFERING),u.log("_onvideoWaiting")}},{key:"_onvideoSeeking",value:function(e){u.log("_onvideoSeeking")}},{key:"_onvideoSeeked",value:function(e){u.log("_onvideoSeeked")}},{key:"_onx5VideoEnterFullScreen",value:function(){_.setStyle(this._videoNode,"width",window.screen.width+"px"),_.setStyle(this._videoNode,"height",window.screen.height+"px"),_.addClassName(document.body,"z-x5-video-fullscreen")}},{key:"_onx5VideoExitFullScreen",value:function(){_.setStyle(this._videoNode,"width",""),_.setStyle(this._videoNode,"height",""),_.delClassName(document.body,"z-x5-video-fullscreen"),_.delClassName(document.body,"z-x5-video-fullscreen-landscape"),_.attr(this._videoNode,"x5-video-orientation","portrait")}},{key:"_onvideoEnded",value:function(e){this._setState(n.MEDIA_STATE.COMPLETE)}},{key:"_onvideoError",value:function(e){this._checkErrorCount()&&(this.stop(),this._doOptionFn(s.MEDIA_ERROR,{code:n.ERROR_CODE.MEDIA_ERROR_VIDEO_ERROR,message:this._formatVideoNodeError(e)}))}},{key:"_formatVideoNodeError",value:function(e){return e.target&&e.target.error?"media error:"+e.target.error.code:null}},{key:"_checkErrorCount",value:function(){return!(this._errorCount<1)||(this._errorCount++,this.reload(),!1)}},{key:"clear",value:function(){this._videoNode&&(this._clearVideoEvent(),this._videoParentNode.removeChild(this._videoNode),this._videoNode=null)}},{key:"_clearVideoEvent",value:function(){this._videoNode&&(_.clearEvent(this._videoNode,"loadedmetadata"),_.clearEvent(this._videoNode,"ended"),_.clearEvent(this._videoNode,"error"),_.clearEvent(this._videoNode,"pause"),_.clearEvent(this._videoNode,"play"),_.clearEvent(this._videoNode,"playing"),_.clearEvent(this._videoNode,"progress"),_.clearEvent(this._videoNode,"seeked"),_.clearEvent(this._videoNode,"seeking"),_.clearEvent(this._videoNode,"timeupdate"),_.clearEvent(this._videoNode,"waiting"),d.isWeixin()&&d.isAndroid()&&this._cfg.x5Fullscreen&&(_.clearEvent(this._videoNode,"x5videoenterfullscreen"),_.clearEvent(this._videoNode,"x5videoexitfullscreen")))}}])&&y(t.prototype,i),o&&y(t,o),e}();function m(e){return(m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function g(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function M(e,t){return!t||"object"!==m(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function N(e,t,i){return(N="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,i){var o=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=k(e)););return e}(e,t);if(o){var A=Object.getOwnPropertyDescriptor(o,t);return A.get?A.get.call(i):A.value}})(e,t,i||e)}function k(e){return(k=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function D(e,t){return(D=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var R=function(e){function t(e,i,o){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),M(this,k(t).call(this,e,i,o))}var i,o,A;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&D(e,t)}(t,E),i=t,(o=[{key:"_setSourceNode",value:function(e){this._clearSourceEvent(),this._removeSourceNode(),e.forEach(function(e){if(e){var t=c.getVideoMIMEType(e);if(t)if(c.checkVideoCanPlay(t)){var i=_.createEl("source",{src:e,type:t.split(";")[0]});this._videoNode.appendChild(i)}else this._doOptionFn(s.MEDIA_ERROR,n.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT);else this._doOptionFn(s.MEDIA_ERROR,n.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT)}}.bind(this)),this._sourceNodes=p.makeArray(_.getByTagName("source",this._videoNode)),this._initSourceEvent()}},{key:"_removeSourceNode",value:function(){var e=this;this._sourceNodes&&(this._sourceNodes.forEach(function(t,i){e._videoNode.removeChild(t)}),this._sourceNodes.length=0),this._sourceNodes=null}},{key:"_initSourceEvent",value:function(e){var t=this;this._sourceNodes.forEach(function(e,i){_.addEvent(e,"error",t._onsourceError.bind(t))})}},{key:"load",value:function(e){N(k(t.prototype),"load",this).call(this,e),this._setSourceNode(this._item.urls),this._videoNode.load(),(this._isNotFirst||!this._cfg.isPreload||d.isMobileAll())&&this._catchPlay()}},{key:"play",value:function(){N(k(t.prototype),"play",this).call(this),this._catchPlay()}},{key:"pause",value:function(){N(k(t.prototype),"pause",this).call(this),this._videoNode&&this._videoNode.pause()}},{key:"_autoSeek",value:function(){this._canSeek()&&(this._hasAutoSeek?this._doPreloadPause():this._movieData.start>0?(this._seek(this._movieData.start),u.log("html5 video do autoseek"),this._doPreloadPause()):(this._doPreloadPause(),this._hasAutoSeek=!0))}},{key:"_doPreloadPause",value:function(){this._cfg.isPreload&&!this._hasDoPreload?(this._hasDoPreload=!0,this.pause()):this.play()}},{key:"_doBeforePlay",value:function(){if(this._hasGetMetaData&&"live"!=this._cfg.mode){if(this._hasAutoSeek||!d.isMobileAll())return this._cfg.beforePlay&&!this._hasDoBeforePlay&&this._state==n.MEDIA_STATE.PLAYING?(this._hasDoBeforePlay=!0,void this._doOptionFn(s.MEDIA_BEFORE_PLAY)):void 0;this._autoSeek()}}},{key:"_doMetaReady",value:function(){N(k(t.prototype),"_doMetaReady",this).call(this),d.isMobileAll()||this._autoSeek()}},{key:"_doPreloadAndBeforePlay",value:function(){if(this._hasGetMetaData&&this._hasAutoSeek&&"live"!=this._cfg.mode)return!(this._cfg.beforePlay&&!this._movieData.hasDoBeforePlay&&this._state==n.MEDIA_STATE.PLAYING)||(this._movieData.hasDoBeforePlay=!0,this._doOptionFn(s.MEDIA_BEFORE_PLAY),!1)}},{key:"_onvideoTimeupdate",value:function(e){this._doBeforePlay(),N(k(t.prototype),"_onvideoTimeupdate",this).call(this,e)}},{key:"_onvideoSeeked",value:function(e){this._hasAutoSeek||(this._hasAutoSeek=!0,this._isAutoSeeking=!1)}},{key:"_onsourceError",value:function(e){this._checkErrorCount()&&(this.stop(),this._doOptionFn(s.MEDIA_ERROR,{code:n.ERROR_CODE.MEDIA_ERROR_SOURCE_ERROR,message:this._formatVideoNodeError(e)}))}},{key:"clear",value:function(){this._videoNode&&(this._clearSourceEvent(),this._removeSourceNode()),N(k(t.prototype),"clear",this).call(this)}},{key:"_clearSourceEvent",value:function(){this._sourceNodes&&this._sourceNodes.forEach(function(e,t){_.clearEvent(e,"error")})}}])&&g(i.prototype,o),A&&g(i,A),t}();function b(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}i.d(t,"default",function(){return I});var I=function(){function e(t){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),!t.parent)throw new Error("no parentNode!");this._config=t.config,this._parentNode=t.parent,this._emitter=new A.a,t.videoData&&this.setVideoData(t.videoData)}var t,i,o;return t=e,(i=[{key:"_videoDataReady",value:function(e){var t=this;this._videoData=e,this._videoMediaIns&&(this._videoMediaIns.clear(),this._videoMediaIns=null),this._createMediaIns(function(e){t._videoMediaIns=e,t._config.autoStart||t._config.isPreload?t._videoMediaIns.load(t._videoData):t._videoMediaIns.setMovieData(t._videoData)})}},{key:"_createMediaIns",value:function(e){var t=this,i={};Object.keys(s).forEach(function(e){i[s[e]]=t._mediaEventHandler.bind(t)}),e&&e(new R(this._parentNode,this._config,i))}},{key:"_mediaEventHandler",value:function(e){this.reactiveState&&this.updateReactiveState(e),this._emitter.emit(e.type,e.data)}},{key:"destroy",value:function(){this._videoMediaIns&&(this._videoMediaIns.stop(),this._videoMediaIns=null),this._emitter.removeAllListeners(),this._emitter=null}},{key:"getVideoNode",value:function(){return this._videoMediaIns.getVideoNode()}},{key:"on",value:function(e,t){this._emitter.addListener(e,t)}},{key:"off",value:function(e,t){this._emitter.removeListener(e,t)}},{key:"setVideoData",value:function(e){e&&this._videoDataReady(new a(e,this._config))}},{key:"getReactiveState",value:function(){return this.reactiveState||(this.reactiveState={error:null,line:null,lineName:"",quality:null,qualityName:"",duration:0,currentTime:0,buffered:0,state:null,volume:0,mute:!1,rate:1,fullscreen:!1}),this.reactiveState}},{key:"updateReactiveState",value:function(e){switch(e.type){case s.MEDIA_VIDEO_READY:break;case s.MEDIA_STATE:this.reactiveState.state=e.data;break;case s.MEDIA_TIME:this.reactiveState.currentTime=e.data.currentTime,this.reactiveState.duration=e.data.duration;break;case s.MEDIA_BUFFER:this.reactiveState.buffered=e.data.bufferPercent;break;case s.MEDIA_ERROR:this.reactiveState.error=e.data}}},{key:"load",value:function(){this._videoData&&this._videoMediaIns&&this._videoMediaIns.load(this._videoData)}},{key:"reload",value:function(){this._videoData&&this._videoMediaIns&&this._videoMediaIns.reload()}},{key:"changeQuality",value:function(e){this._videoData&&this._videoData.changeQuality(e),this.reload()}},{key:"changeLine",value:function(e){this._videoData&&this._videoData.changeLine(e),this.reload()}},{key:"seek",value:function(e){this._videoMediaIns&&this._videoMediaIns.seek(e)}},{key:"seekForward",value:function(){this._videoMediaIns&&this._videoMediaIns.seekForward()}},{key:"seekBackward",value:function(){this._videoMediaIns&&this._videoMediaIns.seekBackward()}},{key:"play",value:function(){this._videoMediaIns&&this._videoMediaIns.play()}},{key:"pause",value:function(){this._videoMediaIns&&this._videoMediaIns.pause()}},{key:"stop",value:function(){this._videoMediaIns&&this._videoMediaIns.stop()}},{key:"pause",value:function(){this._videoMediaIns&&this._videoMediaIns.pause()}},{key:"volume",value:function(e){this._videoMediaIns&&this._videoMediaIns.volume(e)}},{key:"volumeIncrease",value:function(e){this._videoMediaIns&&this._videoMediaIns.volumeIncrease(e)}},{key:"volumeDecrease",value:function(e){this._videoMediaIns&&this._videoMediaIns.volumeDecrease(e)}},{key:"mute",value:function(e){this._videoMediaIns&&this._videoMediaIns.mute(e)}},{key:"rate",value:function(e){this._videoMediaIns&&this._videoMediaIns.rate(e)}},{key:"getPosition",value:function(){return this._videoMediaIns.getPosition()}},{key:"getState",value:function(){return this._videoMediaIns.state()}},{key:"isBlock",value:function(){return this._videoMediaIns.isBlock()}},{key:"metaFPS",value:function(){return this._videoMediaIns.metaFPS()}},{key:"currentFPS",value:function(){return this._videoMediaIns.currentFPS()}},{key:"currentKbps",value:function(){return this._videoMediaIns.currentKbps()}}])&&b(t.prototype,i),o&&b(t,o),e}()}])});