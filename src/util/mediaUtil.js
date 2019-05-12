/**
 * media util
 */
import constant from '../constant';
import envUtil from './envUtil';
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
    return envUtil.isMobileAll() || supportMSEH264();
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
        };
    };

    return _canplay;
}

// 获取视频MIMEType
function getVideoMIMEType(src) {
    if(!src) return false;

    let _srcShort = src.split(/\?/)[0]; //判断视频类型
    let _ss = _srcShort.split('.');
    let _fileType = _ss[_ss.length - 1];
    let _mediaType = constant.VIDEO_SOURSE_MIME_TYPE[_fileType];

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
    if(envUtil.isMobileAll()){
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

export default {
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
}