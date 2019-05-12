/**
 * base util
 */
const toString = Object.prototype.toString;

function isFunction(fn) {
    return toString.call(fn) === '[object Function]';
}

function isNumber(n) {
    return toString.call(n) === '[object Number]';
}

function makeArray(nodes) {
    let array = null;
    
    try{
        array = Array.prototype.slice.call(nodes,0);
    }catch(ex){
        array = new Array();
        for(var i = 0,len = nodes.length;i < len;i++) {
            array.push(nodes[i]);
        }
    }
    
    return array;
}

export default {
    isFunction,
    isNumber,
    makeArray
}