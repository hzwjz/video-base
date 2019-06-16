/**
 * index
 */
import EventEmitter from 'events';
import VideoData from './videoData';
import {mediaEvent, videoDataEvent} from './event';
import NativeVideoMedia from './media/nativeVideoMedia'; 
import FlvVideoMedia from './media/flvVideoMedia'; 
import HlsVideoMedia from './media/hlsVideoMedia';
import formatUtil from './util/formatUtil';
import envUtil from './util/envUtil';
import logUtil from './util/logUtil';
import mediaUtil from './util/mediaUtil';
import domUtil from './util/domUtil';
import baseUtil from './util/baseUtil';
import FullscreenHelper from './util/fullscreenHelper';
import Constant from './constant';
import defaultConfig from './defaultConfig';

let localDefaultConfig = Object.assign({}, defaultConfig);

export function setDefaultConfig(config) {
    localDefaultConfig = Object.assign({}, localDefaultConfig, config || {});
}

export default class VideoBase {
    constructor(options) {
        if(options.parent){
            this._parentNode = options.parent;
        }

        if(options.root){
            this._rootNode = options.root;
        }

        this._emitter = new EventEmitter();

        // inited state
        this.getReactiveState();

        this._invokeConfig(options.config, c => {
            this._config = c;

            // config event
            this._eventHandler({
                type: videoDataEvent.CONFIG_READY,
                data: this._config
            });

            // video data
            if(options.videoData){
                this.setVideoData(options.videoData);
            }
        });   
    }

    _invokeConfig(customConfig, callback){
        let config = Object.assign({}, localDefaultConfig, customConfig || {});

        // 移动端禁止片头功能，系统无法同时创建两个video
        config.beforePlay = envUtil.isMobileAll() && config.beforePlay;
       
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
            };

            // 如果是直播模式则没有预加载
            if (config.mode == 'live' || envUtil.isMobileAll()) {
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
        let insOptions = {}, ins = null, ft = this._videoData.currentMovieItem.fileType;

        Object.keys(mediaEvent).forEach((key) => {
            insOptions[mediaEvent[key]] = this._eventHandler.bind(this);
        });

        if(ft == 'mp4'){
            ins = new NativeVideoMedia(this._parentNode, this._config, insOptions);
        }else if(ft == 'hls'){ // m3u8
            if(mediaUtil.checkVideoCanPlay(constant.VIDEO_SOURSE_MIME_TYPE.m3u8)){ // 浏览器检测不准确
                ins = new NativeVideoMedia(this._parentNode, this._config, insOptions);
            }else{
                /*global Hls*/
                if(!window.Hls){
                    // 加载hls.js
                    domUtil.loadScript(this._config.hlsjs.libUrl, () => {
                        ins = new HlsVideoMedia(this._parentNode, this._config, insOptions);
                        callback && callback(ins);
                    });
                    return;
                }else{
                    ins = new HlsVideoMedia(this._parentNode, this._config, insOptions);
                }
            }
        }else if(ft == 'flv'){ // flv
            if(!window.flvjs){
                // 加载flvjs
                domUtil.loadScript(this._config.flvjs.libUrl, () => {
                    ins = new FlvVideoMedia(this._parentNode, this._config, insOptions);
                    callback && callback(ins);
                });
                return;
            }else{
                ins = new FlvVideoMedia(this._parentNode, this._config, insOptions);
            }
        }

        if(ins){
            callback && callback(ins);
        }
    }

    _eventHandler(event) {
        if(this.reactiveState){
            this.updateReactiveState(event);
        }

        try{
            this._emitter.emit(event.type, event.data);
            console.log('event.type:'+event.type);
            this._emitter.emit('event', {
                type: event.type,
                data: event.data
            });
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
        };

        // invoke video data
        let _options = {};
        Object.keys(videoDataEvent).forEach((key) => {
            _options[videoDataEvent[key]] = this._eventHandler.bind(this);
        });
        
        new VideoData(data, this._config, _options);
    }

    getReactiveState() {
        if(!this.reactiveState){
            this.reactiveState = {
                config: null,
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
            case videoDataEvent.CONFIG_READY:
                this.reactiveState.config = event.data;
                break;
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

                this._videoDataReady(event.data); // data ready
                break;

            case videoDataEvent.LINE_CHANGE:
                this.reactiveState.line = event.data.currentLine.type;
                this.reactiveState.lineName = event.data.currentLine.name;
                break;
            case videoDataEvent.QUALITY_CHANGE:
                this.reactiveState.quality = event.data.quality;
                this.reactiveState.qualityName = event.data.qualityName;
                break;

            case videoDataEvent.ERROR:
                this.reactiveState.error = event.data;
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
                this.reactiveState.rate = event.data;
                break;
            case mediaEvent.VOLUME:
                this.reactiveState.volume = event.data;
                break;
            case mediaEvent.MUTE:
                this.reactiveState.mute = event.data;
                break;
            case mediaEvent.FULLSCREEN:
                this.reactiveState.fullscreen = event.data;
                break;
        }
    }

    load() {
        if (!this._videoData || !this._videoMediaIns) {
            return;
        };

        this._videoMediaIns.load(this._videoData);
    }

    reload(){
        if (!this._videoData || !this._videoMediaIns) {
            return;
        };

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
        rootNode = rootNode || this._rootNode;

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
};

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
    })
}

mixinVideoAPI(VideoBase);

// util api
export const util = {
    baseUtil,
    formatUtil,
    envUtil,
    logUtil,
    mediaUtil,
    domUtil
};

export const constant = Constant;
