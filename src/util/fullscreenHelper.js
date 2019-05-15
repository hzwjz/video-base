/**
 * full screen util
 */
import domUtil from './domUtil';
import baseUtil from './baseUtil';

let _reg = /[\s\r\n]+/gi;

export default class FullscreenHelper{
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