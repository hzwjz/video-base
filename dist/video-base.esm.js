/*!
 * Vido-base v1.0.0
 */
// Copyright Joyent, Inc. and other Node contributors.

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}
var events = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = $getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  var args = [];
  for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    ReflectApply(this.listener, this.target, args);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

/**
 * constant
 */
var Constant = {

    VIDEO_SOURSE_MIME_TYPE : {
        'mp4': 'video/mp4',
        'm3u8': 'application/x-mpegURL;application/vnd.apple.mpegURL;video/MP2T'
    },

    // 视频媒体的状态
    MEDIA_STATE : {
        IDLE: 'IDLE',
        PLAYING: 'PLAYING',
        BUFFERING: 'BUFFERING',
        PAUSE: 'PAUSED',
        COMPLETE: 'COMPLETE'
    },

    // 视频清晰度
    VIDEO_QUALITY : {
        SD : 1,
        HD : 2,
        SHD : 3
    },

    // 视频清晰度名称
    VIDEO_QUALITY_NAME : {
        '1' : '标清',
        '2' : '高清',
        '3' : '超高清'
    },

    // 错误码
    ERROR_CODE : {
        'VIDEO_DATA_ERROR_NO_URL': 3, // 缺少视频地址
        'VIDEO_DATA_ERROR_ENCRYPT': 4, // 无法播放加密视频
        'MEDIA_ERROR_VIDEOTAG_NOT_SUPPORT': 5, // video标签不支持
        'MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT': 6, // 视频文件不支持
        'MEDIA_ERROR_SOURCE_ERROR': 7, // 视频源错误，一般是网络问题或者是地址错误
        'MEDIA_ERROR_VIDEO_ERROR': 8, // 视频播放时的错误，一般是网络问题
        'MEDIA_ERROR_M3U8_DECRYPT_ERROR': 9, // m3u8解密错误
        'MEDIA_ERROR_HLS_ERROR': 10, // hls库内部抛出的错误
        'MEDIA_ERROR_FLV_ERROR': 11 // flvjs库内部抛出的错误
    },

    // 错误文案
    ERROR_TXT : {
        '3': '缺少视频地址',
        '4': '不支持该视频播放',
        '5': '您的浏览器不支持视频播放',
        '6': '不支持该视频播放',
        '7': '抱歉视频无法播放',
        '8': '抱歉视频无法播放',
        '9': '不支持该视频播放',
        '10' : '抱歉视频无法播放',
        '11' : '抱歉视频无法播放'
    },

    VARCONST : {
        'SEEK_STEP': 10, // seek步长
        'VOLUME_STEP': 0.2 // 音量步长
    }
};

/**
 * event
 */
const videoDataEvent = {
    VIDEO_DATA_READY : 'videoDataReady',
    LINE_CHANGE : 'line_change',
    QUALITY_CHANGE : 'qualityChange'
};
    
const mediaEvent = {
    VIDEO_NODE_READY : 'videoNodeReady',
    BEFORE_LOAD : 'beforeLoad',
    START_LOAD : 'startLoad',
    META : 'meta',
    STATE : 'state',
    BEFORE_PLAY : 'beforePlay',
    RATE_CHANGE : 'rateChange',
    BUFFER : 'buffer',
    BUFFER_FULL : 'bufferFull',
    TIME : 'time',
    ERROR : 'error',
    VOLUME : 'volume',
    VOLUME_INCREASE : 'volumeIncrease',
    VOLUME_DECREASE : 'volumeDecrease',
    MUTE : 'mute',
    SEEK : 'seek',
    SEEK_FORWARD : 'seekForward',
    SEEK_BACKWARD : 'seekBackward',
    FULLSCREEN: 'fullscreen'
};

/**
 * video data
 */

class VideoData {
    constructor(videoData, config, options) {
        if(!videoData){
            throw new Error('no video data');
        }

        this._config = config;
        this.defaultQuality = this._config.defaultQuality || Constant.VIDEO_QUALITY.SD;

        this._options = options;

        if(!videoData.lines){
            this._createMovieItem(videoData.ratios || [videoData]);
        }else{
            // 创建线路
            this._createLines(videoData);
        }
        
        // 将原始数据带上，可能自定义组件中会用到
        this.originVideoData = videoData;
    }

    _doOptionFn(fn, val) {
        this._options[fn] && this._options[fn]({
            type : fn,
            data : val
        });
    }

    _createLines(videoData) {
        this.lines = [];
        this.currentLine = null;

        var lines = videoData.lines, line;

        for(var i = 0; i < lines.length; i++){
            line = lines[i];

            if(line.type !== undefined && line.ratios && line.ratios.length){
                var nl = {
                    type: line.type,
                    name: line.name,
                    ratios: line.ratios
                };

                this.lines.push(nl);

                if(_data.lineSwitch && _data.lineSwitch == line.type){
                    this.currentLine = nl;
                }
            }
        }

        if(!this.currentLine){ // 之前没有选择就取第一个默认线路
            this.currentLine = this.lines[0];
        }

        // 创建当前线路的各个清晰度项
        this._createMovieItem(this.currentLine.ratios);
    }   

    _createMovieItem(ratios) {
        // 视频item数组，重置
        this.movieItemList = [];
        this.currentMovieItem = null;

        let video;

        for(let i = 0; i < ratios.length; i++){
            video = ratios[i];
            
            if(video.url){
                let fileType = this._getMediaType(video);

                this.movieItemList.push({
                    quality : video.quality,
                    qualityName : video.qualityName || this._getQualityName(video.quality), // 如果提供了清晰度名称就直接使用
                    urls : [changeUrlProtocol(video.url)], // 转一下协议
                    fileType : fileType
                });
            }
        }

        function changeUrlProtocol(url){
            if(!url) {
                return '';
            }
            return url.replace(/^(http:|https:)/, window.location.protocol);
        }

        // 当前选择的视频item
        for (let i = 0; i < this.movieItemList.length; i++) {
            if(this.movieItemList[i].quality == this.defaultQuality){
                this.currentMovieItem = this.movieItemList[i];
            }
        }
        this.currentMovieItem = this.currentMovieItem || this.movieItemList[0]; // 默认第一个
        this.currentQuality = this.currentMovieItem.quality;
        this.qualityCount = this.movieItemList.length;

        this._doOptionFn(videoDataEvent.VIDEO_DATA_READY, this);
    }

    _getQualityName(quality) {
        return Constant.VIDEO_QUALITY_NAME[quality + ''] || '未知';
    }

    _getMediaType(video) {
        if(video.format){
            return video.format
        }

        return _mediaUtil.getMediaType(video.videoUrl);
    }

    changeQuality(quality) {
        if (!quality) {
            return;
        }
        for (var i = 0; i < this.movieItemList.length; i++) {
            if(this.movieItemList[i].quality == _data.newData.quality){
                this.currentMovieItem = this.movieItemList[i];
                this.currentQuality = quality; // 更新当前清晰度选择
                break;
            }
        }
        this._doOptionFn(videoDataEvent.QUALITY_CHANGE, this);
    }

