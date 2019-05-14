/**
 * base media class
 */
import _constant from '../constant';
import {mediaEvent} from '../event';
import _logUtil from '../util/logUtil';
import _mediaUtil from '../util/mediaUtil';
import _domUtil from '../util/domUtil';
import _baseUtil from '../util/baseUtil';
import envUtil from '../util/envUtil';

export default class BaseMedia {
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
        this._setState(_constant.MEDIA_STATE.IDLE);
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

        if (!_mediaUtil.supportVideo()) {
            this._doOptionFn(mediaEvent.ERROR, _constant.ERROR_CODE.MEDIA_ERROR_VIDEOTAG_NOT_SUPPORT);
            return;
        };

        if (!!this._videoNode) return;

        var attrs = {};

        if(this._cfg.autoStart){
            attrs.autoplay = '';
        }

        if (envUtil.isMobileAll()) {
            attrs['playsinline'] = '';
            attrs['webkit-playsinline'] = '';
        }

        if (envUtil.isWeixin() && envUtil.isAndroid() && this._cfg.x5Fullscreen) {
            _logUtil.log('this._cfg.x5Fullscreen');
            attrs['x5-video-player-type'] = 'h5';
            attrs['x5-video-player-fullscreen'] = 'true';
        }

        if(this._cfg.useNativeUI){ // 直接使用video标签默认的ui
            attrs.controls = 'controls';
        }

        // video节点
        this._videoNode = _domUtil.createEl('video', attrs);

        // 添加到父元素
        this._videoParentNode.appendChild(this._videoNode);

