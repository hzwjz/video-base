/**
 * index
 */
import EventEmitter from 'events';
import VideoData from './model/videoData';
import _mediaEvent from './event';
import html5VideoMedia from './media/nativeVideoMedia'; // test

export default class VideoBase {
    constructor(options) {
        if(!options.parent){
            throw new Error('no parentNode!');
        }

        this._config = options.config;
        this._parentNode = options.parent;

        this._emitter = new EventEmitter();

        // video data
        if(options.videoData){
            this.setVideoData(options.videoData);
        }
    }

    _videoDataReady(videoData) {
        this._videoData = videoData;

        // 销毁旧的
        if(this._videoMediaIns){
            this._videoMediaIns.clear();
            this._videoMediaIns = null;
        }

        this._createMediaIns((ins) => {
            this._videoMediaIns = ins;

            // 如果是自动播放则马上加载，否则等待消息
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

        Object.keys(_mediaEvent).forEach((key) => {
            _options[_mediaEvent[key]] = this._mediaEventHandler.bind(this);
        });

        // _mediaSwitch(this._parentNode, this._videoData, this._config, _options, callback);
        callback && callback(new html5VideoMedia(this._parentNode, this._config, _options)); // test
    }   

    _mediaEventHandler(event) {
        if(this.reactiveState){
            this.updateReactiveState(event);
        }

        this._emitter.emit(event.type, event.data);
    }

    destroy(){
        if (this._videoMediaIns) {
            this._videoMediaIns.stop();
            this._videoMediaIns = null;
        }

        this._emitter.removeAllListeners();
        this._emitter = null;
    }

    getVideoNode(){
        return this._videoMediaIns.getVideoNode();
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
        this._videoDataReady(new VideoData(data, this._config));
    }

    getReactiveState() {
        if(!this.reactiveState){
            this.reactiveState = {
                error: null,
                line: null,
                lineName: '',
                quality: null,
                qualityName: '',
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
            case _mediaEvent.VIDEO_READY:
                break;
            case _mediaEvent.STATE:
                this.reactiveState.state = event.data;             
                break;
            case _mediaEvent.TIME:
                this.reactiveState.currentTime = event.data.currentTime;
                this.reactiveState.duration = event.data.duration;                
                break;
            case _mediaEvent.BUFFER:
                this.reactiveState.buffered = event.data.bufferPercent;
                break;
            case _mediaEvent.ERROR:
                this.reactiveState.error = event.data;
                break;
            // todo
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

    seek(pos){
        this._videoMediaIns && this._videoMediaIns.seek(pos);
    }

    seekForward(){
        this._videoMediaIns && this._videoMediaIns.seekForward();
    }

    seekBackward(){
        this._videoMediaIns && this._videoMediaIns.seekBackward();
    }

    play(){
        this._videoMediaIns && this._videoMediaIns.play();
    }

    pause(){
        this._videoMediaIns && this._videoMediaIns.pause();
    }

    stop(){
        this._videoMediaIns && this._videoMediaIns.stop();
    }

    pause(){
        this._videoMediaIns && this._videoMediaIns.pause();
    }

    volume(val){
        this._videoMediaIns && this._videoMediaIns.volume(val);
    }

    volumeIncrease(_data){
        this._videoMediaIns && this._videoMediaIns.volumeIncrease(_data);
    }

    volumeDecrease(_data){
        this._videoMediaIns && this._videoMediaIns.volumeDecrease(_data);
    }

    mute(mute){
        this._videoMediaIns && this._videoMediaIns.mute(mute);
    }

    rate(rate){
        this._videoMediaIns && this._videoMediaIns.rate(rate);
    }

    getPosition(){
        return this._videoMediaIns.getPosition();
    }

    getState(){
        return this._videoMediaIns.state();
    }

    isBlock(){
        return this._videoMediaIns.isBlock();
    }

    metaFPS(){
        return this._videoMediaIns.metaFPS();
    }

    currentFPS(){
        return this._videoMediaIns.currentFPS();
    }

    currentKbps(){
        return this._videoMediaIns.currentKbps();
    }

}

// export other