    changeLine(line) {     
        if(line && this.currentLine && line === this.currentLine.type){
            return;
        }
        
        if(this.lines){
            for(var i = 0; i < this.lines.length; i++){
                if(this.lines[i].type === line){
                    this.currentLine = this.lines[i];
                    break;
                }
            }
            
            // 更新视频数据项
            this._createMovieItem(this.currentLine.ratios);

            // 清晰度切换完成后再抛出
            this._doOptionFn(videoDataEvent.LINE_CHANGE, this);

        }
    }
}

/**
 * log util
 */
function log(text) {

}

function error(text) {

}

var logUtil = {
    log,
    error
};

/**
 * env util
 */
let ua = window.navigator.userAgent;

function isMobileAll() {
    let regx = new RegExp('(iPhone|iPod|Android|BlackBerry|mobile|Windows Phone)', 'ig');
    return regx.test(ua);
}

function isWeixin() {
    let regx = new RegExp('(micromessenger)', 'ig');
    return regx.test(ua);
}

function isAndroid() {
    return ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
} 

var envUtil$1 = {
    isMobileAll,
    isWeixin,
    isAndroid
};

/**
 * media util
 */
// import logUtil from './logUtil';

let _testVideo = document.createElement('video');

// 是否支持video标签
function supportVideo() {
    let _support = !!_testVideo.canPlayType;

    try{
        _testVideo.canPlayType('video/mp4');
    }catch(e){
        _support = false;
    }
    
    return _support;
}

function supportHLS() {
    return envUtil$1.isMobileAll() || supportMSEH264();
}

function supportFlv() {
    return supportMSEH264();
}

function supportMSEH264() {
    // chrome版本
    let creg = /Chrome[\/\s]*(\d+)\./i, isLowChrome = false;
    let cret = creg.exec(window.navigator.userAgent);
    if(cret){
        if(cret[1] && Number(cret[1]) <= 49){
            isLowChrome = true;
        }
    }

    let mediaSource = window.MediaSource || window.WebKitMediaSource;
    let sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    let isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === 'function' && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

    let sourceBufferValidAPI = !sourceBuffer || (sourceBuffer.prototype &&
                                typeof sourceBuffer.prototype.appendBuffer === 'function' &&
                                typeof sourceBuffer.prototype.remove === 'function');

    return !!isTypeSupported && !!sourceBufferValidAPI && !isLowChrome;
}

// 检查视频能否播放
function checkVideoCanPlay(type) {
    let _types = type.split(';');

    let _canplay = false;

    for (let i = 0; i < _types.length; i++) {
        _canplay = _testVideo.canPlayType(_types[i]) != '';

        if (_canplay) {
            return _canplay;
        }    }
    return _canplay;
}

// 获取视频MIMEType
function getVideoMIMEType(src) {
    if(!src) return false;

    let _srcShort = src.split(/\?/)[0]; //判断视频类型
    let _ss = _srcShort.split('.');
    let _fileType = _ss[_ss.length - 1];
    let _mediaType = Constant.VIDEO_SOURSE_MIME_TYPE[_fileType];

    if(!!_mediaType){
        return _mediaType;
    }

    return false;
}

// 是否支持音量改变
function supportVolumeChange() {
    try {
        let _volume =  _testVideo.volume;
        _testVideo.volume = (_volume / 2) + 0.1;

        return _volume !== _testVideo.volume;
    } catch(e) {
        return false;
    }
}

// 是否支持autoplay
function supportAutoPlay(config, callback) {
    // logUtil.log('check autoplay support');

    if (!config.autoStart){
        // logUtil.log('autoplay close or not support');
        return callback(false);
    }

    // 移动端不做判断
    if(envUtil$1.isMobileAll()){
        // logUtil.log('mobile autoplay');
        return callback(config.autoStart);
    }

    let nav = navigator.userAgent.toLowerCase(), isChrome66 = false;
    if(nav.indexOf("chrome") > -1 && nav.indexOf("66") > -1){
        isChrome66 = true;
    }

    // 在静音时chrome 66允许自动播放，之后的版本还不确定
    if(config.autoStart && config.mute && isChrome66){
        // logUtil.log('chrome can autoplay in ver 66 when mute is true');
        return callback(true);
    }

    let video = document.createElement('video');
    video.autoplay = true;
    video.src = 'data:video/mp4;base64,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';
    video.load();
    let playPromise = video.play();

    if(playPromise && playPromise.then){
        playPromise.then(function(){
            // logUtil.log('check autoplay complete:true');
            video.pause();
            
            callback(true);

        }).catch(function (e) {
            // logUtil.log('check autoplay complete:false');
            video.pause();

            callback(false);
        });
    }else{
        // logUtil.log('check autoplay complete，no promise:true');
        video.pause();
        
        callback(true);
    }
}

// 是否支持速率改变
function supportRateChange() {
    try {
        let _playbackRate = _testVideo.playbackRate;
        _testVideo.playbackRate = (_playbackRate / 2) + 0.1;
        // logUtil.log('supportRateChange：' + _playbackRate !== _testVideo.playbackRate);
        return _playbackRate !== _testVideo.playbackRate;
    } catch(e) {
        // logUtil.log('supportRateChange：' + e.message || e);
        return false;
    }
}

// 获取视频文件后缀
function getMediaType(url) {
    let ourl = (url.split('?'))[0]; // 去掉问号后面的
    let sps = ourl.split('.'), type = '';
                
    if(sps && sps.length > 0){
        type = sps[sps.length - 1];
    }

    type = type.toLowerCase();

    if(type == 'm3u8'){
        type = 'hls';
    }

    return type;
}

var mediaUtil = {
    supportVideo,
    supportHLS,
    supportFlv,
    supportMSEH264,
    checkVideoCanPlay,
    getVideoMIMEType,
    supportAutoPlay,
    supportVolumeChange,
    supportRateChange,
    getMediaType
};

/**
 * dom util
 */
function createEl(tagName, attrs) {
    let el = document.createElement(tagName || 'div');

    if (attrs && el.setAttribute) {
        for (let p in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, p)) {
                el.setAttribute(p, attrs[p]);
            }
        }
    }

    return el;
}

function getByTagName(tag, ele) {
    ele = !!ele[0] ? ele[0] : (ele || document);
    return !tag ? null : ele.getElementsByTagName(tag);
}

function addEvent(ele, evtName, fn) {
    ele.addEventListener(evtName, fn);
}

function clearEvent(ele, evtName, fn) {
    ele.removeEventListener(evtName, fn);
}

function getEvent$1() {
    if (document.all) return window.event;

    var func = getEvent$1.caller;

    while (func != null) {
        var arg0 = func.arguments[0];

        if (arg0) {
            if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                return arg0;
            }
        }

        func = func.caller;
    }

    return null;
}

function setStyle(ele, styleName, value) {
    ele.style[styleName] = value;
}

function hasClass(ele, cls) {
    cls = cls || '';
    if (cls.replace(/\s/g, '').length == 0) {
        return false;
    }

    return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
  }

function addClassName(ele, cls) {
    if(!hasClass(ele, cls)){
        ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
    }
}

function delClassName(ele, cls) {
    if (hasClass(ele, cls)) {
        let newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + cls + ' ') >= 0) {
            newClass = newClass.replace(' ' + cls + ' ', ' ');
        }
        ele.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

