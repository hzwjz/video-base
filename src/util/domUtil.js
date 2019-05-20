/**
 * dom util
 */
function createEl(tagName, attrs) {
    let el = document.createElement(tagName || 'div');

    if (attrs && el.setAttribute) {
        for (let p in attrs) {
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

function getEvent() {
    if (document.all) return window.event;

    var func = getEvent.caller;

    while (func != null) {
        var arg0 = func.arguments[0];

        if (arg0) {
            if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                return arg0;
            }
        }

        func = func.caller;
    }

    return null;
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

function loadScript(url, callback) {
    let tag = createEl('script'), tout = 30;

    function onload() {
        callback && callback(null);
    }

    function onerror(err) {
        callback && callback({
            message : err
        });
    }

    addEvent(tag, 'load', () => {
        onload();
    });

    addEvent(tag, 'error', (e) => {
        onerror({
            message: `load ${url} fail: ${e.message}`
        });
    });

    window.setTimeout(() => {
        onerror({
            message: `load ${url} timeout`
        });
    }, tout);

    tag.src = url;
    document.head.appendChild(tag);
}

export default {
    createEl,
    getByTagName,
    setStyle,
    addClassName,
    delClassName,
    attr,
    addEvent,
    clearEvent,
    getEvent,
    loadScript
}