/**
 * event
 */
export const videoDataEvent = {
    CONFIG_READY: 'configReady',
    VIDEO_DATA_READY : 'videoDataReady',
    LINE_CHANGE : 'lineChange',
    QUALITY_CHANGE : 'qualityChange',
    ERROR: 'dataError'
};
    
export const mediaEvent = {
    VIDEO_NODE_READY : 'videoNodeReady',
    BEFORE_LOAD : 'beforeLoad',
    START_LOAD : 'startLoad',
    META : 'meta',
    STATE : 'state',
    BEFORE_PLAY : 'beforePlay',
    RATE_CHANGE : 'rateChange',
    BUFFER : 'buffer',
    BUFFER_FULL : 'bufferFull',
    TIME : 'time',
    ERROR : 'mediaError',
    VOLUME : 'volume',
    VOLUME_INCREASE : 'volumeIncrease',
    VOLUME_DECREASE : 'volumeDecrease',
    MUTE : 'mute',
    SEEK : 'seek',
    SEEK_FORWARD : 'seekForward',
    SEEK_BACKWARD : 'seekBackward',
    FULLSCREEN: 'fullscreen'
};