function attr(ele, attr, value) {
    ele.setAttribute(attr, value);
}

var domUtil = {
    createEl,
    getByTagName,
    setStyle,
    addClassName,
    delClassName,
    attr,
    addEvent,
    clearEvent,
    getEvent: getEvent$1
};

/**
 * base util
 */
const toString = Object.prototype.toString;

function isFunction(fn) {
    return toString.call(fn) === '[object Function]';
}

function isNumber(n) {
    return toString.call(n) === '[object Number]';
}

function makeArray(nodes) {
    let array = null;
    
    try{
        array = Array.prototype.slice.call(nodes,0);
    }catch(ex){
        array = new Array();
        for(var i = 0,len = nodes.length;i < len;i++) {
            array.push(nodes[i]);
        }
    }
    
    return array;
}

var baseUtil = {
    isFunction,
    isNumber,
    makeArray
};

/**
 * base media class
 */

class BaseMedia {
    constructor(parentNode, playerConfig, options) {
        // 父元素
        this._videoParentNode = parentNode;
        // 配置
        this._cfg = playerConfig;
        // 参数
        this._options = options;

        // 使用配置中的值
        this._mute = !!this._cfg.mute;
        this._volume = this._cfg.volume || 0; 
        if(this._mute){
            this._volume = 0;
        }
        this._rate = this._cfg.rate || 1;
        this._hasDoLoad = false;
        this._hasGetMetaData = false;
        this._errorCount = 0;  

        // 播放状态，初始状态
        this._setState(Constant.MEDIA_STATE.IDLE);
    }

    _doOptionFn(fn, val) {
        this._options[fn] && this._options[fn]({
            type : fn,
            data : val
        });
    }

    _initTech() {
        // 子类实现
        this._initVideoNode();

        // 绑定video DOM事件
        this._initVideoNodeEvent();

        // 抛出事件
        this._doOptionFn(mediaEvent.VIDEO_NODE_READY, this._videoNode || null);
    }

    _initVideoNode() {
        // 子类实现

        if (!mediaUtil.supportVideo()) {
            this._doOptionFn(mediaEvent.ERROR, Constant.ERROR_CODE.MEDIA_ERROR_VIDEOTAG_NOT_SUPPORT);
            return;
        }
        if (!!this._videoNode) return;

        let attrs = {};

        if(this._cfg.autoStart){
            attrs.autoplay = '';
        }

        if (envUtil$1.isMobileAll()) {
            attrs['playsinline'] = '';
            attrs['webkit-playsinline'] = '';
        }

        if (envUtil$1.isWeixin() && envUtil$1.isAndroid() && this._cfg.x5Fullscreen) {
            logUtil.log('this._cfg.x5Fullscreen');
            attrs['x5-video-player-type'] = 'h5';
            attrs['x5-video-player-fullscreen'] = 'true';
        }

        if(this._cfg.useNativeUI){ // 直接使用video标签默认的ui
            attrs.controls = 'controls';
        }

        // video节点
        this._videoNode = domUtil.createEl('video', attrs);

        // 添加到父元素
        this._videoParentNode.appendChild(this._videoNode);

        logUtil.log('create video node complete');
    }

    _initVideoNodeEvent() {
        if (this._videoNode) {
            domUtil.addEvent(this._videoNode, "loadstart", function(){
                // 预加载也会触发loadstart事件，说明预加载时自动调用了load
                // 开始加载新视频
                this._doOptionFn(mediaEvent.START_LOAD, {
                    videoNode : this._videoNode,
                    movieData : this._movieData
                });
                
            }.bind(this));

            // _domUtil.addEvent(this._videoNode, "abort", this._onvideoError.bind(this));
            // _domUtil.addEvent(this._videoNode, "stalled", this._onvideoError.bind(this));
            // _domUtil.addEvent(this._videoNode, "durationchange", this._onvideoError.bind(this));

            domUtil.addEvent(this._videoNode, "canplaythrough", function(){ 
                logUtil.log('canplaythrough');

                if(!this._state == Constant.MEDIA_STATE.PAUSE){
                    this._onvideoPlaying();
                }
                
            }.bind(this));
            domUtil.addEvent(this._videoNode, "canplay", function(){ 
                logUtil.log('canplay');
            }.bind(this));

            domUtil.addEvent(this._videoNode, "loadedmetadata", this._onvideoLoadedmetadata.bind(this));
            domUtil.addEvent(this._videoNode, "ended", this._onvideoEnded.bind(this));
            domUtil.addEvent(this._videoNode, "error", this._onvideoError.bind(this));
            domUtil.addEvent(this._videoNode, "playing", this._onvideoPlaying.bind(this));
            domUtil.addEvent(this._videoNode, "progress", this._onvideoProgress.bind(this));
            domUtil.addEvent(this._videoNode, "seeked", this._onvideoSeeked.bind(this));
            domUtil.addEvent(this._videoNode, "seeking", this._onvideoSeeking.bind(this));
            domUtil.addEvent(this._videoNode, "timeupdate", this._onvideoTimeupdate.bind(this));
            domUtil.addEvent(this._videoNode, "waiting", this._onvideoWaiting.bind(this));
            domUtil.addEvent(this._videoNode, "play", this._onvideoPlaying.bind(this));
            domUtil.addEvent(this._videoNode, "pause", this._onvideoPause.bind(this));

            if(envUtil$1.isWeixin()){
                domUtil.addEvent(this._videoNode, "x5videoenterfullscreen", this._onx5VideoEnterFullScreen.bind(this));
                domUtil.addEvent(this._videoNode, "x5videoexitfullscreen", this._onx5VideoExitFullScreen.bind(this));
            }
        }
    }

    // 外部获取video节点
    getVideoNode() {
        return this._videoNode || null;
    }

    // 设置movieData
    setMovieData(movieData){
        this._movieData = movieData;
    }

    /**
     * 外部调用load方法开始加载并自动播放，如果设置了beforePlay则加载后先暂停并抛出事件
     */
    load(movieData){
        // 子类实现
        logUtil.log('load moivedata');

        this._setState(Constant.MEDIA_STATE.BUFFERING);
        
        if (!this._videoNode) {
            this._initTech();
        }

        // 视频数据项
        this._movieData = movieData || this._movieData; // 如果没有提供数据，可能是重新再次播放旧数据
        this._item = this._movieData.currentMovieItem; 

        // 加载前操作，还不支持异步
        this._doBeforeLoad();

        // 重置状态
        this._hasGetMetaData = false;
        this._hasAutoSeek = false;

        this._hasDoLoad = true;

        // 重置错误次数
        if(!this._isNotFirst){ 
            this._errorCount = 0;    
        } 

        // 发送当前清晰度事件
        // this._doOptionFn(mediaEvent.QUALITY_CHANGE, this._item);

        // 设置音量
        this.volume(this._volume);

        // 设置播放速率
        this.rate(this._rate);
    }

    /**
     * 重新播放一个item，可以用于清晰度切换和线路切换
     */
    reload(movieData){
        movieData = movieData || this._movieData;

        // 直播重新加载都是从0开始
        if(this._cfg.mode == 'live'){
            movieData.start = 0;
        }else{ // 点播需要从上次position开始
            // 从上次播放的进度开始播，这里直接修改了item的start，最好不要直接修改
            movieData.start = this._position || this._movieData.start || 0; 
        }
        
        this._isNotFirst = true;

        this.stop();
        this.load(movieData);
    }

