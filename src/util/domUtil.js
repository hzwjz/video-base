/**
 * dom util
 */
function createEl(tagName, attrs) {
    var el = document.createElement(tagName || 'div');

    if (attrs && el.setAttribute) {
        for (var p in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, p)) {
                el.setAttribute(p, attrs[p]);
            }
        }
    }

    return el;
}

function getByTagName(tag, ele) {
    ele = !!ele[0] ? ele[0] : (ele || document);
    return !tag ? null : ele.getElementsByTagName(tag);
}

function addEvent(ele, evtName, fn) {
    ele.addEventListener(evtName, fn);
}

function clearEvent(ele, evtName, fn) {
    ele.removeEventListener(evtName, fn);
}

function setStyle(ele, styleName, value) {
    ele.style[styleName] = value;
}

function hasClass(ele, cls) {
    cls = cls || '';
    if (cls.replace(/\s/g, '').length == 0) {
        return false;
    }

    return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
  }

function addClassName(ele, cls) {
    if(!hasClass(ele, cls)){
        ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
    }
}

function delClassName(ele, cls) {
    if (hasClass(ele, cls)) {
        let newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + cls + ' ') >= 0) {
            newClass = newClass.replace(' ' + cls + ' ', ' ');
        }
        ele.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

function attr(ele, attr, value) {
    ele.setAttribute(attr, value);
}

export default {
    createEl,
    getByTagName,
    setStyle,
    addClassName,
    delClassName,
    attr,
    addEvent,
    clearEvent
}