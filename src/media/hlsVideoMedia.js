/**
 * hls video media
 */
import BaseMedia from './baseMedia';
import _constant from '../constant';
import {mediaEvent} from '../event';
import _logUtil from '../util/logUtil';
// import _mediaUtil from '../util/mediaUtil';
// import _domUtil from '../util/domUtil';
// import _baseUtil from '../util/baseUtil';
// import _envUtil from '../util/envUtil';

export default class HlsVideoMedia extends BaseMedia {
    constructor(parentNode, playerConfig, options) {
        super(parentNode, playerConfig, options);
    }

    _createHls(start) {
        /*global Hls*/
        this._hls = new Hls({
            autoStartLoad : true,
            startPosition : start             
        });

        this._hls.attachMedia(this._videoNode);

        this._hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            _logUtil.log("video and hls.js are bound");
        });

        this._hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            _logUtil.log("hls: manifest loaded, found " + data.levels.length + " quality level");
        });

        this._hls.on(Hls.Events.ERROR, (event, data) => {
            // if (data.fatal) { // 先去掉，需要处理全部错误
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        _logUtil.error("hls: fatal network error encountered, try to recover");
                        this._onhlsError(data.type, data.details);
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        // 不严重的错误可以不处理
                        // this._hls.recoverMediaError();
                        break;
                    default:

                        break;
                }
            // }
        });
    }

    _destroyHls() {
        if(this._hls){
            this._hls.stopLoad();
            this._hls.destroy();
            this._hls = null;
        }
    }

    load(movieData) {
        super.load(movieData);

        if(!this._hls){
            this._createHls(movieData.start);
        }

        this._hls.loadSource(this._item.urls[0]);

        if(this._isNotFirst){
            this._catchPlay();
        }
    }

    play() {
        super.play();

        this._catchPlay();
    }

    pause() {
        super.pause();

        if(this._videoNode){
            this._videoNode.pause();
        }
    }

    _doPreloadPause = function(){
        if(this._cfg.isPreload && !this._hasDoPreload){
            this._hasDoPreload = true;
            this.pause(); // 主动暂停
        }else{
            this.play();
        }
    }

    // 预加载或者播放前的操作，只支持点播
    _doBeforePlay() {
        if(!this._hasGetMetaData || !this._hasAutoSeek || this._cfg.mode == 'live'){
            return;
        }

        // 播放前处理
        if(this._cfg.beforePlay && !this._hasDoBeforePlay && this._state == _constant.MEDIA_STATE.PLAYING){
            // 不暂停，交给监听的组件处理

            this._doOptionFn(mediaEvent.BEFORE_PLAY);
            this._hasDoBeforePlay = true;
            return;
        }   
    }

    _doMetaReady(){
        super._doMetaReady();    
        
        if(!this._movieData.start || this._movieData.start < 0){
            this._hasAutoSeek = true;
        }

        this._doPreloadPause();
    }

    // 播放进度
    _onvideoTimeupdate(e) {
        this._doBeforePlay();

        super._onvideoTimeupdate(e);
    }

    // 寻找完毕
    _onvideoSeeked(e) {
        // 自动seek完成
        if (!this._hasAutoSeek) {
            this._hasAutoSeek = true;
        };

        // seek之后不要调用play或者pause，很容易引起状态混乱
    }

    _onhlsError(type, details) {
        if (!this._checkErrorCount()) {
            return;
        }

        this.stop();
        this._clearCheckCurrentTime(); 

        this._doOptionFn(mediaEvent.ERROR, {
            code : _constant.ERROR_CODE.MEDIA_ERROR_HLS_ERROR,
            message : details
        });
    }

    clear() {
        super.clear();  

        this._destroyHls();
    }
}