    // 加载前的操作
    _doBeforeLoad() {
        if(this._cfg.beforeLoad && !this._movieData.hasDoBeforeLoad){
            this._movieData.hasDoBeforeLoad = true;

            this._doOptionFn(mediaEvent.BEFORE_LOAD);
        }
    }

    _catchPlay() {
        let playPromise = this._videoNode.play(); // ios中必须调用一次，否则无法自动开始播放

        // catch解决了 The play() request was interrupted 的问题
        if(playPromise && playPromise.catch){
            playPromise.then(function(){
                logUtil.log('try to play success');

            }).catch(function (e) {
                logUtil.error('try to play fail');
                // 如果自动播放被浏览器阻止，最好判断提示用户主动开启
                // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#developer-switches
            });
        }
    }

    play() {
        // 如果还没开始加载
        if(!this._hasDoLoad && this._movieData){
            this.load(this._movieData);
            return;
        }

        // 子类实现
        if (this.isCompleted()) {
            this.seek(0); // 重播
            return;
        }
        this._setState(Constant.MEDIA_STATE.PLAYING); // 建议去掉，但是可能部分浏览器会出现bug

        // 子类实现播放
    }

    pause() {
        this._setState(Constant.MEDIA_STATE.PAUSE); // 建议去掉，但是可能部分浏览器会出现bug

        // 子类实现暂停
    }

    _seek(pos){
        // 子类实现seek
        logUtil.log('_seek');
        if(this._canSeek()){
            try{
                this._videoNode.currentTime = pos;
            }catch(error){
                logUtil.log(error.message);
            }
        }
    }

    seek(_data){
        if(this._canSeek()){
            logUtil.log('_canSeek');

            let position = baseUtil.isNumber(_data) ? _data : _data.newData;

            position = (!position || position < 0) ? 0 : position;

            position = position > this._duration ? 0 : position; // 超出就归零

            let old = this._position; 

            this._seek(position);
            
            this._catchPlay(); // 拖动后就播放

            this._doOptionFn(mediaEvent.SEEK, {
                oldData : old,
                newData : position
            });
        }
    }

    seekForward() {
        logUtil.log('seekForward');
        if(this._canSeek()){
            let _p = this._position + Constant.VARCONST.SEEK_STEP > this._duration ? this._duration : this._position + Constant.VARCONST.SEEK_STEP;

            if (this.isCompleted()) {
                _p = 0;
            }

            this._doOptionFn(mediaEvent.SEEK_FORWARD, {
                oldData : {
                    position : this._position,
                    duration : this._duration
                },
                newData : {
                    position : _p,
                    duration : this._duration
                }
            });

            this.seek(_p);
        }
    }

    seekBackward() {
        logUtil.log('seekBackward');
        if(this._canSeek()){
            let _p = this._position - Constant.VARCONST.SEEK_STEP < 0 ? 0 : this._position - Constant.VARCONST.SEEK_STEP;
        
            this._doOptionFn(mediaEvent.SEEK_BACKWARD, {
                oldData : {
                    position : this._position,
                    duration : this._duration
                },
                newData : {
                    position : _p,
                    duration : this._duration
                }
            });

            this.seek(_p);
        }
    }

    // 直接改变音量
    volume(value){
        value = value > 1 ? 1 : (value < 0 ? 0 : value);

        this._videoNode.volume = value;
        this._volume = value;

        if(this._volume == 0){
            this.mute(true);
        }else{
            this.mute(false);
        }

        this._doOptionFn(mediaEvent.VOLUME, value);
    }

    // 音量递增
    volumeIncrease() {
        let _val = this._videoNode.volume;

        _val = (_val + Constant.VARCONST.VOLUME_STEP) > 1 ? 1 : (_val + Constant.VARCONST.VOLUME_STEP);

        this._videoNode.volume = _val;
        this._volume = _val;

        this._doOptionFn(mediaEvent.VOLUME_INCREASE, _val);
    }

    // 音量递减
    volumeDecrease() {
        let _val = this._videoNode.volume;

        _val = (_val - Constant.VARCONST.VOLUME_STEP) < 0 ? 0 : (_val - Constant.VARCONST.VOLUME_STEP);

        this._videoNode.volume = _val;
        this._volume = _val;

        this._doOptionFn(mediaEvent.VOLUME_DECREASE, _val);
    }

    mute(muted){
        this._videoNode.muted = muted;
        this._mute = muted;

        this._doOptionFn(mediaEvent.MUTE, muted);
    }

    stop() {
        this.pause();

        this.clear();

        // 空闲状态
        this._setState(Constant.MEDIA_STATE.IDLE);
    }
    
    getState(){
        return this._state;
    }

    getPosition(){
        return this._position;
    }

    isCompleted(){
        return this._videoNode.ended;
    }

    rate(value){
        // 直播不能设置倍速，先放这里。如果直播播放器拆出来最好这个逻辑也拆一下
        if(this._cfg.mode == 'live'){
            value = 1;
        }else{
            value = value || 1;
        }

        this._videoNode.defaultPlaybackRate = value;
        this._videoNode.playbackRate = value;
        this._rate = value;

        // 倍速事件
        this._doOptionFn(mediaEvent.RATE_CHANGE, value);
    }

    // 检测是否卡顿，与视频云逻辑保持一致
    isBlock() {
        this._isbLastFrameCount = this._isbLastFrameCount || 0;

        let calcFrame;

        if (this._videoNode.webkitDecodedFrameCount) {
            this._isbNowFrameCount = this._videoNode.webkitDecodedFrameCount;
            calcFrame = this._isbNowFrameCount - this._isbLastFrameCount;

            this._isbLastFrameCount = this._isbNowFrameCount;
        } else if (this._videoNode.mozDecodedFrames) {

            this._isbNowFrameCount = this._videoNode.mozDecodedFrames;
            calcFrame = this._isbNowFrameCount - this._isbLastFrameCount;

            this._isbLastFrameCount = this._isbNowFrameCount;
        }

        return calcFrame != undefined && calcFrame <= 10;
    }

    // 原帅帧率，暂时没有
    metaFPS() {
        return 0;
    }

    // 返回距离上次检测后播放的帧数，如果要计算帧率可以每秒调用一次
    currentFPS() {
        this._cfpsLastFrameCount = this._cfpsLastFrameCount || 0;

        let calcFrame = 0;

        if (this._videoNode.webkitDecodedFrameCount) {
            this._cfpsNowFrameCount = this._videoNode.webkitDecodedFrameCount;
            calcFrame = this._cfpsNowFrameCount - this._cfpsLastFrameCount;

            this._cfpsLastFrameCount = this._cfpsNowFrameCount;
        } else if (this._videoNode.mozDecodedFrames) {
            this._cfpsNowFrameCount = this._videoNode.mozDecodedFrames;
            calcFrame = this._cfpsNowFrameCount - this._cfpsLastFrameCount;

            this._cfpsLastFrameCount = this._cfpsNowFrameCount;
        }

        return calcFrame;
    } 

