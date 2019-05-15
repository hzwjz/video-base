/**
 * env util
 */
let ua = window.navigator.userAgent;

function isMobileAll() {
    let regx = new RegExp('(iPhone|iPod|Android|BlackBerry|mobile|Windows Phone)', 'ig');
    return regx.test(ua);
}

function isWeixin() {
    let regx = new RegExp('(micromessenger)', 'ig');
    return regx.test(ua);
}

function isAndroid() {
    return ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
} 

export default {
    isMobileAll,
    isWeixin,
    isAndroid
};