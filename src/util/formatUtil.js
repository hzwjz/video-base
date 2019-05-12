/**
 * format util
 */
// 格式化视频时间
function formatVideoTime(_seconds){
    _seconds = (_seconds || 0);
    let _minute = parseInt(_seconds / 60);
    let _second = parseInt(_seconds % 60);
    
    return (_minute < 10 ? '0'+_minute : _minute) + ':' + (_second < 10 ? '0'+_second : _second);
}

export default {
    formatVideoTime
}