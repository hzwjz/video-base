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

function getPageScroll() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
        y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    };
}

function getMousePos(event) {
    let e = event || window.event;
    let scroll = getPageScroll();
    // var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    // var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    let x = e.pageX || e.clientX + scroll.x;
    let y = e.pageY || e.clientY + scroll.y;
    return {x: x, y: y};
}

function loadScript(url, callback) {
    let tag = createEl('script'), tout = 30 * 1000;

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
            message: `load ${url} fail`
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

const loadImg = (function () {
    var list = [], intervalId = null,

    // 用来执行队列
    tick = function () {
        var i = 0;
        for (; i < list.length; i++) {
            list[i].end ? list.splice(i--, 1) : list[i]();
        };
        !list.length && stop();
    },

    // 停止所有定时器队列
    stop = function () {
        clearInterval(intervalId);
        intervalId = null;
    };

    return function (url, ready, load, error) {
        var onready, width, height, newWidth, newHeight,
            img = new Image();

        img.src = url;

        // 如果图片被缓存，则直接返回缓存数据
        if (img.complete) {
            ready && ready(img);
            load && load(img);
            return;
        };

        width = -1; //img.width;
        height = -1; //img.height;

        // 加载错误后的事件
        img.onerror = function () {
            error && error(img);
            onready.end = true;
            img = img.onload = img.onerror = null;
        };

        // 图片尺寸就绪
        onready = function () {
            newWidth = img.width;
            newHeight = img.height;
            if (newWidth !== width || newHeight !== height) {
                ready && ready(img);
                onready.end = true;
            };
        };
        onready();

        // 完全加载完毕的事件
        img.onload = function () {
            // onload在定时器时间差范围内可能比onready快
            // 这里进行检查并保证onready优先执行
            !onready.end && onready();

            load && load(img);

            // IE gif动画会循环执行onload，置空onload即可
            img = img.onload = img.onerror = null;
        };

        // 加入队列中定期执行
        if (!onready.end) {
            list.push(onready);
            // 无论何时只允许出现一个定时器，减少浏览器性能损耗
            if (intervalId === null) intervalId = setInterval(tick, 40);
        };
    };
})();

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
    getPageScroll,
    getMousePos,
    loadScript,
    loadImg
}