    // 返回下载的字节，如果要计算kbps可以每秒调用一次
    currentKbps() {
        this._cfpslastByteLoaded = this._cfpslastByteLoaded || 0;

        let calcByte = 0;

        if (this._videoNode.webkitVideoDecodedByteCount) {
            this._cfpsNowByteLoaded = this._videoNode.webkitVideoDecodedByteCount;
            calcByte = this._cfpsNowByteLoaded - this._cfpslastByteLoaded;

            this._cfpslastByteLoaded = this._cfpsNowByteLoaded;
        }

        return calcByte * 8 / 1000;
    }

    _canSeek() {
        return (!!this._duration && isFinite(this._duration) && !!this._hasGetMetaData) || this._cfg.mode == 'live';
    }

    /** 以下为事件处理 **/

    // 设置状态
    _setState(newState) {
        if(this._state != newState){
            // 发出事件
            this._doOptionFn(mediaEvent.STATE, {
                newState : newState,
                oldState : this._state
            });

            this._state = newState;
        }
    }

    // 获得meta
    _onvideoLoadedmetadata(e) {
        if(!!this._hasGetMetaData){
            return;
        }

        // 当前视频时长
        this._duration = this._videoNode.duration;

        // 加密视频中的 videoNode.duration 可能不能马上取到
        if ((this._videoNode.duration && isFinite(this._videoNode.duration)) || this._cfg.mode == 'live'){
            this._doMetaReady();
        }else{
            this._checkDuration();
        }
    }

    // 检测视频时长是否获取到了
    _checkDuration() {
        if(!this._videoNode){
            if(this._checkMetaTimer){
                clearInterval(this._checkMetaTimer);
                this._checkMetaTimer = null;
            }
            return;
        }

        let c = 0;
        this._checkMetaTimer = setInterval(function(){
            c++;

            if (c >= 50 && !this._videoNode.duration) { // check多次还是没有时间则使用movieData里面的duration
                clearInterval(this._checkMetaTimer);
                this._checkMetaTimer = null;
                this._duration = this._movieData.duration || 0;
                this._doMetaReady();
                return;
            }

            if (this._videoNode.duration && isFinite(this._videoNode.duration)) { 
                clearInterval(this._checkMetaTimer);
                this._checkMetaTimer = null;
                this._duration  = this._videoNode.duration;
                this._doMetaReady();
                return;
            }
        }.bind(this), 200);
    }

    _doMetaReady() {
        this._hasGetMetaData = true;

        let data = {
            duration : Math.floor(this._duration),
            width: this._videoNode.videoWidth,
            height: this._videoNode.videoHeight
        };

        // 触发meta事件
        this._doOptionFn(mediaEvent.META, data);
    }

    // 播放进度
    _onvideoTimeupdate(e) {
        if(!this._videoNode) return;

        // 时长校准
        if (this._videoNode.duration && isFinite(this._videoNode.duration)) { 
            this._duration  = this._videoNode.duration;
        }

        let data = {
            currentTime : Math.floor(this._videoNode.currentTime),
            // currentTime : this._videoNode.currentTime, // 可能有些影响
            duration : Math.floor(this._videoNode.duration)
        };

        this._position = data.currentTime;

        this._doOptionFn(mediaEvent.TIME, data);
        
        if(this._state != Constant.MEDIA_STATE.PAUSE && this._state != Constant.MEDIA_STATE.PLAYING){
            this._setState(Constant.MEDIA_STATE.PLAYING);
        }
    }

    // 加载进度
    _onvideoProgress(e) {
        this._doOptionFn(mediaEvent.BUFFER, {
            bufferPercent : this._getBufferedPercent()
        });
    }

    _getBufferedPercent() {        
        let buffered = this._videoNode.buffered, end = 0;
        let ba, be;

        if (!buffered || buffered.length < 1) {
            return 0;
        }else if (buffered && buffered.length == 1) {
            end = Math.floor(buffered.end(0));
        }else{
            let _p = this._videoNode.currentTime || 0;

            for(let i = 0, l = buffered.length; i < l ;i++){
                ba = Math.floor(buffered.start(i));
                be = Math.floor(buffered.end(i));

                if (_p <= be && _p >= ba) {
                    end = Math.floor(buffered.end(i));
                }            }

            if (!end) {
                end = Math.floor(buffered.end(buffered.length - 1));
            }        }

        return this._duration ? (end / this._duration) : 0;
    }

    // 播放
    _onvideoPlaying(e) {
        this._setState(Constant.MEDIA_STATE.PLAYING);
        logUtil.log('_onvideoPlaying');
    }

    // 暂停
    _onvideoPause(e) {
        this._setState(Constant.MEDIA_STATE.PAUSE);
        logUtil.log('_onvideoPause');
    }

    // 等待
    _onvideoWaiting(e) {
        this._setState(Constant.MEDIA_STATE.BUFFERING);
        logUtil.log('_onvideoWaiting');
    }

    // 先注释掉，如果在seeking时设置状态，会影响其他状态
    _onvideoSeeking(e) {
        logUtil.log('_onvideoSeeking');
    }

    // 寻找完毕
    _onvideoSeeked(e) {
        logUtil.log('_onvideoSeeked');

    }

    // x5内核浏览器全屏
    _onx5VideoEnterFullScreen() {
        domUtil.setStyle(this._videoNode, 'width', window.screen.width + 'px');
        domUtil.setStyle(this._videoNode, 'height', window.screen.height + 'px');
        domUtil.addClassName(document.body, 'z-x5-video-fullscreen');
    }

    // x5内核浏览器退出全屏
    _onx5VideoExitFullScreen() {
        domUtil.setStyle(this._videoNode, 'width', '');
        domUtil.setStyle(this._videoNode, 'height', '');
        domUtil.delClassName(document.body, 'z-x5-video-fullscreen');
        domUtil.delClassName(document.body, 'z-x5-video-fullscreen-landscape');
        // 退出后需要设置为竖屏全屏，x5内核
        domUtil.attr(this._videoNode, 'x5-video-orientation', 'portrait');
    }

    // 播放完毕
    _onvideoEnded(e) {        
        this._setState(Constant.MEDIA_STATE.COMPLETE);
    }
    
    // video错误
    _onvideoError(e) {
        if (!this._checkErrorCount()) {
            return;
        }

        this.stop();

        this._doOptionFn(mediaEvent.ERROR, {
            code : Constant.ERROR_CODE.MEDIA_ERROR_VIDEO_ERROR,
            message : this._formatVideoNodeError(e)
        });
    }

    _formatVideoNodeError(e) {
        if(e.target && e.target.error){
            return 'media error:' + e.target.error.code
        }

        return null
    }

    // 检查错误的次数，超过一定数量则重新加载
    _checkErrorCount() {
        // 一般是网络错误，具体信息见
        if(this._errorCount < 1){ // 改为重试一次
            this._errorCount++;
            this.reload();
            return false;
        }

        return true;
    }

    // 回收
    clear() {
        // 子类先销毁组件

        if (this._videoNode) {
            this._clearVideoEvent();

            // 删除节点
            this._videoParentNode.removeChild(this._videoNode);

            this._videoNode = null;
        }    }

