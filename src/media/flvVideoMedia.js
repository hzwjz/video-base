/**
 * flv video media
 */
import BaseMedia from './baseMedia';
import _constant from '../constant';
import {mediaEvent} from '../event';
import _logUtil from '../util/logUtil';
// import _mediaUtil from '../util/mediaUtil';
// import _domUtil from '../util/domUtil';
// import _baseUtil from '../util/baseUtil';
// import _envUtil from '../util/envUtil';

export default class FlvVideoMedia extends BaseMedia {
    constructor(parentNode, playerConfig, options) {
        super(parentNode, playerConfig, options);
    }

    _createFlv(url) {
        this._flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: url,
            withCredentials: false
        }, {
            isLive: this._cfg.mode == 'live',
            enableStashBuffer: this._cfg.mode != 'live',
            enableWorker: true,
            stashInitialSize: 128, // 提高首帧速度
            seekType: 'param',  // 因为cdn seek时返回的flv tag是按照flash规则的，所以目前无法正常解析tag
            seekParamStart: 'start',
            seekParamEnd: 'end'
        });

        this._flvPlayer.attachMediaElement(this._videoNode);

        this._flvPlayer.on(flvjs.Events.ERROR, (type, details) => {
            this._onflvError(type, details);
        });
    }

    _destroyFlv() {
        if(this._flvPlayer){
            this._flvPlayer.unload();
            this._flvPlayer.detachMediaElement();
            this._flvPlayer.destroy();
            this._flvPlayer = null;
        }
    }

    load(movieData) {
        super.load(movieData);

        if(!this._flvPlayer){
            this._createFlv(this._item.urls[0]);
        }

        this._flvPlayer.load();

        if(this._isNotFirst){
            this._catchPlay();
        }
    }

    _catchPlay() {
        // 重写父类方法
        
        if(!this._flvPlayer){
            return;
        }

        let playPromise = this._flvPlayer.play();

        // catch解决了 The play() request was interrupted 的问题
        if(playPromise && playPromise.catch){
            playPromise.then(function(){
                _logUtil.log('try to play success');

            }).catch(function (e) {
                _logUtil.error('try to play fail');
            });
        }
    }

    play() {
        super.play();

        this._catchPlay();
    }

    pause() {
        super.pause();

        this._flvPlayer && this._flvPlayer.pause();
    }

    _seek(pos) {
        // 覆盖父类实现
        _logUtil.log('flv _seek');
        if(this._canSeek()){
            try{
                this._flvPlayer.currentTime = pos;
            }catch(error){
                _logUtil.log(error.message);
            }
        }
    }

    /** 以下为事件处理 **/
    // 自动seek，在点播视频加载到meta后执行
    _autoSeek() {
        if (!this._canSeek()) {
            return;
        }

        if (this._hasAutoSeek) {
            this._doPreloadPause();
            return; 
        }

        if(this._movieData.start > 0){ 
            this._seek(this._movieData.start); 
            _logUtil.log('web flv do autoseek');

            this._doPreloadPause();

        }else{
            this._doPreloadPause();

            this._hasAutoSeek = true;
        }
    }

    _doPreloadPause() {
        if(this._cfg.isPreload && !this._hasDoPreload){
            this._hasDoPreload = true;
            this.pause(); // 主动暂停
        }else{
            this.play();
        }
    }

    // 预加载或者播放前的操作，只支持点播
    _doBeforePlay(continuePlay) {
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

    _doMetaReady() {
        super._doMetaReady();    

        this._autoSeek();
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

    // flv的错误
    _onflvError(type, details) {
        if (!this._checkErrorCount()) {
            return;
        }

        this.stop();

        this._doOptionFn(mediaEvent.ERROR, {
            code : _constant.ERROR_CODE.MEDIA_ERROR_FLV_ERROR,
            message : type + '_' + details
        });
    }

    clear() {
        super.clear();  

        this._destroyFlv();
    }
    
}