        _logUtil.log('create video node complete');
    }

    _initVideoNodeEvent() {
        if (this._videoNode) {
            _domUtil.addEvent(this._videoNode, "loadstart", function(){
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

            _domUtil.addEvent(this._videoNode, "canplaythrough", function(){ 
                _logUtil.log('canplaythrough');

                if(!this._state == _constant.MEDIA_STATE.PAUSE){
                    this._onvideoPlaying();
                }
                
            }.bind(this));
            _domUtil.addEvent(this._videoNode, "canplay", function(){ 
                _logUtil.log('canplay');
            }.bind(this));

            _domUtil.addEvent(this._videoNode, "loadedmetadata", this._onvideoLoadedmetadata.bind(this));
            _domUtil.addEvent(this._videoNode, "ended", this._onvideoEnded.bind(this));
            _domUtil.addEvent(this._videoNode, "error", this._onvideoError.bind(this));
            _domUtil.addEvent(this._videoNode, "playing", this._onvideoPlaying.bind(this));
            _domUtil.addEvent(this._videoNode, "progress", this._onvideoProgress.bind(this));
            _domUtil.addEvent(this._videoNode, "seeked", this._onvideoSeeked.bind(this));
            _domUtil.addEvent(this._videoNode, "seeking", this._onvideoSeeking.bind(this));
            _domUtil.addEvent(this._videoNode, "timeupdate", this._onvideoTimeupdate.bind(this));
            _domUtil.addEvent(this._videoNode, "waiting", this._onvideoWaiting.bind(this));
            _domUtil.addEvent(this._videoNode, "play", this._onvideoPlaying.bind(this));
            _domUtil.addEvent(this._videoNode, "pause", this._onvideoPause.bind(this));

            if(envUtil.isWeixin()){
                _domUtil.addEvent(this._videoNode, "x5videoenterfullscreen", this._onx5VideoEnterFullScreen.bind(this));
                _domUtil.addEvent(this._videoNode, "x5videoexitfullscreen", this._onx5VideoExitFullScreen.bind(this));
            }
        }
    }

    // 外部获取video节点
    getVideoNode() {
        return this._videoNode || null;
    }

    // 全屏video
    fullscreenVideo() {
        if(this.canFullscreenVideo()){
            this._videoNode.webkitEnterFullscreen();  
        }
    }

    // 是否可以全屏video
    canFullscreenVideo() {
        return this._videoNode && _baseUtil.isFunction(this._videoNode.webkitEnterFullscreen);
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
        _logUtil.log('load moivedata');

        this._setState(_constant.MEDIA_STATE.BUFFERING);
        
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
        var playPromise = this._videoNode.play(), that = this; // ios中必须调用一次，否则无法自动开始播放

        // catch解决了 The play() request was interrupted 的问题
        if(playPromise && playPromise.catch){
            playPromise.then(function(){
                _logUtil.log('try to play success');

            }).catch(function (e) {
                _logUtil.error('try to play fail');
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
        };

        this._setState(_constant.MEDIA_STATE.PLAYING); // 建议去掉，但是可能部分浏览器会出现bug

        // 子类实现播放
    }

    pause() {
        this._setState(_constant.MEDIA_STATE.PAUSE); // 建议去掉，但是可能部分浏览器会出现bug

        // 子类实现暂停
    }

    _seek(pos){
        // 子类实现seek
        _logUtil.log('_seek');
        if(this._canSeek()){
            try{
                this._videoNode.currentTime = pos;
            }catch(error){
                _logUtil.log(error.message);
            }
        }
    }

    seek(_data){
        if(this._canSeek()){
            _logUtil.log('_canSeek');

            var position = _baseUtil.isNumber(_data) ? _data : _data.newData;

            position = (!position || position < 0) ? 0 : position;

            position = position > this._duration ? 0 : position; // 超出就归零

            var old = this._position; 

            this._seek(position);
            
            this._catchPlay(); // 拖动后就播放

            this._doOptionFn(mediaEvent.SEEK, {
                oldData : old,
                newData : position
            });
        }
    }

    seekForward() {
        _logUtil.log('seekForward');
        if(this._canSeek()){
            var _p = this._position + _constant.VARCONST.SEEK_STEP > this._duration ? this._duration : this._position + _constant.VARCONST.SEEK_STEP;

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
        _logUtil.log('seekBackward');
        if(this._canSeek()){
            var _p = this._position - _constant.VARCONST.SEEK_STEP < 0 ? 0 : this._position - _constant.VARCONST.SEEK_STEP;
        
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
        var _val = this._videoNode.volume;

        _val = (_val + _constant.VARCONST.VOLUME_STEP) > 1 ? 1 : (_val + _constant.VARCONST.VOLUME_STEP);

        this._videoNode.volume = _val;
        this._volume = _val;

        this._doOptionFn(mediaEvent.VOLUME_INCREASE, _val);
    }

    // 音量递减
    volumeDecrease() {
        var _val = this._videoNode.volume;

        _val = (_val - _constant.VARCONST.VOLUME_STEP) < 0 ? 0 : (_val - _constant.VARCONST.VOLUME_STEP);

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
        this._setState(_constant.MEDIA_STATE.IDLE);
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

        var calcFrame;

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

        var calcFrame = 0;

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

        var calcByte = 0;

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

        var c = 0;
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

        var data = {
            duration : Math.floor(this._duration),
            width: this._videoNode.videoWidth,
            height: this._videoNode.videoHeight
        }

        // 触发meta事件
        this._doOptionFn(mediaEvent.META, data);
    }

    // 播放进度
    _onvideoTimeupdate(e) {
        // 时长校准
        if (this._videoNode.duration && isFinite(this._videoNode.duration)) { 
            this._duration  = this._videoNode.duration;
        }

        var data = {
            currentTime : Math.floor(this._videoNode.currentTime),
            // currentTime : this._videoNode.currentTime, // 可能有些影响
            duration : Math.floor(this._videoNode.duration)
        };

        this._position = data.currentTime;

        this._doOptionFn(mediaEvent.TIME, data);
        
        if(this._state != _constant.MEDIA_STATE.PAUSE && this._state != _constant.MEDIA_STATE.PLAYING){
            this._setState(_constant.MEDIA_STATE.PLAYING);
        }
    }

    // 加载进度
    _onvideoProgress(e) {
        this._doOptionFn(mediaEvent.BUFFER, {
            bufferPercent : this._getBufferedPercent()
        });
    }

    _getBufferedPercent() {        
        var buffered = this._videoNode.buffered, end = 0;
        var ba, be;

        if (!buffered || buffered.length < 1) {
            return 0;
        }else if (buffered && buffered.length == 1) {
            end = Math.floor(buffered.end(0));
        }else{
            var _p = this._videoNode.currentTime || 0;

            for(var i = 0, l = buffered.length; i < l ;i++){
                ba = Math.floor(buffered.start(i));
                be = Math.floor(buffered.end(i));

                if (_p <= be && _p >= ba) {
                    end = Math.floor(buffered.end(i));
                };
            }

            if (!end) {
                end = Math.floor(buffered.end(buffered.length - 1));
            };
        }

        return this._duration ? (end / this._duration) : 0;
    }

    // 播放
    _onvideoPlaying(e) {
        this._setState(_constant.MEDIA_STATE.PLAYING);
        _logUtil.log('_onvideoPlaying');
    }

    // 暂停
    _onvideoPause(e) {
        this._setState(_constant.MEDIA_STATE.PAUSE);
        _logUtil.log('_onvideoPause');
    }

    // 等待
    _onvideoWaiting(e) {
        this._setState(_constant.MEDIA_STATE.BUFFERING);
        _logUtil.log('_onvideoWaiting');
    }

    // 先注释掉，如果在seeking时设置状态，会影响其他状态
    _onvideoSeeking(e) {
        _logUtil.log('_onvideoSeeking');
    }

    // 寻找完毕
    _onvideoSeeked(e) {
        _logUtil.log('_onvideoSeeked');

    }

    // x5内核浏览器全屏
    _onx5VideoEnterFullScreen() {
        _domUtil.setStyle(this._videoNode, 'width', window.screen.width + 'px');
        _domUtil.setStyle(this._videoNode, 'height', window.screen.height + 'px');
        _domUtil.addClassName(document.body, 'z-x5-video-fullscreen');
    }

    // x5内核浏览器退出全屏
    _onx5VideoExitFullScreen() {
        _domUtil.setStyle(this._videoNode, 'width', '');
        _domUtil.setStyle(this._videoNode, 'height', '');
        _domUtil.delClassName(document.body, 'z-x5-video-fullscreen');
        _domUtil.delClassName(document.body, 'z-x5-video-fullscreen-landscape');
        // 退出后需要设置为竖屏全屏，x5内核
        _domUtil.attr(this._videoNode, 'x5-video-orientation', 'portrait');
    }

    // 播放完毕
    _onvideoEnded(e) {        
        this._setState(_constant.MEDIA_STATE.COMPLETE);
    }
    
    // video错误
    _onvideoError(e) {
        if (!this._checkErrorCount()) {
            return;
        }

        this.stop();

        this._doOptionFn(mediaEvent.ERROR, {
            code : _constant.ERROR_CODE.MEDIA_ERROR_VIDEO_ERROR,
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
        };
    }

    // 解绑事件
    _clearVideoEvent() {
        if (this._videoNode) {
            _domUtil.clearEvent(this._videoNode, 'loadedmetadata');
            _domUtil.clearEvent(this._videoNode, 'ended');
            _domUtil.clearEvent(this._videoNode, 'error');
            _domUtil.clearEvent(this._videoNode, 'pause');
            _domUtil.clearEvent(this._videoNode, 'play');
            _domUtil.clearEvent(this._videoNode, 'playing');
            _domUtil.clearEvent(this._videoNode, 'progress');
            _domUtil.clearEvent(this._videoNode, 'seeked');
            _domUtil.clearEvent(this._videoNode, 'seeking');
            _domUtil.clearEvent(this._videoNode, 'timeupdate');
            _domUtil.clearEvent(this._videoNode, 'waiting');
            //_domUtil.clearEvent(this._videoNode, 'canplaythrough');

            if (envUtil.isWeixin() && envUtil.isAndroid() && this._cfg.x5Fullscreen) {
                _domUtil.clearEvent(this._videoNode, "x5videoenterfullscreen");
                _domUtil.clearEvent(this._videoNode, "x5videoexitfullscreen");
            }
        }
    }
}