    // 解绑事件
    _clearVideoEvent() {
        if (this._videoNode) {
            domUtil.clearEvent(this._videoNode, 'loadedmetadata');
            domUtil.clearEvent(this._videoNode, 'ended');
            domUtil.clearEvent(this._videoNode, 'error');
            domUtil.clearEvent(this._videoNode, 'pause');
            domUtil.clearEvent(this._videoNode, 'play');
            domUtil.clearEvent(this._videoNode, 'playing');
            domUtil.clearEvent(this._videoNode, 'progress');
            domUtil.clearEvent(this._videoNode, 'seeked');
            domUtil.clearEvent(this._videoNode, 'seeking');
            domUtil.clearEvent(this._videoNode, 'timeupdate');
            domUtil.clearEvent(this._videoNode, 'waiting');
            //_domUtil.clearEvent(this._videoNode, 'canplaythrough');

            if (envUtil$1.isWeixin() && envUtil$1.isAndroid() && this._cfg.x5Fullscreen) {
                domUtil.clearEvent(this._videoNode, "x5videoenterfullscreen");
                domUtil.clearEvent(this._videoNode, "x5videoexitfullscreen");
            }
        }
    }
}

/**
 * native video media
 */

class NativeVideoMedia extends BaseMedia{
    constructor(parentNode, playerConfig, options) {
        super(parentNode, playerConfig, options);
    }

    // 设置视频source和事件
    _setSourceNode(urls){
        this._clearSourceEvent();
        this._removeSourceNode();

        urls.forEach(function(src){
            if(!src) return;

            // 判断视频类型
            var _mimeType = mediaUtil.getVideoMIMEType(src);

            if(!_mimeType){
                this._doOptionFn(mediaEvent.ERROR, Constant.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT);
                return;
            }

            // 个别手机检测不可靠
            if (!mediaUtil.checkVideoCanPlay(_mimeType)) {
                this._doOptionFn(mediaEvent.ERROR, Constant.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT);
                return;
            }
            var se = domUtil.createEl('source', {
                src : src,
                type : _mimeType.split(';')[0] // 可能有多个
            });

            this._videoNode.appendChild(se);
        }.bind(this));

        // for(let s of _domUtil.getByTagName('source', this._videoNode)){
        //     console.log(s.src);
        // }

        this._sourceNodes = baseUtil.makeArray(domUtil.getByTagName('source', this._videoNode));

        // 绑定事件
        this._initSourceEvent();   

    }

    // 删除source节点
    _removeSourceNode(){
        if (this._sourceNodes) {
            this._sourceNodes.forEach((node, index) => {
                this._videoNode.removeChild(node);
            });

            this._sourceNodes.length = 0;
        }
        this._sourceNodes = null;
    }

    // 绑定source节点事件
    _initSourceEvent(_sourceNode){
        this._sourceNodes.forEach((_item, _index) => {
            domUtil.addEvent(_item, 'error', this._onsourceError.bind(this));
        });
    }

    /**
     * 外部调用load方法开始加载并自动播放，如果设置了beforePlay则加载后先暂停并抛出事件
     */
    load(movieData){
        super.load(movieData);

        // 设置视频地址
        this._setSourceNode(this._item.urls);
    
        this._videoNode.load();

        // 重新加载后直接开始播放
        // 非预加载直接开始播放
        // 移动端直接开始播放
        if(this._isNotFirst || !this._cfg.isPreload || envUtil$1.isMobileAll()){
            this._catchPlay();  // ios必须在load后调用play，web端则不需要
        }
        
    }

    play(){
        super.play();

        this._catchPlay();
    }

    pause(){
        super.pause();

        if(this._videoNode){
            this._videoNode.pause();
        }
    }

    /** 以下为事件处理 **/

    // 自动seek，在点播视频加载到meta后执行
    _autoSeek(){
        if (!this._canSeek()) {
            return;
        }

        if (this._hasAutoSeek) {
            this._doPreloadPause();
            return; 
        }

        if(this._movieData.start > 0){ 
            this._seek(this._movieData.start); 
            logUtil.log('html5 video do autoseek');

            this._doPreloadPause();

        }else{
            this._doPreloadPause();

            this._hasAutoSeek = true;
        }
    }

    _doPreloadPause(){
        if(this._cfg.isPreload && !this._hasDoPreload){
            this._hasDoPreload = true;
            this.pause(); // 主动暂停
        }else{
            this.play();
        }
    }

    // 预加载或者播放前的操作，只支持点播
    _doBeforePlay(){
        if(!this._hasGetMetaData || this._cfg.mode == 'live'){
            return;
        }

        //移动端点播的自动seek
        if(!this._hasAutoSeek && envUtil$1.isMobileAll()){ 
            this._autoSeek();
            return;
        }

        // 播放前处理
        if(this._cfg.beforePlay && !this._hasDoBeforePlay && this._state == Constant.MEDIA_STATE.PLAYING){
            this._hasDoBeforePlay = true;

            // 不暂停，交给监听的组件处理

            this._doOptionFn(mediaEvent.BEFORE_PLAY);
            return;
        }
    }

    _doMetaReady(){
        super._doMetaReady();

        if(!envUtil$1.isMobileAll()){ // ios上直接auto seek会失败，可以在timeupdate时auto seek
            this._autoSeek();
        }
    }

    // 预加载或者播放前的操作，只支持点播
    _doPreloadAndBeforePlay(){
        if(!this._hasGetMetaData || !this._hasAutoSeek || this._cfg.mode == 'live'){
            return;
        }

        // 播放前处理
        if(this._cfg.beforePlay && !this._movieData.hasDoBeforePlay && this._state == Constant.MEDIA_STATE.PLAYING){
            this._movieData.hasDoBeforePlay = true;

            this._doOptionFn(mediaEvent.BEFORE_PLAY);
            return false;
        }

        return true;
    }

    // 播放进度
    _onvideoTimeupdate(e){
        this._doBeforePlay();

        super._onvideoTimeupdate(e);
    }

    // 寻找完毕
    _onvideoSeeked(e){
        // 自动seek完成
        if (!this._hasAutoSeek) {
            this._hasAutoSeek = true;
            this._isAutoSeeking = false;
        }
        // seek之后不要调用play或者pause，很容易引起状态混乱
    }

    // source错误
    _onsourceError(e){
        if (!this._checkErrorCount()) {
            return;
        }
        
        this.stop();

        // 一般是网络错误，具体错误信息还不知道用哪个属性
        this._doOptionFn(mediaEvent.ERROR, {
            code : Constant.ERROR_CODE.MEDIA_ERROR_SOURCE_ERROR,
            message : this._formatVideoNodeError(e)
        });
    }

    // 回收
    clear(){
        if (this._videoNode) {
            this._clearSourceEvent();
            this._removeSourceNode();
        }
        super.clear();  
    }

    _clearSourceEvent(){
        if (this._sourceNodes) {
            this._sourceNodes.forEach((_item, _index) => {
                domUtil.clearEvent(_item, 'error');
            });
        }    }

}

/**
 * format util
 */
// 格式化视频时间
function formatVideoTime(_seconds){
    _seconds = (_seconds || 0);
    let _minute = parseInt(_seconds / 60);
    let _second = parseInt(_seconds % 60);
    
    return (_minute < 10 ? '0'+_minute : _minute) + ':' + (_second < 10 ? '0'+_second : _second);
}

