/**
 * video data
 */
import _constant from './constant';
import {videoDataEvent} from './event';

export default class VideoData {
    /**
     * VideoData Class
     * @param {Object} videoData 
     * @param {String} [videoData.posterUrl]
     * @param {Number} [videoData.start=0]
     * @param {Number} [videoData.duration]
     * @param {Array}  [videoData.lines]
     * @param {*} config 
     * @param {*} options 
     */
    constructor(videoData, config, options) {
        if(!videoData){
            throw new Error('no video data');
        }

        this._config = config;
        this.defaultQuality = this._config.defaultQuality || _constant.VIDEO_QUALITY.SD;

        this._options = options;

        // other data
        this.id = 'video-base-id-' + new Date().getTime();
        this.posterUrl = videoData.posterUrl;
        this.start = videoData.start;
        this.duration = videoData.duration;

        if(!videoData.lines){
            this._createMovieItem(videoData.ratios || [videoData]);
        }else{
            // 创建线路
            this._createLines(videoData);
        }
        
        // 将原始数据带上，todo custom data
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

                if(videoData.lineSwitch && videoData.lineSwitch == line.type){
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
        };

        this.currentMovieItem = this.currentMovieItem || this.movieItemList[0]; // 默认第一个

        if(!this.currentMovieItem){
            this._doOptionFn(videoDataEvent.ERROR, _constant.ERROR_CODE.VIDEO_DATA_ERROR_NO_URL);
            return;
        }

        this.currentQuality = this.currentMovieItem.quality;
        this.qualityCount = this.movieItemList.length;

        this._doOptionFn(videoDataEvent.VIDEO_DATA_READY, this);
    }

    _getQualityName(quality) {
        return _constant.VIDEO_QUALITY_NAME[quality + ''] || '未知';
    }

    _getMediaType(video) {
        if(video.format){
            return video.format;
        }

        return _mediaUtil.getMediaType(video.videoUrl);
    }

    changeQuality(quality) {
        if (!quality) {
            return;
        };

        for (var i = 0; i < this.movieItemList.length; i++) {
            if(this.movieItemList[i].quality == quality){
                this.currentMovieItem = this.movieItemList[i];
                this.currentQuality = quality; // 更新当前清晰度选择
                break;
            }
        };

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