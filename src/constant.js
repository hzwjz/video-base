/**
 * constant
 */
export default {

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