var formatUtil = {
    formatVideoTime
};

/**
 * full screen util
 */

let _reg = /[\s\r\n]+/gi;

class FullscreenHelper{
    constructor(callback){
        this.callback = callback;

        this.isFullScreenMode = false,
        this.fullscreenNode = null,
        this.hasBindFullscreenchange = false;

        this.addStyle('\
            .videoplayer-bodyfullWindow{\
                padding:0;\
                margin:0;\
                height:100%;\
                overflow-y:auto;\
                -webkit-text-size-adjust:none;\
                -moz-text-size-adjust:none;\
                -ms-text-size-adjust:none;\
                text-size-adjust:none;\
            }\
            .videoplayer-fullWindow{\
                position:fixed;\
                overflow:hidden;\
                z-index:2147483647;\
                left:0;\
                top:0;\
                bottom:0;\
                right:0;\
                width:100% !important;\
                height:100% !important;\
            }\
        ');
    }

    // 插入style标签，未测试兼容性
    addStyle(css) {
        css = (css||'').replace(_reg,' ').trim();

        let node = null;
        if (!!css){
            node = domUtil.createEl('style');
            document.head.appendChild(node);
            node.textContent = css;
        }

        return node;
    }

    // 获取当前全屏状态
    getfullScreenState() {
        if(document.fullscreen !== undefined){
            return document.fullscreen;
        }else if(document.webkitIsFullScreen !== undefined){
            return document.webkitIsFullScreen;
        }else if(document.mozFullScreen !== undefined){
            return document.mozFullScreen;
        }else{
            return isFullScreenMode;
        }
    }

    // 进入全屏
    enterfullScreen(rootNode) {
        this.isFullScreenMode = true;
        this.fullscreenNode = rootNode;

        // 绑定fullscreenchange事件
        if(!this.hasBindFullscreenchange){
            document.onfullscreenchange = this.onfullScreenChange.bind(this);
            document.onwebkitfullscreenchange = this.onfullScreenChange.bind(this);
            document.onmozfullscreenchange = this.onfullScreenChange.bind(this);

            this.hasBindFullscreenchange = true;
        }

        if(baseUtil.isFunction(rootNode.requestFullScreen)){
            rootNode.requestFullScreen();
        }else if(baseUtil.isFunction(rootNode.webkitRequestFullScreen)){
            rootNode.webkitRequestFullScreen();
        }else if(baseUtil.isFunction(rootNode.mozRequestFullScreen)){
            rootNode.mozRequestFullScreen();
        }else if(canFullscreenVideo(rootNode) && envUtil.isMobileAll()){
            enterVideoFullWindow(rootNode);
        }else{
            enterfullWindow(rootNode);
        }
    }

    canFullscreenVideo(rootNode) {
        let videoNode = this.getVideoNodeFromRoot(rootNode);
        return videoNode && baseUtil.isFunction(videoNode.webkitEnterFullscreen);
    }

    getVideoNodeFromRoot(rootNode) {
        let videoNode = null;

        if(rootNode.tagName.toLowerCase() == 'video'){
            videoNode = rootNode;
        }else{
            let vs = domUtil.getByTagName(rootNode, 'video');
            if(vs && vs.length == 1){ // 这里最好判断video节点标志，防止节点选错了，因为可能有多个video节点
                videoNode = vs[0];
            }
        }

        return videoNode;
    }

    // 退出全屏
    existfullScreen() {
        let ret = true;

        if(!this.isFullScreenMode) {
            ret = false;
        }

        this.isFullScreenMode = false;

        // 退出全屏是document的方法
        if(baseUtil.isFunction(document.exitFullscreen)){
            let p = document.exitFullscreen();
            p && p.catch && p.catch(function(e){
                console.log(e); // 可能会出现错误
            });
            
        }else if(baseUtil.isFunction(document.webkitCancelFullScreen)){
            document.webkitCancelFullScreen();
        }else if(baseUtil.isFunction(document.mozCancelFullScreen)){
            document.mozCancelFullScreen();
        }else {
            existfullWindow();
        }
        
        return ret;
    }

    // 进入fullwindow
    enterfullWindow(rootNode) {
        domUtil.addEvent(document, 'keydown', this.fullWindowOnEscKey.bind(this));

        domUtil.addClassName(document.body, 'videoplayer-bodyfullWindow'); // 样式类需要自动插入到页面
        domUtil.addClassName(rootNode, 'videoplayer-fullWindow');

        // 发出消息
        this.callback && this.callback(this.isFullScreenMode);
    }

    // 退出fullwindow
    existfullWindow() {
        domUtil.clearEvent(document, 'keydown', this.fullWindowOnEscKey.bind(this));

        domUtil.delClassName(document.body, 'videoplayer-bodyfullWindow');
        domUtil.delClassName(this.fullscreenNode, 'videoplayer-fullWindow');

        // 发出消息
        this.callback && this.callback(this.isFullScreenMode);
    }

    // 进入video fullwindow
    enterVideoFullWindow(rootNode) {
        // video全屏一般在ios上使用，全屏后变成系统的ui，用户需要主动点击退出全屏
        this.isFullScreenMode = false; // 自己的ui状态还是保持不变
        this.getVideoNodeFromRoot(rootNode).webkitEnterFullscreen(); 

        // 发出消息
        this.callback && this.callback(this.isFullScreenMode);
    }

    // 监听fullscreenchange事件
    onfullScreenChange(event){
        this.isFullScreenMode = this.getfullScreenState(); // 同步一下状态，否则可能会混乱

        // 发出消息
        this.callback && this.callback(this.isFullScreenMode);
    }

    // 按esc键退出fullwindow
    fullWindowOnEscKey(event){
        event = getEvent(event);

        if (event.keyCode === 27) {
            if (this.isFullScreenMode == true) {
                this.existfullScreen();
            }
        }
    }
}

/**
 * default config
 */
var defaultConfig = {
    mode: 'playback', // or live
    autoStart: false,
    isPreload: false,
    beforeLoad: false,
    beforePlay: false,
    mute: false,
    volume: 0.8,
    rate: 1,
    x5Fullscreen: false,
    useNativeUI: false
};

/**
 * index
 */

let localDefaultConfig = Object.assign({}, defaultConfig);

function setDefaultConfig(config) {
    localDefaultConfig = Object.assign({}, localDefaultConfig, config || {});
}

class VideoBase {
    constructor(options) {
        if(options.parent){
            this._parentNode = options.parent;
        }

        this._emitter = new events();

        this.getReactiveState();

        this._invokeConfig(options.config, c => {
            this._config = c;

            // video data
            if(options.videoData){
                this.setVideoData(options.videoData);
            }
        });   
    }

    _invokeConfig(customConfig, callback){
        let config = Object.assign({}, localDefaultConfig, customConfig || {});

        // 移动端禁止片头功能，系统无法同时创建两个video
        config.beforePlay = envUtil$1.isMobileAll() && config.beforePlay;
       
        // 自动播放配置
        mediaUtil.supportAutoPlay(config, function(canAutoPlay){
            // 如果开启了自动播放则忽略预加载
            if (config.autoStart) {
                if(canAutoPlay){ 
                    config.isPreload = false;
                }else{  // 如果开启了自动播放但是不允许则改为自动预加载
                    config.autoStart = false;
                    config.isPreload = true;
                }
            }
            // 如果是直播模式则没有预加载
            if (config.mode == 'live' || envUtil$1.isMobileAll()) {
                config.isPreload = false;
            }

            if(config.useNativeUI){
                config.autoStart = true;
            }

            callback(config);
        });
    }

