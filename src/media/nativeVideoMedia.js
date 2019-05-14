/**
 * native video media
 */
import BaseMedia from './baseMedia';
import _constant from '../constant';
import {mediaEvent} from '../event';
import _logUtil from '../util/logUtil';
import _mediaUtil from '../util/mediaUtil';
import _domUtil from '../util/domUtil';
import _baseUtil from '../util/baseUtil';
import _envUtil from '../util/envUtil';

export default class NativeVideoMedia extends BaseMedia{
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
            var _mimeType = _mediaUtil.getVideoMIMEType(src);

            if(!_mimeType){
                this._doOptionFn(mediaEvent.ERROR, _constant.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT);
                return;
            }

            // 个别手机检测不可靠
            if (!_mediaUtil.checkVideoCanPlay(_mimeType)) {
                this._doOptionFn(mediaEvent.ERROR, _constant.ERROR_CODE.MEDIA_ERROR_SOURCETYPE_NOT_SUPPORT);
                return;
            };

            var se = _domUtil.createEl('source', {
                src : src,
                type : _mimeType.split(';')[0] // 可能有多个
            });

            this._videoNode.appendChild(se);
        }.bind(this));

        // for(let s of _domUtil.getByTagName('source', this._videoNode)){
        //     console.log(s.src);
        // }

        this._sourceNodes = _baseUtil.makeArray(_domUtil.getByTagName('source', this._videoNode));

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
        };

        this._sourceNodes = null;
    }

    // 绑定source节点事件
    _initSourceEvent(_sourceNode){
        this._sourceNodes.forEach((_item, _index) => {
            _domUtil.addEvent(_item, 'error', this._onsourceError.bind(this));
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
        if(this._isNotFirst || !this._cfg.isPreload || _envUtil.isMobileAll()){
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
            _logUtil.log('html5 video do autoseek');

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
        if(!this._hasAutoSeek && _envUtil.isMobileAll()){ 
            this._autoSeek();
            return;
        }

        // 播放前处理
        if(this._cfg.beforePlay && !this._hasDoBeforePlay && this._state == _constant.MEDIA_STATE.PLAYING){
            this._hasDoBeforePlay = true;

            // 不暂停，交给监听的组件处理

            this._doOptionFn(mediaEvent.BEFORE_PLAY);
            return;
        }
    }

    _doMetaReady(){
        super._doMetaReady();

        if(!_envUtil.isMobileAll()){ // ios上直接auto seek会失败，可以在timeupdate时auto seek
            this._autoSeek();
        }
    }

    // 预加载或者播放前的操作，只支持点播
    _doPreloadAndBeforePlay(){
        if(!this._hasGetMetaData || !this._hasAutoSeek || this._cfg.mode == 'live'){
            return;
        }

        // 播放前处理
        if(this._cfg.beforePlay && !this._movieData.hasDoBeforePlay && this._state == _constant.MEDIA_STATE.PLAYING){
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
        };

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
            code : _constant.ERROR_CODE.MEDIA_ERROR_SOURCE_ERROR,
            message : this._formatVideoNodeError(e)
        });
    }

    // 回收
    clear(){
        if (this._videoNode) {
            this._clearSourceEvent();
            this._removeSourceNode();
        };

        super.clear();  
    }

    _clearSourceEvent(){
        if (this._sourceNodes) {
            this._sourceNodes.forEach((_item, _index) => {
                _domUtil.clearEvent(_item, 'error');
            });
        };
    }

}