    _videoDataReady(videoData) {
        this._videoData = videoData;

        // 销毁旧的
        if(this._videoMediaIns){
            this._videoMediaIns.clear();
            this._videoMediaIns = null;
        }

        if(!this._parentNode){
            throw new Error('no parent node');
        }

        this._createMediaIns((ins) => {
            this._videoMediaIns = ins;

            // 如果是自动播放则马上加载，否则等待
            if (this._config.autoStart || this._config.isPreload) { 
                this._videoMediaIns.load(this._videoData);
            }else{
                // 先设置数据
                this._videoMediaIns.setMovieData(this._videoData);
            }
        });
    }

    _createMediaIns(callback) {
        let _options = {};

        Object.keys(mediaEvent).forEach((key) => {
            _options[mediaEvent[key]] = this._mediaEventHandler.bind(this);
        });

        // _mediaSwitch(this._parentNode, this._videoData, this._config, _options, callback);
        callback && callback(new NativeVideoMedia(this._parentNode, this._config, _options)); // test
    }   

    _mediaEventHandler(event) {
        if(this.reactiveState){
            this.updateReactiveState(event);
        }

        try{
            this._emitter.emit(event.type, event.data);
        }catch(err){
            // 如果没有注册error事件处理方法，则抛出异常
            console.error('Unhandled video-base error');
        }
        
    }

    destroy(){
        if (this._videoMediaIns) {
            this._videoMediaIns.stop();
            this._videoMediaIns = null;
        }

        this._emitter.removeAllListeners();
        this._emitter = null;
    }

    attachParent(parent) {
        this._parentNode = parent;
    }

    getVideoNode(){
        return this._videoMediaIns && this._videoMediaIns.getVideoNode();
    }

    on(event, listener) {
        this._emitter.addListener(event, listener);
    }

    off(event, listener) {
        this._emitter.removeListener(event, listener);
    }

    setVideoData(data) {
        if (!data) {
            return;
        }
        // invoke video data
        let _options = {};
        Object.keys(videoDataEvent).forEach((key) => {
            _options[videoDataEvent[key]] = this._videoDataEventHandler.bind(this);
        });
        let nvd = new VideoData(data, this._config, _options);

        this._videoDataReady(nvd);
    }

    _videoDataEventHandler(event) {
        if(this.reactiveState){
            this.updateReactiveState(event);
        }

        try{
            this._emitter.emit(event.type, event.data);
        }catch(err){
            // 如果没有注册error事件处理方法，则抛出异常
            console.error('Unhandled video-base error');
        }
    }

    getReactiveState() {
        if(!this.reactiveState){
            this.reactiveState = {
                videoData: null,
                error: null,
                line: null,
                lineName: '',
                quality: null,
                qualityName: '',
                qualityCount: 0,
                duration: 0,
                currentTime: 0,
                buffered: 0,
                state: null,
                volume: 0,
                mute: false,
                rate: 1,
                fullscreen: false
            };
        }

        return this.reactiveState;
    }

    updateReactiveState(event) {
        switch(event.type){
            case videoDataEvent.VIDEO_DATA_READY:
                this.reactiveState.videoData = event.data;

                if(event.data.currentLine){
                    this.reactiveState.line = event.data.currentLine.type;
                    this.reactiveState.lineName = event.data.currentLine.name;
                }
                
                if(event.data.currentMovieItem){
                    this.reactiveState.quality = event.data.currentMovieItem.quality;
                    this.reactiveState.qualityName = event.data.currentMovieItem.qualityName;
                }

                this.reactiveState.qualityCount = event.data.qualityCount;
                
                break;
            case videoDataEvent.LINE_CHANGE:
                this.reactiveState.line = event.data.currentLine.type;
                this.reactiveState.lineName = event.data.currentLine.name;
                break;
            case videoDataEvent.QUALITY_CHANGE:
                this.reactiveState.quality = event.data.quality;
                this.reactiveState.qualityName = event.data.qualityName;
                break;

            case mediaEvent.STATE:
                this.reactiveState.state = event.data.newState;             
                break;
            case mediaEvent.META:
                this.reactiveState.duration = event.data.duration;                
                break;
            case mediaEvent.TIME:
                this.reactiveState.currentTime = event.data.currentTime;
                this.reactiveState.duration = event.data.duration;                
                break;
            case mediaEvent.BUFFER:
                this.reactiveState.buffered = event.data.bufferPercent;
                break;
            case mediaEvent.ERROR:
                this.reactiveState.error = event.data;
                break;
            case mediaEvent.RATE_CHANGE:
                this.reactiveState.rate = event.data.rate;
                break;
            case mediaEvent.VOLUME:
                this.reactiveState.volume = event.data.volume;
                break;
            case mediaEvent.MUTE:
                this.reactiveState.mute = event.data.mute;
                break;
            case mediaEvent.FULLSCREEN:
                this.reactiveState.fullscreen = event.data;
                break;
        }
    }

    load() {
        if (!this._videoData || !this._videoMediaIns) {
            return;
        }
        this._videoMediaIns.load(this._videoData);
    }

    reload(){
        if (!this._videoData || !this._videoMediaIns) {
            return;
        }
        this._videoMediaIns.reload();
    }

    changeQuality(quality) {
        this._videoData && this._videoData.changeQuality(quality);

        this.reload();
    }

    changeLine(line) {
        this._videoData && this._videoData.changeLine(line);

        this.reload();
    }

    fullscreen(rootNode) {
        if(!this.fullscreenHelper){
            this.fullscreenHelper = new FullscreenHelper((isFullscreen) => {
                this.updateReactiveState({
                    type: mediaEvent.FULLSCREEN,
                    data: isFullscreen
                });
            });
        }

        this.fullscreenHelper.enterfullScreen(rootNode);
    }

    existFullscreen() {
        this.fullscreenHelper && this.fullscreenHelper.existfullScreen();
    }
}
function mixinVideoAPI(Clazz) {
    [
        'seek',
        'seekForward',
        'seekBackward',
        'play',
        'ppause',
        'stop',
        'pause',
        'volume',
        'volumeIncrease',
        'volumeDecrease',
        'mute',
        'rate',
        'getPosition',
        'getState',
        'isBlock',
        'metaFPS',
        'currentFPS',
        'currentKbps'
    ].map((key) => {
        Clazz.prototype[key] = (function(fn) {
            return function(...args){
                return this._videoMediaIns && baseUtil.isFunction(this._videoMediaIns[fn]) && this._videoMediaIns[fn](...args);
            }
        })(key);
    });
}

mixinVideoAPI(VideoBase);

// util api
const util = {
    formatUtil,
    envUtil: envUtil$1,
    logUtil,
    mediaUtil,
    domUtil
};

const constant = Constant;

export default VideoBase;
export { constant, setDefaultConfig, util };
