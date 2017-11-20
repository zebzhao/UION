/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(core) {

    if (typeof define == 'function' && define.amd) { // AMD

        define('uikit', function(){

            var uikit = window.UIkit || core(window, window.jQuery, window.document);

            uikit.load = function(res, req, onload, config) {

                var resources = res.split(','), load = [], i, base = (config.config && config.config.uikit && config.config.uikit.base ? config.config.uikit.base : '').replace(/\/+$/g, '');

                if (!base) {
                    throw new Error('Please define base path to UIkit in the requirejs config.');
                }

                for (i = 0; i < resources.length; i += 1) {
                    var resource = resources[i].replace(/\./g, '/');
                    load.push(base+'/components/'+resource);
                }

                req(load, function() {
                    onload(uikit);
                });
            };

            return uikit;
        });
    }

    if (!window.jQuery) {
        throw new Error('UIkit requires jQuery');
    }

    if (window && window.jQuery) {
        core(window, window.jQuery, window.document);
    }


})(function(global, $, doc) {

    "use strict";

    var UI = {}, _UI = global.UIkit ? Object.create(global.UIkit) : undefined;

    UI.version = '2.27.2';

    UI.noConflict = function() {
        // restore UIkit version
        if (_UI) {
            global.UIkit = _UI;
            $.UIkit      = _UI;
            $.fn.uk      = _UI.fn;
        }

        return UI;
    };

    UI.prefix = function(str) {
        return str;
    };

    // cache jQuery
    UI.$ = $;

    UI.$doc  = UI.$(document);
    UI.$win  = UI.$(window);
    UI.$html = UI.$('html');

    UI.support = {};
    UI.support.transition = (function() {

        var transitionEnd = (function() {

            var element = doc.body || doc.documentElement,
                transEndEventNames = {
                    WebkitTransition : 'webkitTransitionEnd',
                    MozTransition    : 'transitionend',
                    OTransition      : 'oTransitionEnd otransitionend',
                    transition       : 'transitionend'
                }, name;

            for (name in transEndEventNames) {
                if (element.style[name] !== undefined) return transEndEventNames[name];
            }
        }());

        return transitionEnd && { end: transitionEnd };
    })();

    UI.support.animation = (function() {

        var animationEnd = (function() {

            var element = doc.body || doc.documentElement,
                animEndEventNames = {
                    WebkitAnimation : 'webkitAnimationEnd',
                    MozAnimation    : 'animationend',
                    OAnimation      : 'oAnimationEnd oanimationend',
                    animation       : 'animationend'
                }, name;

            for (name in animEndEventNames) {
                if (element.style[name] !== undefined) return animEndEventNames[name];
            }
        }());

        return animationEnd && { end: animationEnd };
    })();

    // requestAnimationFrame polyfill
    //https://github.com/darius/requestAnimationFrame
    (function() {

        Date.now = Date.now || function() { return new Date().getTime(); };

        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
            window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                       || window[vp+'CancelRequestAnimationFrame']);
        }
        if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
            || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function(callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function() { callback(lastTime = nextTime); },
                                  nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    }());

    UI.support.touch = (
        ('ontouchstart' in document) ||
        (global.DocumentTouch && document instanceof global.DocumentTouch)  ||
        (global.navigator.msPointerEnabled && global.navigator.msMaxTouchPoints > 0) || //IE 10
        (global.navigator.pointerEnabled && global.navigator.maxTouchPoints > 0) || //IE >=11
        false
    );

    UI.support.mutationobserver = (global.MutationObserver || global.WebKitMutationObserver || null);

    UI.Utils = {};

    UI.Utils.isFullscreen = function() {
        return document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.fullscreenElement || false;
    };

    UI.Utils.str2json = function(str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    // wrap keys without quote with valid double quote
                    .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":';})
                    // replacing single quote wrapped ones to double quote
                    .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"';})
                );
            } else {
                return (new Function('', 'var json = ' + str + '; return JSON.parse(JSON.stringify(json));'))();
            }
        } catch(e) { return false; }
    };

    UI.Utils.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    UI.Utils.throttle = function (func, limit) {
        var wait = false;
        return function () {
            if (!wait) {
                func.call();
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, limit);
            }
        }
    };

    UI.Utils.removeCssRules = function(selectorRegEx) {
        var idx, idxs, stylesheet, _i, _j, _k, _len, _len1, _len2, _ref;

        if(!selectorRegEx) return;

        setTimeout(function(){
            try {
              _ref = document.styleSheets;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                stylesheet = _ref[_i];
                idxs = [];
                stylesheet.cssRules = stylesheet.cssRules;
                for (idx = _j = 0, _len1 = stylesheet.cssRules.length; _j < _len1; idx = ++_j) {
                  if (stylesheet.cssRules[idx].type === CSSRule.STYLE_RULE && selectorRegEx.test(stylesheet.cssRules[idx].selectorText)) {
                    idxs.unshift(idx);
                  }
                }
                for (_k = 0, _len2 = idxs.length; _k < _len2; _k++) {
                  stylesheet.deleteRule(idxs[_k]);
                }
              }
            } catch (_error) {}
        }, 0);
    };

    UI.Utils.isInView = function(element, options) {

        var $element = $(element);

        if (!$element.is(':visible')) {
            return false;
        }

        var window_left = UI.$win.scrollLeft(), window_top = UI.$win.scrollTop(), offset = $element.offset(), left = offset.left, top = offset.top;

        options = $.extend({topoffset:0, leftoffset:0}, options);

        if (top + $element.height() >= window_top && top - options.topoffset <= window_top + UI.$win.height() &&
            left + $element.width() >= window_left && left - options.leftoffset <= window_left + UI.$win.width()) {
          return true;
        } else {
          return false;
        }
    };

    UI.Utils.checkDisplay = function(context, initanimation) {

        var elements = UI.$('[data-uk-margin], [data-uk-grid-match], [data-uk-grid-margin], [data-uk-check-display]', context || document), animated;

        if (context && !elements.length) {
            elements = $(context);
        }

        elements.trigger('display.uk.check');

        // fix firefox / IE animations
        if (initanimation) {

            if (typeof(initanimation)!='string') {
                initanimation = '[class*="uk-animation-"]';
            }

            elements.find(initanimation).each(function(){

                var ele  = UI.$(this),
                    cls  = ele.attr('class'),
                    anim = cls.match(/uk-animation-(.+)/);

                ele.removeClass(anim[0]).width();

                ele.addClass(anim[0]);
            });
        }

        return elements;
    };

    UI.Utils.options = function(string) {

        if ($.type(string)!='string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{'+string+'}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = UI.Utils.str2json(string.substr(start));
            } catch (e) {}
        }

        return options;
    };

    UI.Utils.animate = function(element, cls) {

        var d = $.Deferred();

        element = UI.$(element);

        element.css('display', 'none').addClass(cls).one(UI.support.animation.end, function() {
            element.removeClass(cls);
            d.resolve();
        });

        element.css('display', '');

        return d.promise();
    };

    UI.Utils.uid = function(prefix) {
        return (prefix || 'id') + (new Date().getTime())+"RAND"+(Math.ceil(Math.random() * 100000));
    };

    UI.Utils.template = function(str, data) {

        var tokens = str.replace(/\n/g, '\\n').replace(/\{\{\{\s*(.+?)\s*\}\}\}/g, "{{!$1}}").split(/(\{\{\s*(.+?)\s*\}\})/g),
            i=0, toc, cmd, prop, val, fn, output = [], openblocks = 0;

        while(i < tokens.length) {

            toc = tokens[i];

            if(toc.match(/\{\{\s*(.+?)\s*\}\}/)) {
                i = i + 1;
                toc  = tokens[i];
                cmd  = toc[0];
                prop = toc.substring(toc.match(/^(\^|\#|\!|\~|\:)/) ? 1:0);

                switch(cmd) {
                    case '~':
                        output.push('for(var $i=0;$i<'+prop+'.length;$i++) { var $item = '+prop+'[$i];');
                        openblocks++;
                        break;
                    case ':':
                        output.push('for(var $key in '+prop+') { var $val = '+prop+'[$key];');
                        openblocks++;
                        break;
                    case '#':
                        output.push('if('+prop+') {');
                        openblocks++;
                        break;
                    case '^':
                        output.push('if(!'+prop+') {');
                        openblocks++;
                        break;
                    case '/':
                        output.push('}');
                        openblocks--;
                        break;
                    case '!':
                        output.push('__ret.push('+prop+');');
                        break;
                    default:
                        output.push('__ret.push(escape('+prop+'));');
                        break;
                }
            } else {
                output.push("__ret.push('"+toc.replace(/\'/g, "\\'")+"');");
            }
            i = i + 1;
        }

        fn  = new Function('$data', [
            'var __ret = [];',
            'try {',
            'with($data){', (!openblocks ? output.join('') : '__ret = ["Not all blocks are closed correctly."]'), '};',
            '}catch(e){__ret = [e.message];}',
            'return __ret.join("").replace(/\\n\\n/g, "\\n");',
            "function escape(html) { return String(html).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}"
        ].join("\n"));

        return data ? fn(data) : fn;
    };

    UI.Utils.focus = function(element, extra) {

        element = $(element);

        if (!element.length) {
            return element;
        }

        var autofocus = element.find('[autofocus]:first'), tabidx;

        if (autofocus.length) {
            return autofocus.focus();
        }

        autofocus = element.find(':input'+(extra && (','+extra) || '')).first();

        if (autofocus.length) {
            return autofocus.focus();
        }

        if (!element.attr('tabindex')) {
            tabidx = 1000;
            element.attr('tabindex', tabidx);
        }

        element[0].focus();

        if (tabidx) {
            element.attr('tabindex', '');
        }

        return element;
    }

    UI.Utils.events       = {};
    UI.Utils.events.click = UI.support.touch ? 'tap' : 'click';

    global.UIkit = UI;

    // deprecated

    UI.fn = function(command, options) {

        var args = arguments, cmd = command.match(/^([a-z\-]+)(?:\.([a-z]+))?/i), component = cmd[1], method = cmd[2];

        if (!UI[component]) {
            $.error('UIkit component [' + component + '] does not exist.');
            return this;
        }

        return this.each(function() {
            var $this = $(this), data = $this.data(component);
            if (!data) $this.data(component, (data = UI[component](this, method ? undefined : options)));
            if (method) data[method].apply(data, Array.prototype.slice.call(args, 1));
        });
    };

    $.UIkit          = UI;
    $.fn.uk          = UI.fn;

    UI.langdirection = UI.$html.attr("dir") == "rtl" ? "right" : "left";

    UI.components    = {};

    UI.component = function(name, def) {

        var fn = function(element, options) {

            var $this = this;

            this.UIkit   = UI;
            this.element = element ? UI.$(element) : null;
            this.options = $.extend(true, {}, this.defaults, options);
            this.plugins = {};

            if (this.element) {
                this.element.data(name, this);
            }

            this.init();

            (this.options.plugins.length ? this.options.plugins : Object.keys(fn.plugins)).forEach(function(plugin) {

                if (fn.plugins[plugin].init) {
                    fn.plugins[plugin].init($this);
                    $this.plugins[plugin] = true;
                }

            });

            this.trigger('init.uk.component', [name, this]);

            return this;
        };

        fn.plugins = {};

        $.extend(true, fn.prototype, {

            defaults : {plugins: []},

            boot: function(){},
            init: function(){},

            on: function(a1,a2,a3){
                return UI.$(this.element || this).on(a1,a2,a3);
            },

            one: function(a1,a2,a3){
                return UI.$(this.element || this).one(a1,a2,a3);
            },

            off: function(evt){
                return UI.$(this.element || this).off(evt);
            },

            trigger: function(evt, params) {
                return UI.$(this.element || this).trigger(evt, params);
            },

            find: function(selector) {
                return UI.$(this.element ? this.element: []).find(selector);
            },

            proxy: function(obj, methods) {

                var $this = this;

                methods.split(' ').forEach(function(method) {
                    if (!$this[method]) $this[method] = function() { return obj[method].apply(obj, arguments); };
                });
            },

            mixin: function(obj, methods) {

                var $this = this;

                methods.split(' ').forEach(function(method) {
                    if (!$this[method]) $this[method] = obj[method].bind($this);
                });
            },

            option: function() {

                if (arguments.length == 1) {
                    return this.options[arguments[0]] || undefined;
                } else if (arguments.length == 2) {
                    this.options[arguments[0]] = arguments[1];
                }
            }

        }, def);

        this.components[name] = fn;

        this[name] = function() {

            var element, options;

            if (arguments.length) {

                switch(arguments.length) {
                    case 1:

                        if (typeof arguments[0] === 'string' || arguments[0].nodeType || arguments[0] instanceof jQuery) {
                            element = $(arguments[0]);
                        } else {
                            options = arguments[0];
                        }

                        break;
                    case 2:

                        element = $(arguments[0]);
                        options = arguments[1];
                        break;
                }
            }

            if (element && element.data(name)) {
                return element.data(name);
            }

            return (new UI.components[name](element, options));
        };

        if (UI.domready) {
            UI.component.boot(name);
        }

        return fn;
    };

    UI.plugin = function(component, name, def) {
        this.components[component].plugins[name] = def;
    };

    UI.component.boot = function(name) {

        if (UI.components[name].prototype && UI.components[name].prototype.boot && !UI.components[name].booted) {
            UI.components[name].prototype.boot.apply(UI, []);
            UI.components[name].booted = true;
        }
    };

    UI.component.bootComponents = function() {

        for (var component in UI.components) {
            UI.component.boot(component);
        }
    };


    // DOM mutation save ready helper function

    UI.domObservers = [];
    UI.domready     = false;

    UI.ready = function(fn) {

        UI.domObservers.push(fn);

        if (UI.domready) {
            fn(document);
        }
    };

    UI.on = function(a1,a2,a3){

        if (a1 && a1.indexOf('ready.uk.dom') > -1 && UI.domready) {
            a2.apply(UI.$doc);
        }

        return UI.$doc.on(a1,a2,a3);
    };

    UI.one = function(a1,a2,a3){

        if (a1 && a1.indexOf('ready.uk.dom') > -1 && UI.domready) {
            a2.apply(UI.$doc);
            return UI.$doc;
        }

        return UI.$doc.one(a1,a2,a3);
    };

    UI.trigger = function(evt, params) {
        return UI.$doc.trigger(evt, params);
    };

    UI.domObserve = function(selector, fn) {

        if(!UI.support.mutationobserver) return;

        fn = fn || function() {};

        UI.$(selector).each(function() {

            var element  = this,
                $element = UI.$(element);

            if ($element.data('observer')) {
                return;
            }

            try {

                var observer = new UI.support.mutationobserver(UI.Utils.debounce(function(mutations) {
                    fn.apply(element, [$element]);
                    $element.trigger('changed.uk.dom');
                }, 50), {childList: true, subtree: true});

                // pass in the target node, as well as the observer options
                observer.observe(element, { childList: true, subtree: true });

                $element.data('observer', observer);

            } catch(e) {}
        });
    };

    UI.init = function(root) {

        root = root || document;

        UI.domObservers.forEach(function(fn){
            fn(root);
        });
    };

    UI.on('domready.uk.dom', function(){

        UI.init();

        if (UI.domready) UI.Utils.checkDisplay();
    });

    document.addEventListener('DOMContentLoaded', function(){

        var domReady = function() {

            UI.$body = UI.$('body');

            UI.trigger('beforeready.uk.dom');

            UI.component.bootComponents();

            // custom scroll observer
            var rafToken = requestAnimationFrame((function(){

                var memory = {dir: {x:0, y:0}, x: window.pageXOffset, y:window.pageYOffset};

                var fn = function(){
                    // reading this (window.page[X|Y]Offset) causes a full page recalc of the layout in Chrome,
                    // so we only want to do this once
                    var wpxo = window.pageXOffset;
                    var wpyo = window.pageYOffset;

                    // Did the scroll position change since the last time we were here?
                    if (memory.x != wpxo || memory.y != wpyo) {

                        // Set the direction of the scroll and store the new position
                        if (wpxo != memory.x) {memory.dir.x = wpxo > memory.x ? 1:-1; } else { memory.dir.x = 0; }
                        if (wpyo != memory.y) {memory.dir.y = wpyo > memory.y ? 1:-1; } else { memory.dir.y = 0; }

                        memory.x = wpxo;
                        memory.y = wpyo;

                        // Trigger the scroll event, this could probably be sent using memory.clone() but this is
                        // more explicit and easier to see exactly what is being sent in the event.
                        UI.$doc.trigger('scrolling.uk.document', [{
                            dir: {x: memory.dir.x, y: memory.dir.y}, x: wpxo, y: wpyo
                        }]);
                    }

                    cancelAnimationFrame(rafToken);
                    rafToken = requestAnimationFrame(fn);
                };

                if (UI.support.touch) {
                    UI.$html.on('touchmove touchend MSPointerMove MSPointerUp pointermove pointerup', fn);
                }

                if (memory.x || memory.y) fn();

                return fn;

            })());

            // run component init functions on dom
            UI.trigger('domready.uk.dom');

            if (UI.support.touch) {

                // remove css hover rules for touch devices
                // UI.Utils.removeCssRules(/\.uk-(?!navbar).*:hover/);

                // viewport unit fix for uk-height-viewport - should be fixed in iOS 8
                if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {

                    UI.$win.on('load orientationchange resize', UI.Utils.debounce((function(){

                        var fn = function() {
                            $('.uk-height-viewport').css('height', window.innerHeight);
                            return fn;
                        };

                        return fn();

                    })(), 100));
                }
            }

            UI.trigger('afterready.uk.dom');

            // mark that domready is left behind
            UI.domready = true;

            // auto init js components
            if (UI.support.mutationobserver) {

                var initFn = UI.Utils.debounce(function(){
                    requestAnimationFrame(function(){ UI.init(document.body);});
                }, 10);

                (new UI.support.mutationobserver(function(mutations) {

                    var init = false;

                    mutations.every(function(mutation){

                        if (mutation.type != 'childList') return true;

                        for (var i = 0, node; i < mutation.addedNodes.length; ++i) {

                            node = mutation.addedNodes[i];

                            if (node.outerHTML && node.outerHTML.indexOf('data-uk-') !== -1) {
                                return (init = true) && false;
                            }
                        }
                        return true;
                    });

                    if (init) initFn();

                })).observe(document.body, {childList: true, subtree: true});
            }
        };

        if (document.readyState == 'complete' || document.readyState == 'interactive') {
            setTimeout(domReady);
        }

        return domReady;

    }());

    // add touch identifier class
    UI.$html.addClass(UI.support.touch ? 'uk-touch' : 'uk-notouch');

    // add uk-hover class on tap to support overlays on touch devices
    if (UI.support.touch) {

        var hoverset = false,
            exclude,
            hovercls = 'uk-hover',
            selector = '.uk-overlay, .uk-overlay-hover, .uk-overlay-toggle, .uk-animation-hover, .uk-has-hover';

        UI.$html.on('mouseenter touchstart MSPointerDown pointerdown', selector, function() {

            if (hoverset) $('.'+hovercls).removeClass(hovercls);

            hoverset = $(this).addClass(hovercls);

        }).on('mouseleave touchend MSPointerUp pointerup', function(e) {

            exclude = $(e.target).parents(selector);

            if (hoverset) {
                hoverset.not(exclude).removeClass(hovercls);
            }
        });
    }

    return UI;
});

//  Based on Zeptos touch.js
//  https://raw.github.com/madrobby/zepto/master/src/touch.js
//  Zepto.js may be freely distributed under the MIT license.

;(function($){

  if ($.fn.swipeLeft) {
    return;
  }


  var touch = {}, touchTimeout, tapTimeout, swipeTimeout, longTapTimeout, longTapDelay = 750, gesture;

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
  }

  function longTap() {
    longTapTimeout = null;
    if (touch.last) {
      if ( touch.el !== undefined ) touch.el.trigger('longTap');
      touch = {};
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout);
    longTapTimeout = null;
  }

  function cancelAll() {
    if (touchTimeout)   clearTimeout(touchTimeout);
    if (tapTimeout)     clearTimeout(tapTimeout);
    if (swipeTimeout)   clearTimeout(swipeTimeout);
    if (longTapTimeout) clearTimeout(longTapTimeout);
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
    touch = {};
  }

  function isPrimaryTouch(event){
    return event.pointerType == event.MSPOINTER_TYPE_TOUCH && event.isPrimary;
  }

  $(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch;

    if ('MSGesture' in window) {
      gesture = new MSGesture();
      gesture.target = document.body;
    }

    $(document)
      .on('MSGestureEnd gestureend', function(e){

        var swipeDirectionFromVelocity = e.originalEvent.velocityX > 1 ? 'Right' : e.originalEvent.velocityX < -1 ? 'Left' : e.originalEvent.velocityY > 1 ? 'Down' : e.originalEvent.velocityY < -1 ? 'Up' : null;

        if (swipeDirectionFromVelocity && touch.el !== undefined) {
          touch.el.trigger('swipe');
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity);
        }
      })
      // MSPointerDown: for IE10
      // pointerdown: for IE11
      .on('touchstart MSPointerDown pointerdown', function(e){

        if(e.type == 'MSPointerDown' && !isPrimaryTouch(e.originalEvent)) return;

        firstTouch = (e.type == 'MSPointerDown' || e.type == 'pointerdown') ? e : e.originalEvent.touches[0];

        now      = Date.now();
        delta    = now - (touch.last || now);
        touch.el = $('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);

        if(touchTimeout) clearTimeout(touchTimeout);

        touch.x1 = firstTouch.pageX;
        touch.y1 = firstTouch.pageY;

        if (delta > 0 && delta <= 250) touch.isDoubleTap = true;

        touch.last = now;
        longTapTimeout = setTimeout(longTap, longTapDelay);

        // adds the current touch contact for IE gesture recognition
        if (e.originalEvent && e.originalEvent.pointerId && gesture && ( e.type == 'MSPointerDown' || e.type == 'pointerdown' || e.type == 'touchstart' ) ) {
          gesture.addPointer(e.originalEvent.pointerId);
        }

      })
      // MSPointerMove: for IE10
      // pointermove: for IE11
      .on('touchmove MSPointerMove pointermove', function(e){

        if (e.type == 'MSPointerMove' && !isPrimaryTouch(e.originalEvent)) return;

        firstTouch = (e.type == 'MSPointerMove' || e.type == 'pointermove') ? e : e.originalEvent.touches[0];

        cancelLongTap();
        touch.x2 = firstTouch.pageX;
        touch.y2 = firstTouch.pageY;

        deltaX += Math.abs(touch.x1 - touch.x2);
        deltaY += Math.abs(touch.y1 - touch.y2);
      })
      // MSPointerUp: for IE10
      // pointerup: for IE11
      .on('touchend MSPointerUp pointerup', function(e){

        if (e.type == 'MSPointerUp' && !isPrimaryTouch(e.originalEvent)) return;

        cancelLongTap();

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)){

          swipeTimeout = setTimeout(function() {
            if ( touch.el !== undefined ) {
              touch.el.trigger('swipe');
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
            }
            touch = {};
          }, 0);

        // normal tap
        } else if ('last' in touch) {

          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (isNaN(deltaX) || (deltaX < 30 && deltaY < 30)) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap');
              event.cancelTouch = cancelAll;
              if ( touch.el !== undefined ) touch.el.trigger(event);

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if ( touch.el !== undefined ) touch.el.trigger('doubleTap');
                touch = {};
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null;
                  if ( touch.el !== undefined ) touch.el.trigger('singleTap');
                  touch = {};
                }, 250);
              }
            }, 0);
          } else {
            touch = {};
          }
          deltaX = deltaY = 0;
        }
      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll);

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll);
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return $(this).on(eventName, callback); };
  });
})(jQuery);

(function(UI) {

    "use strict";

    var stacks = [];

    UI.component('stackMargin', {

        defaults: {
            cls: 'uk-margin-small-top',
            rowfirst: false,
            observe: false
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-margin]', context).each(function() {

                    var ele = UI.$(this);

                    if (!ele.data('stackMargin')) {
                        UI.stackMargin(ele, UI.Utils.options(ele.attr('data-uk-margin')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            UI.$win.on('resize orientationchange', (function() {

                var fn = function() {
                    $this.process();
                };

                UI.$(function() {
                    fn();
                    UI.$win.on('load', fn);
                });

                return UI.Utils.debounce(fn, 20);
            })());

            this.on('display.uk.check', function(e) {
                if (this.element.is(':visible')) this.process();
            }.bind(this));

            if (this.options.observe) {

                UI.domObserve(this.element, function(e) {
                    if ($this.element.is(':visible')) $this.process();
                });
            }

            stacks.push(this);
        },

        process: function() {

            var $this = this, columns = this.element.children();

            UI.Utils.stackMargin(columns, this.options);

            if (!this.options.rowfirst || !columns.length) {
                return this;
            }

            // Mark first column elements
            var group = {}, minleft = false;

            columns.removeClass(this.options.rowfirst).each(function(offset, $ele){

                $ele = UI.$(this);

                if (this.style.display != 'none') {
                    offset = $ele.offset().left;
                    ((group[offset] = group[offset] || []) && group[offset]).push(this);
                    minleft = minleft === false ? offset : Math.min(minleft, offset);
                }
            });

            UI.$(group[minleft]).addClass(this.options.rowfirst);

            return this;
        }

    });


    // responsive element e.g. iframes

    (function(){

        var elements = [], check = function(ele) {

            if (!ele.is(':visible')) return;

            var width  = ele.parent().width(),
                iwidth = ele.data('width'),
                ratio  = (width / iwidth),
                height = Math.floor(ratio * ele.data('height'));

            ele.css({height: (width < iwidth) ? height : ele.data('height')});
        };

        UI.component('responsiveElement', {

            defaults: {},

            boot: function() {

                // init code
                UI.ready(function(context) {

                    UI.$('iframe.uk-responsive-width, [data-uk-responsive]', context).each(function() {

                        var ele = UI.$(this), obj;

                        if (!ele.data('responsiveElement')) {
                            obj = UI.responsiveElement(ele, {});
                        }
                    });
                });
            },

            init: function() {

                var ele = this.element;

                if (ele.attr('width') && ele.attr('height')) {

                    ele.data({
                        width : ele.attr('width'),
                        height: ele.attr('height')
                    }).on('display.uk.check', function(){
                        check(ele);
                    });

                    check(ele);

                    elements.push(ele);
                }
            }
        });

        UI.$win.on('resize load', UI.Utils.debounce(function(){

            elements.forEach(function(ele){
                check(ele);
            });

        }, 15));

    })();


    // helper

    UI.Utils.stackMargin = function(elements, options) {

        options = UI.$.extend({
            cls: 'uk-margin-small-top'
        }, options);

        elements = UI.$(elements).removeClass(options.cls);

        var min = false;

        elements.each(function(offset, height, pos, $ele){

            $ele   = UI.$(this);

            if ($ele.css('display') != 'none') {

                offset = $ele.offset();
                height = $ele.outerHeight();
                pos    = offset.top + height;

                $ele.data({
                    ukMarginPos: pos,
                    ukMarginTop: offset.top
                });

                if (min === false || (offset.top < min.top) ) {

                    min = {
                        top  : offset.top,
                        left : offset.left,
                        pos  : pos
                    };
                }
            }

        }).each(function($ele) {

            $ele   = UI.$(this);

            if ($ele.css('display') != 'none' && $ele.data('ukMarginTop') > min.top && $ele.data('ukMarginPos') > min.pos) {
                $ele.addClass(options.cls);
            }
        });
    };

    UI.Utils.matchHeights = function(elements, options) {

        elements = UI.$(elements).css('min-height', '');
        options  = UI.$.extend({ row : true }, options);

        var matchHeights = function(group){

            if (group.length < 2) return;

            var max = 0;

            group.each(function() {
                max = Math.max(max, UI.$(this).outerHeight());
            }).each(function() {

                var element = UI.$(this),
                    height  = max - (element.css('box-sizing') == 'border-box' ? 0 : (element.outerHeight() - element.height()));

                element.css('min-height', height + 'px');
            });
        };

        if (options.row) {

            elements.first().width(); // force redraw

            setTimeout(function(){

                var lastoffset = false, group = [];

                elements.each(function() {

                    var ele = UI.$(this), offset = ele.offset().top;

                    if (offset != lastoffset && group.length) {

                        matchHeights(UI.$(group));
                        group  = [];
                        offset = ele.offset().top;
                    }

                    group.push(ele);
                    lastoffset = offset;
                });

                if (group.length) {
                    matchHeights(UI.$(group));
                }

            }, 0);

        } else {
            matchHeights(elements);
        }
    };

    (function(cacheSvgs){

        UI.Utils.inlineSvg = function(selector, root) {

            var images = UI.$(selector || 'img[src$=".svg"]', root || document).each(function(){

                var img = UI.$(this),
                    src = img.attr('src');

                if (!cacheSvgs[src]) {

                    var d = UI.$.Deferred();

                    UI.$.get(src, {nc: Math.random()}, function(data){
                        d.resolve(UI.$(data).find('svg'));
                    });

                    cacheSvgs[src] = d.promise();
                }

                cacheSvgs[src].then(function(svg) {

                    var $svg = UI.$(svg).clone();

                    if (img.attr('id')) $svg.attr('id', img.attr('id'));
                    if (img.attr('class')) $svg.attr('class', img.attr('class'));
                    if (img.attr('style')) $svg.attr('style', img.attr('style'));

                    if (img.attr('width')) {
                        $svg.attr('width', img.attr('width'));
                        if (!img.attr('height'))  $svg.removeAttr('height');
                    }

                    if (img.attr('height')){
                        $svg.attr('height', img.attr('height'));
                        if (!img.attr('width')) $svg.removeAttr('width');
                    }

                    img.replaceWith($svg);
                });
            });
        };

        // init code
        UI.ready(function(context) {
            UI.Utils.inlineSvg('[data-uk-svg]', context);
        });

    })({});

    UI.Utils.getCssVar = function(name) {

        /* usage in css:  .var-name:before { content:"xyz" } */

        var val, doc = document.documentElement, element = doc.appendChild(document.createElement('div'));

        element.classList.add('var-'+name);

        try {
            val = JSON.parse(val = getComputedStyle(element, ':before').content.replace(/^["'](.*)["']$/, '$1'));
        } catch (e) {
            val = undefined;
        }

        doc.removeChild(element);

        return val;
    }

})(UIkit);

(function(UI) {

    "use strict";

    UI.component('smoothScroll', {

        boot: function() {

            // init code
            UI.$html.on('click.smooth-scroll.uikit', '[data-uk-smooth-scroll]', function(e) {
                var ele = UI.$(this);

                if (!ele.data('smoothScroll')) {
                    var obj = UI.smoothScroll(ele, UI.Utils.options(ele.attr('data-uk-smooth-scroll')));
                    ele.trigger('click');
                }

                return false;
            });
        },

        init: function() {

            var $this = this;

            this.on('click', function(e) {
                e.preventDefault();
                scrollToElement(UI.$(this.hash).length ? UI.$(this.hash) : UI.$('body'), $this.options);
            });
        }
    });

    function scrollToElement(ele, options) {

        options = UI.$.extend({
            duration: 1000,
            transition: 'easeOutExpo',
            offset: 0,
            complete: function(){}
        }, options);

        // get / set parameters
        var target    = ele.offset().top - options.offset,
            docheight = UI.$doc.height(),
            winheight = window.innerHeight;

        if ((target + winheight) > docheight) {
            target = docheight - winheight;
        }

        // animate to target, fire callback when done
        UI.$('html,body').stop().animate({scrollTop: target}, options.duration, options.transition).promise().done(options.complete);
    }

    UI.Utils.scrollToElement = scrollToElement;

    if (!UI.$.easing.easeOutExpo) {
        UI.$.easing.easeOutExpo = function(x, t, b, c, d) { return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b; };
    }

})(UIkit);

(function(UI) {

    "use strict";

    var $win           = UI.$win,
        $doc           = UI.$doc,
        scrollspies    = [],
        checkScrollSpy = function() {
            for(var i=0; i < scrollspies.length; i++) {
                window.requestAnimationFrame.apply(window, [scrollspies[i].check]);
            }
        };

    UI.component('scrollspy', {

        defaults: {
            target     : false,
            cls        : 'uk-scrollspy-inview',
            initcls    : 'uk-scrollspy-init-inview',
            topoffset  : 0,
            leftoffset : 0,
            repeat     : false,
            delay      : 0
        },

        boot: function() {

            // listen to scroll and resize
            $doc.on('scrolling.uk.document', checkScrollSpy);
            $win.on('load resize orientationchange', UI.Utils.debounce(checkScrollSpy, 50));

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-scrollspy]', context).each(function() {

                    var element = UI.$(this);

                    if (!element.data('scrollspy')) {
                        var obj = UI.scrollspy(element, UI.Utils.options(element.attr('data-uk-scrollspy')));
                    }
                });
            });
        },

        init: function() {

            var $this = this, inviewstate, initinview, togglecls = this.options.cls.split(/,/), fn = function(){

                var elements     = $this.options.target ? $this.element.find($this.options.target) : $this.element,
                    delayIdx     = elements.length === 1 ? 1 : 0,
                    toggleclsIdx = 0;

                elements.each(function(idx){

                    var element     = UI.$(this),
                        inviewstate = element.data('inviewstate'),
                        inview      = UI.Utils.isInView(element, $this.options),
                        toggle      = element.data('ukScrollspyCls') || togglecls[toggleclsIdx].trim();

                    if (inview && !inviewstate && !element.data('scrollspy-idle')) {

                        if (!initinview) {
                            element.addClass($this.options.initcls);
                            $this.offset = element.offset();
                            initinview = true;

                            element.trigger('init.uk.scrollspy');
                        }

                        element.data('scrollspy-idle', setTimeout(function(){

                            element.addClass('uk-scrollspy-inview').toggleClass(toggle).width();
                            element.trigger('inview.uk.scrollspy');

                            element.data('scrollspy-idle', false);
                            element.data('inviewstate', true);

                        }, $this.options.delay * delayIdx));

                        delayIdx++;
                    }

                    if (!inview && inviewstate && $this.options.repeat) {

                        if (element.data('scrollspy-idle')) {
                            clearTimeout(element.data('scrollspy-idle'));
                            element.data('scrollspy-idle', false);
                        }

                        element.removeClass('uk-scrollspy-inview').toggleClass(toggle);
                        element.data('inviewstate', false);

                        element.trigger('outview.uk.scrollspy');
                    }

                    toggleclsIdx = togglecls[toggleclsIdx + 1] ? (toggleclsIdx + 1) : 0;

                });
            };

            fn();

            this.check = fn;

            scrollspies.push(this);
        }
    });


    var scrollspynavs = [],
        checkScrollSpyNavs = function() {
            for(var i=0; i < scrollspynavs.length; i++) {
                window.requestAnimationFrame.apply(window, [scrollspynavs[i].check]);
            }
        };

    UI.component('scrollspynav', {

        defaults: {
            cls          : 'uk-active',
            closest      : false,
            topoffset    : 0,
            leftoffset   : 0,
            smoothscroll : false
        },

        boot: function() {

            // listen to scroll and resize
            $doc.on('scrolling.uk.document', checkScrollSpyNavs);
            $win.on('resize orientationchange', UI.Utils.debounce(checkScrollSpyNavs, 50));

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-scrollspy-nav]', context).each(function() {

                    var element = UI.$(this);

                    if (!element.data('scrollspynav')) {
                        var obj = UI.scrollspynav(element, UI.Utils.options(element.attr('data-uk-scrollspy-nav')));
                    }
                });
            });
        },

        init: function() {

            var ids     = [],
                links   = this.find("a[href^='#']").each(function(){ if(this.getAttribute('href').trim()!=='#') ids.push(this.getAttribute('href')); }),
                targets = UI.$(ids.join(",")),

                clsActive  = this.options.cls,
                clsClosest = this.options.closest || this.options.closest;

            var $this = this, inviews, fn = function(){

                inviews = [];

                for (var i=0 ; i < targets.length ; i++) {
                    if (UI.Utils.isInView(targets.eq(i), $this.options)) {
                        inviews.push(targets.eq(i));
                    }
                }

                if (inviews.length) {

                    var navitems,
                        scrollTop = $win.scrollTop(),
                        target = (function(){
                            for(var i=0; i< inviews.length;i++){
                                if (inviews[i].offset().top - $this.options.topoffset >= scrollTop){
                                    return inviews[i];
                                }
                            }
                        })();

                    if (!target) return;

                    if ($this.options.closest) {
                        links.blur().closest(clsClosest).removeClass(clsActive);
                        navitems = links.filter("a[href='#"+target.attr('id')+"']").closest(clsClosest).addClass(clsActive);
                    } else {
                        navitems = links.removeClass(clsActive).filter("a[href='#"+target.attr("id")+"']").addClass(clsActive);
                    }

                    $this.element.trigger('inview.uk.scrollspynav', [target, navitems]);
                }
            };

            if (this.options.smoothscroll && UI.smoothScroll) {
                links.each(function(){
                    UI.smoothScroll(this, $this.options.smoothscroll);
                });
            }

            fn();

            this.element.data('scrollspynav', this);

            this.check = fn;
            scrollspynavs.push(this);

        }
    });

})(UIkit);

(function(UI){

    "use strict";

    var toggles = [];

    UI.component('toggle', {

        defaults: {
            target    : false,
            cls       : 'uk-hidden',
            animation : false,
            duration  : 200
        },

        boot: function(){

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-toggle]', context).each(function() {
                    var ele = UI.$(this);

                    if (!ele.data('toggle')) {
                        var obj = UI.toggle(ele, UI.Utils.options(ele.attr('data-uk-toggle')));
                    }
                });

                setTimeout(function(){

                    toggles.forEach(function(toggle){
                        toggle.getToggles();
                    });

                }, 0);
            });
        },

        init: function() {

            var $this = this;

            this.aria = (this.options.cls.indexOf('uk-hidden') !== -1);

            this.on('click', function(e) {

                if ($this.element.is('a[href="#"]')) {
                    e.preventDefault();
                }

                $this.toggle();
            });

            toggles.push(this);
        },

        toggle: function() {

            this.getToggles();

            if(!this.totoggle.length) return;

            if (this.options.animation && UI.support.animation) {

                var $this = this, animations = this.options.animation.split(',');

                if (animations.length == 1) {
                    animations[1] = animations[0];
                }

                animations[0] = animations[0].trim();
                animations[1] = animations[1].trim();

                this.totoggle.css('animation-duration', this.options.duration+'ms');

                this.totoggle.each(function(){

                    var ele = UI.$(this);

                    if (ele.hasClass($this.options.cls)) {

                        ele.toggleClass($this.options.cls);

                        UI.Utils.animate(ele, animations[0]).then(function(){
                            ele.css('animation-duration', '');
                            UI.Utils.checkDisplay(ele);
                        });

                    } else {

                        UI.Utils.animate(this, animations[1]+' uk-animation-reverse').then(function(){
                            ele.toggleClass($this.options.cls).css('animation-duration', '');
                            UI.Utils.checkDisplay(ele);
                        });

                    }

                });

            } else {
                this.totoggle.toggleClass(this.options.cls);
                UI.Utils.checkDisplay(this.totoggle);
            }

            this.updateAria();

        },

        getToggles: function() {
            this.totoggle = this.options.target ? UI.$(this.options.target):[];
            this.updateAria();
        },

        updateAria: function() {
            if (this.aria && this.totoggle.length) {
                this.totoggle.not('[aria-hidden]').each(function(){
                    UI.$(this).attr('aria-hidden', UI.$(this).hasClass('uk-hidden'));
                });
            }
        }
    });

})(UIkit);

(function(UI) {

    "use strict";

    UI.component('alert', {

        defaults: {
            fade: true,
            duration: 200,
            trigger: '.uk-alert-close'
        },

        boot: function() {

            // init code
            UI.$html.on('click.alert.uikit', '[data-uk-alert]', function(e) {

                var ele = UI.$(this);

                if (!ele.data('alert')) {

                    var alert = UI.alert(ele, UI.Utils.options(ele.attr('data-uk-alert')));

                    if (UI.$(e.target).is(alert.options.trigger)) {
                        e.preventDefault();
                        alert.close();
                    }
                }
            });
        },

        init: function() {

            var $this = this;

            this.on('click', this.options.trigger, function(e) {
                e.preventDefault();
                $this.close();
            });
        },

        close: function() {

            var element       = this.trigger('close.uk.alert'),
                removeElement = function () {
                    this.trigger('closed.uk.alert').remove();
                }.bind(this);

            if (this.options.fade) {
                element.css('overflow', 'hidden').css("max-height", element.height()).animate({
                    height         : 0,
                    opacity        : 0,
                    paddingTop    : 0,
                    paddingBottom : 0,
                    marginTop     : 0,
                    marginBottom  : 0
                }, this.options.duration, removeElement);
            } else {
                removeElement();
            }
        }

    });

})(UIkit);

(function(UI) {

    "use strict";

    UI.component('buttonRadio', {

        defaults: {
            activeClass: 'uk-active',
            target: '.uk-button'
        },

        boot: function() {

            // init code
            UI.$html.on('click.buttonradio.uikit', '[data-uk-button-radio]', function(e) {

                var ele = UI.$(this);

                if (!ele.data('buttonRadio')) {

                    var obj    = UI.buttonRadio(ele, UI.Utils.options(ele.attr('data-uk-button-radio'))),
                        target = UI.$(e.target);

                    if (target.is(obj.options.target)) {
                        target.trigger('click');
                    }
                }
            });
        },

        init: function() {

            var $this = this;

            // Init ARIA
            this.find($this.options.target).attr('aria-checked', 'false').filter('.' + $this.options.activeClass).attr('aria-checked', 'true');

            this.on('click', this.options.target, function(e) {

                var ele = UI.$(this);

                if (ele.is('a[href="#"]')) e.preventDefault();

                $this.find($this.options.target).not(ele).removeClass($this.options.activeClass).blur();
                ele.addClass($this.options.activeClass);

                // Update ARIA
                $this.find($this.options.target).not(ele).attr('aria-checked', 'false');
                ele.attr('aria-checked', 'true');

                $this.trigger('change.uk.button', [ele]);
            });

        },

        getSelected: function() {
            return this.find('.' + this.options.activeClass);
        }
    });

    UI.component('buttonCheckbox', {

        defaults: {
            activeClass: 'uk-active',
            target: '.uk-button'
        },

        boot: function() {

            UI.$html.on('click.buttoncheckbox.uikit', '[data-uk-button-checkbox]', function(e) {
                var ele = UI.$(this);

                if (!ele.data('buttonCheckbox')) {

                    var obj    = UI.buttonCheckbox(ele, UI.Utils.options(ele.attr('data-uk-button-checkbox'))),
                        target = UI.$(e.target);

                    if (target.is(obj.options.target)) {
                        target.trigger('click');
                    }
                }
            });
        },

        init: function() {

            var $this = this;

            // Init ARIA
            this.find($this.options.target).attr('aria-checked', 'false').filter('.' + $this.options.activeClass).attr('aria-checked', 'true');

            this.on('click', this.options.target, function(e) {
                var ele = UI.$(this);

                if (ele.is('a[href="#"]')) e.preventDefault();

                ele.toggleClass($this.options.activeClass).blur();

                // Update ARIA
                ele.attr('aria-checked', ele.hasClass($this.options.activeClass));

                $this.trigger('change.uk.button', [ele]);
            });

        },

        getSelected: function() {
            return this.find('.' + this.options.activeClass);
        }
    });


    UI.component('button', {

        defaults: {},

        boot: function() {

            UI.$html.on('click.button.uikit', '[data-uk-button]', function(e) {
                var ele = UI.$(this);

                if (!ele.data('button')) {

                    var obj = UI.button(ele, UI.Utils.options(ele.attr('data-uk-button')));
                    ele.trigger('click');
                }
            });
        },

        init: function() {

            var $this = this;

            // Init ARIA
            this.element.attr('aria-pressed', this.element.hasClass("uk-active"));

            this.on('click', function(e) {

                if ($this.element.is('a[href="#"]')) e.preventDefault();

                $this.toggle();
                $this.trigger('change.uk.button', [$this.element.blur().hasClass('uk-active')]);
            });

        },

        toggle: function() {
            this.element.toggleClass('uk-active');

            // Update ARIA
            this.element.attr('aria-pressed', this.element.hasClass('uk-active'));
        }
    });

})(UIkit);

(function(UI) {

    "use strict";

    var active = false, hoverIdle, flips = {
        x: {
            'bottom-left'   : 'bottom-right',
            'bottom-right'  : 'bottom-left',
            'bottom-center' : 'bottom-center',
            'top-left'      : 'top-right',
            'top-right'     : 'top-left',
            'top-center'    : 'top-center',
            'left-top'      : 'right-top',
            'left-bottom'   : 'right-bottom',
            'left-center'   : 'right-center',
            'right-top'     : 'left-top',
            'right-bottom'  : 'left-bottom',
            'right-center'  : 'left-center'
        },
        y: {
            'bottom-left'   : 'top-left',
            'bottom-right'  : 'top-right',
            'bottom-center' : 'top-center',
            'top-left'      : 'bottom-left',
            'top-right'     : 'bottom-right',
            'top-center'    : 'bottom-center',
            'left-top'      : 'left-bottom',
            'left-bottom'   : 'left-top',
            'left-center'   : 'left-center',
            'right-top'     : 'right-bottom',
            'right-bottom'  : 'right-top',
            'right-center'  : 'right-center'
        },
        xy: {
            'bottom-left'   : 'top-right',
            'bottom-right'  : 'top-left',
            'bottom-center' : 'top-center',
            'top-left'      : 'bottom-right',
            'top-right'     : 'bottom-left',
            'top-center'    : 'bottom-center',
            'left-top'      : 'right-bottom',
            'left-bottom'   : 'right-top',
            'left-center'   : 'right-center',
            'right-top'     : 'left-bottom',
            'right-bottom'  : 'left-top',
            'right-center'  : 'left-center'
        }
    };

    UI.component('dropdown', {

        defaults: {
           mode            : 'hover',
           pos             : 'bottom-left',
           offset          : 0,
           remaintime      : 800,
           justify         : false,
           boundary        : UI.$win,
           delay           : 0,
           dropdownSelector: '.uk-dropdown,.uk-dropdown-blank',
           hoverDelayIdle  : 250,
           preventflip     : false
        },

        remainIdle: false,

        boot: function() {

            var triggerevent = UI.support.touch ? 'click' : 'mouseenter';

            // init code
            UI.$html.on(triggerevent+'.dropdown.uikit focus pointerdown', '[data-uk-dropdown]', function(e) {

                var ele = UI.$(this);

                if (!ele.data('dropdown')) {

                    var dropdown = UI.dropdown(ele, UI.Utils.options(ele.attr('data-uk-dropdown')));

                    if (e.type=='click' || (e.type=='mouseenter' && dropdown.options.mode=='hover')) {
                        dropdown.element.trigger(triggerevent);
                    }

                    if (dropdown.dropdown.length) {
                        e.preventDefault();
                    }
                }
            });
        },

        init: function() {

            var $this = this;

            this.dropdown     = this.find(this.options.dropdownSelector);
            this.offsetParent = this.dropdown.parents().filter(function() {
                return UI.$.inArray(UI.$(this).css('position'), ['relative', 'fixed', 'absolute']) !== -1;
            }).slice(0,1);

            if (!this.offsetParent.length) {
                this.offsetParent = this.element;
            }

            this.centered  = this.dropdown.hasClass('uk-dropdown-center');
            this.justified = this.options.justify ? UI.$(this.options.justify) : false;

            this.boundary  = UI.$(this.options.boundary);

            if (!this.boundary.length) {
                this.boundary = UI.$win;
            }

            // legacy DEPRECATED!
            if (this.dropdown.hasClass('uk-dropdown-up')) {
                this.options.pos = 'top-left';
            }
            if (this.dropdown.hasClass('uk-dropdown-flip')) {
                this.options.pos = this.options.pos.replace('left','right');
            }
            if (this.dropdown.hasClass('uk-dropdown-center')) {
                this.options.pos = this.options.pos.replace(/(left|right)/,'center');
            }
            //-- end legacy

            // Init ARIA
            this.element.attr('aria-haspopup', 'true');
            this.element.attr('aria-expanded', this.element.hasClass('uk-open'));
            this.dropdown.attr('aria-hidden', 'true');

            if (this.options.mode == 'click' || UI.support.touch) {

                this.on('click.uk.dropdown', function(e) {

                    var $target = UI.$(e.target);

                    if (!$target.parents($this.options.dropdownSelector).length) {

                        if ($target.is("a[href='#']") || $target.parent().is("a[href='#']") || ($this.dropdown.length && !$this.dropdown.is(':visible')) ){
                            e.preventDefault();
                        }

                        $target.blur();
                    }

                    if (!$this.element.hasClass('uk-open')) {

                        $this.show();

                    } else {

                        if (!$this.dropdown.find(e.target).length || $target.is('.uk-dropdown-close') || $target.parents('.uk-dropdown-close').length) {
                            $this.hide();
                        }
                    }
                });

            } else {

                this.on('mouseenter', function(e) {

                    $this.trigger('pointerenter.uk.dropdown', [$this]);

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    if (active && active == $this) {
                        return;
                    }

                    // pseudo manuAim
                    if (active && active != $this) {

                        hoverIdle = setTimeout(function() {
                            hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);
                        }, $this.options.hoverDelayIdle);

                    } else {

                        hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);
                    }

                }).on('mouseleave', function() {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    $this.remainIdle = setTimeout(function() {
                        if (active && active == $this) $this.hide();
                    }, $this.options.remaintime);

                    $this.trigger('pointerleave.uk.dropdown', [$this]);

                }).on('click', function(e){

                    var $target = UI.$(e.target);

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if (active && active == $this) {
                        if (!$this.dropdown.find(e.target).length || $target.is('.uk-dropdown-close') || $target.parents('.uk-dropdown-close').length) {
                            $this.hide();
                        }
                        return;
                    }

                    if ($target.is("a[href='#']") || $target.parent().is("a[href='#']")){
                        e.preventDefault();
                    }

                    $this.show();
                });
            }
        },

        show: function(){

            UI.$html.off('click.outer.dropdown');

            if (active && active != this) {
                active.hide(true);
            }

            if (hoverIdle) {
                clearTimeout(hoverIdle);
            }

            this.trigger('beforeshow.uk.dropdown', [this]);

            this.checkDimensions();
            this.element.addClass('uk-open');

            // Update ARIA
            this.element.attr('aria-expanded', 'true');
            this.dropdown.attr('aria-hidden', 'false');

            this.trigger('show.uk.dropdown', [this]);

            UI.Utils.checkDisplay(this.dropdown, true);
            UI.Utils.focus(this.dropdown);
            active = this;

            this.registerOuterClick();
        },

        hide: function(force) {

            this.trigger('beforehide.uk.dropdown', [this, force]);

            this.element.removeClass('uk-open');

            if (this.remainIdle) {
                clearTimeout(this.remainIdle);
            }

            this.remainIdle = false;

            // Update ARIA
            this.element.attr('aria-expanded', 'false');
            this.dropdown.attr('aria-hidden', 'true');

            this.trigger('hide.uk.dropdown', [this, force]);

            if (active == this) active = false;
        },

        registerOuterClick: function(){

            var $this = this;

            UI.$html.off('click.outer.dropdown');

            setTimeout(function() {

                UI.$html.on('click.outer.dropdown', function(e) {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    var $target = UI.$(e.target);

                    if (active == $this && !$this.element.find(e.target).length) {
                        $this.hide(true);
                        UI.$html.off('click.outer.dropdown');
                    }
                });
            }, 10);
        },

        checkDimensions: function() {

            if (!this.dropdown.length) return;

            // reset
            this.dropdown.removeClass('uk-dropdown-top uk-dropdown-bottom uk-dropdown-left uk-dropdown-right uk-dropdown-stack uk-dropdown-autoflip').css({
                topLeft :'',
                left :'',
                marginLeft :'',
                marginRight :''
            });

            if (this.justified && this.justified.length) {
                this.dropdown.css('min-width', '');
            }

            var $this          = this,
                pos            = UI.$.extend({}, this.offsetParent.offset(), {width: this.offsetParent[0].offsetWidth, height: this.offsetParent[0].offsetHeight}),
                posoffset      = this.options.offset,
                dropdown       = this.dropdown,
                offset         = dropdown.show().offset() || {left: 0, top: 0},
                width          = dropdown.outerWidth(),
                height         = dropdown.outerHeight(),
                boundarywidth  = this.boundary.width(),
                boundaryoffset = this.boundary[0] !== window && this.boundary.offset() ? this.boundary.offset(): {top:0, left:0},
                dpos           = this.options.pos;

            var variants =  {
                    'bottom-left'   : {top: 0 + pos.height + posoffset, left: 0},
                    'bottom-right'  : {top: 0 + pos.height + posoffset, left: 0 + pos.width - width},
                    'bottom-center' : {top: 0 + pos.height + posoffset, left: 0 + pos.width / 2 - width / 2},
                    'top-left'      : {top: 0 - height - posoffset, left: 0},
                    'top-right'     : {top: 0 - height - posoffset, left: 0 + pos.width - width},
                    'top-center'    : {top: 0 - height - posoffset, left: 0 + pos.width / 2 - width / 2},
                    'left-top'      : {top: 0, left: 0 - width - posoffset},
                    'left-bottom'   : {top: 0 + pos.height - height, left: 0 - width - posoffset},
                    'left-center'   : {top: 0 + pos.height / 2 - height / 2, left: 0 - width - posoffset},
                    'right-top'     : {top: 0, left: 0 + pos.width + posoffset},
                    'right-bottom'  : {top: 0 + pos.height - height, left: 0 + pos.width + posoffset},
                    'right-center'  : {top: 0 + pos.height / 2 - height / 2, left: 0 + pos.width + posoffset}
                },
                css = {},
                pp;

            pp = dpos.split('-');
            css = variants[dpos] ? variants[dpos] : variants['bottom-left'];

            // justify dropdown
            if (this.justified && this.justified.length) {
                justify(dropdown.css({left:0}), this.justified, boundarywidth);
            } else {

                if (this.options.preventflip !== true) {

                    var fdpos;

                    switch(this.checkBoundary(pos.left + css.left, pos.top + css.top, width, height, boundarywidth)) {
                        case "x":
                            if(this.options.preventflip !=='x') fdpos = flips['x'][dpos] || 'right-top';
                            break;
                        case "y":
                            if(this.options.preventflip !=='y') fdpos = flips['y'][dpos] || 'top-left';
                            break;
                        case "xy":
                            if(!this.options.preventflip) fdpos = flips['xy'][dpos] || 'right-bottom';
                            break;
                    }

                    if (fdpos) {

                        pp  = fdpos.split('-');
                        css = variants[fdpos] ? variants[fdpos] : variants['bottom-left'];
                        dropdown.addClass('uk-dropdown-autoflip');

                        // check flipped
                        if (this.checkBoundary(pos.left + css.left, pos.top + css.top, width, height, boundarywidth)) {
                            pp  = dpos.split('-');
                            css = variants[dpos] ? variants[dpos] : variants['bottom-left'];
                        }
                    }
                }
            }

            if (width > boundarywidth) {
                dropdown.addClass('uk-dropdown-stack');
                this.trigger('stack.uk.dropdown', [this]);
            }

            dropdown.css(css).css('display', '').addClass('uk-dropdown-'+pp[0]);
        },

        checkBoundary: function(left, top, width, height, boundarywidth) {

            var axis = "";

            if (left < 0 || ((left - UI.$win.scrollLeft())+width) > boundarywidth) {
               axis += "x";
            }

            if ((top - UI.$win.scrollTop()) < 0 || ((top - UI.$win.scrollTop())+height) > window.innerHeight) {
               axis += "y";
            }

            return axis;
        }
    });


    UI.component('dropdownOverlay', {

        defaults: {
           justify : false,
           cls     : '',
           duration: 200
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-dropdown-overlay]', context).each(function() {
                    var ele = UI.$(this);

                    if (!ele.data('dropdownOverlay')) {
                        UI.dropdownOverlay(ele, UI.Utils.options(ele.attr('data-uk-dropdown-overlay')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.justified = this.options.justify ? UI.$(this.options.justify) : false;
            this.overlay   = this.element.find('uk-dropdown-overlay');

            if (!this.overlay.length) {
                this.overlay = UI.$('<div class="uk-dropdown-overlay"></div>').appendTo(this.element);
            }

            this.overlay.addClass(this.options.cls);

            this.on({

                'beforeshow.uk.dropdown': function(e, dropdown) {
                    $this.dropdown = dropdown;

                    if ($this.justified && $this.justified.length) {
                        justify($this.overlay.css({display:'block', marginLeft:'', marginRight:''}), $this.justified, $this.justified.outerWidth());
                    }
                },

                'show.uk.dropdown': function(e, dropdown) {

                    var h = $this.dropdown.dropdown.outerHeight(true);

                    $this.dropdown.element.removeClass('uk-open');

                    $this.overlay.stop().css('display', 'block').animate({height: h}, $this.options.duration, function() {

                       $this.dropdown.dropdown.css('visibility', '');
                       $this.dropdown.element.addClass('uk-open');

                       UI.Utils.checkDisplay($this.dropdown.dropdown, true);
                    });

                    $this.pointerleave = false;
                },

                'hide.uk.dropdown': function() {
                    $this.overlay.stop().animate({height: 0}, $this.options.duration);
                },

                'pointerenter.uk.dropdown': function(e, dropdown) {
                    clearTimeout($this.remainIdle);
                },

                'pointerleave.uk.dropdown': function(e, dropdown) {
                    $this.pointerleave = true;
                }
            });


            this.overlay.on({

                'mouseenter': function() {
                    if ($this.remainIdle) {
                        clearTimeout($this.dropdown.remainIdle);
                        clearTimeout($this.remainIdle);
                    }
                },

                'mouseleave': function(){

                    if ($this.pointerleave && active) {

                        $this.remainIdle = setTimeout(function() {
                           if(active) active.hide();
                        }, active.options.remaintime);
                    }
                }
            })
        }

    });


    function justify(ele, justifyTo, boundarywidth, offset) {

        ele           = UI.$(ele);
        justifyTo     = UI.$(justifyTo);
        boundarywidth = boundarywidth || window.innerWidth;
        offset        = offset || ele.offset();

        if (justifyTo.length) {

            var jwidth = justifyTo.outerWidth();

            ele.css('min-width', jwidth);

            if (UI.langdirection == 'right') {

                var right1   = boundarywidth - (justifyTo.offset().left + jwidth),
                    right2   = boundarywidth - (ele.offset().left + ele.outerWidth());

                ele.css('margin-right', right1 - right2);

            } else {
                ele.css('margin-left', justifyTo.offset().left - offset.left);
            }
        }
    }

})(UIkit);

(function(UI) {

    "use strict";

    var grids = [];

    UI.component('gridMatchHeight', {

        defaults: {
            target        : false,
            row           : true,
            ignorestacked : false,
            observe       : false
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-grid-match]', context).each(function() {
                    var grid = UI.$(this), obj;

                    if (!grid.data('gridMatchHeight')) {
                        obj = UI.gridMatchHeight(grid, UI.Utils.options(grid.attr('data-uk-grid-match')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.columns  = this.element.children();
            this.elements = this.options.target ? this.find(this.options.target) : this.columns;

            if (!this.columns.length) return;

            UI.$win.on('load resize orientationchange', (function() {

                var fn = function() {
                    if ($this.element.is(':visible')) $this.match();
                };

                UI.$(function() { fn(); });

                return UI.Utils.debounce(fn, 50);
            })());

            if (this.options.observe) {

                UI.domObserve(this.element, function(e) {
                    if ($this.element.is(':visible')) $this.match();
                });
            }

            this.on('display.uk.check', function(e) {
                if(this.element.is(':visible')) this.match();
            }.bind(this));

            grids.push(this);
        },

        match: function() {

            var firstvisible = this.columns.filter(':visible:first');

            if (!firstvisible.length) return;

            var stacked = Math.ceil(100 * parseFloat(firstvisible.css('width')) / parseFloat(firstvisible.parent().css('width'))) >= 100;

            if (stacked && !this.options.ignorestacked) {
                this.revert();
            } else {
                UI.Utils.matchHeights(this.elements, this.options);
            }

            return this;
        },

        revert: function() {
            this.elements.css('min-height', '');
            return this;
        }
    });

    UI.component('gridMargin', {

        defaults: {
            cls      : 'uk-grid-margin',
            rowfirst : 'uk-row-first'
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-grid-margin]', context).each(function() {
                    var grid = UI.$(this), obj;

                    if (!grid.data('gridMargin')) {
                        obj = UI.gridMargin(grid, UI.Utils.options(grid.attr('data-uk-grid-margin')));
                    }
                });
            });
        },

        init: function() {

            var stackMargin = UI.stackMargin(this.element, this.options);
        }
    });

})(UIkit);

(function(UI) {

    "use strict";

    var active = false, activeCount = 0, $html = UI.$html, body;

    UI.$win.on('resize orientationchange', UI.Utils.debounce(function(){
        UI.$('.uk-modal.uk-open').each(function(){
            return UI.$(this).data('modal') && UI.$(this).data('modal').resize();
        });
    }, 150));

    UI.component('modal', {

        defaults: {
            keyboard: true,
            bgclose: true,
            minScrollHeight: 150,
            center: false,
            modal: true
        },

        scrollable: false,
        transition: false,
        hasTransitioned: true,

        init: function() {

            if (!body) body = UI.$('body');

            if (!this.element.length) return;

            var $this = this;

            this.paddingdir = 'padding-' + (UI.langdirection == 'left' ? 'right':'left');
            this.dialog     = this.find('.uk-modal-dialog');

            this.active     = false;

            // Update ARIA
            this.element.attr('aria-hidden', this.element.hasClass('uk-open'));

            this.on('click', '.uk-modal-close', function(e) {
                e.preventDefault();
                $this.hide();
            }).on('click', function(e) {

                var target = UI.$(e.target);

                if (target[0] == $this.element[0] && $this.options.bgclose) {
                    $this.hide();
                }
            });

            UI.domObserve(this.element, function(e) { $this.resize(); });
        },

        toggle: function() {
            return this[this.isActive() ? 'hide' : 'show']();
        },

        show: function() {

            if (!this.element.length) return;

            var $this = this;

            if (this.isActive()) return;

            if (this.options.modal && active) {
                active.hide(true);
            }

            this.element.removeClass('uk-open').show();
            this.resize(true);

            if (this.options.modal) {
                active = this;
            }

            this.active = true;

            activeCount++;

            if (UI.support.transition) {
                this.hasTransitioned = false;
                this.element.one(UI.support.transition.end, function(){
                    $this.hasTransitioned = true;
                    UI.Utils.focus($this.dialog, 'a[href]');
                }).addClass('uk-open');
            } else {
                this.element.addClass('uk-open');
                UI.Utils.focus(this.dialog, 'a[href]');
            }

            $html.addClass('uk-modal-page').height(); // force browser engine redraw

            // Update ARIA
            this.element.attr('aria-hidden', 'false');

            this.element.trigger('show.uk.modal');

            UI.Utils.checkDisplay(this.dialog, true);

            return this;
        },

        hide: function(force) {

            if (!force && UI.support.transition && this.hasTransitioned) {

                var $this = this;

                this.one(UI.support.transition.end, function() {
                    $this._hide();
                }).removeClass('uk-open');

            } else {

                this._hide();
            }

            return this;
        },

        resize: function(force) {

            if (!this.isActive() && !force) return;

            var bodywidth  = body.width();

            this.scrollbarwidth = window.innerWidth - bodywidth;

            body.css(this.paddingdir, this.scrollbarwidth);

            this.element.css('overflow-y', this.scrollbarwidth ? 'scroll' : 'auto');

            if (!this.updateScrollable() && this.options.center) {

                var dh  = this.dialog.outerHeight(),
                pad = parseInt(this.dialog.css('margin-top'), 10) + parseInt(this.dialog.css('margin-bottom'), 10);

                if ((dh + pad) < window.innerHeight) {
                    this.dialog.css({top: (window.innerHeight/2 - dh/2) - pad });
                } else {
                    this.dialog.css({top: ''});
                }
            }
        },

        updateScrollable: function() {

            // has scrollable?
            var scrollable = this.dialog.find('.uk-overflow-container:visible:first');

            if (scrollable.length) {

                scrollable.css('height', 0);

                var offset = Math.abs(parseInt(this.dialog.css('margin-top'), 10)),
                dh     = this.dialog.outerHeight(),
                wh     = window.innerHeight,
                h      = wh - 2*(offset < 20 ? 20:offset) - dh;

                scrollable.css({
                    maxHeight: (h < this.options.minScrollHeight ? '':h),
                    height:''
                });

                return true;
            }

            return false;
        },

        _hide: function() {

            this.active = false;
            if (activeCount > 0) activeCount--;
            else activeCount = 0;

            this.element.hide().removeClass('uk-open');

            // Update ARIA
            this.element.attr('aria-hidden', 'true');

            if (!activeCount) {
                $html.removeClass('uk-modal-page');
                body.css(this.paddingdir, "");
            }

            if (active===this) active = false;

            this.trigger('hide.uk.modal');
        },

        isActive: function() {
            return this.element.hasClass('uk-open');
        }

    });

    UI.component('modalTrigger', {

        boot: function() {

            // init code
            UI.$html.on('click.modal.uikit', '[data-uk-modal]', function(e) {

                var ele = UI.$(this);

                if (ele.is('a')) {
                    e.preventDefault();
                }

                if (!ele.data('modalTrigger')) {
                    var modal = UI.modalTrigger(ele, UI.Utils.options(ele.attr('data-uk-modal')));
                    modal.show();
                }

            });

            // close modal on esc button
            UI.$html.on('keydown.modal.uikit', function (e) {

                if (active && e.keyCode === 27 && active.options.keyboard) { // ESC
                    e.preventDefault();
                    active.hide();
                }
            });
        },

        init: function() {

            var $this = this;

            this.options = UI.$.extend({
                target: $this.element.is('a') ? $this.element.attr('href') : false
            }, this.options);

            this.modal = UI.modal(this.options.target, this.options);

            this.on("click", function(e) {
                e.preventDefault();
                $this.show();
            });

            //methods
            this.proxy(this.modal, 'show hide isActive');
        }
    });

    UI.modal.dialog = function(content, options) {

        var modal = UI.modal(UI.$(UI.modal.dialog.template).appendTo('body'), options);

        modal.on('hide.uk.modal', function(){
            if (modal.persist) {
                modal.persist.appendTo(modal.persist.data('modalPersistParent'));
                modal.persist = false;
            }
            modal.element.remove();
        });

        setContent(content, modal);

        return modal;
    };

    UI.modal.dialog.template = '<div class="uk-modal"><div class="uk-modal-dialog" style="min-height:0;"></div></div>';

    UI.modal.alert = function(content, options) {

        options = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-button-primary uk-modal-close">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('button:first').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.confirm = function(content, onconfirm, oncancel) {

        var options = arguments.length > 1 && arguments[arguments.length-1] ? arguments[arguments.length-1] : {};

        onconfirm = UI.$.isFunction(onconfirm) ? onconfirm : function(){};
        oncancel  = UI.$.isFunction(oncancel) ? oncancel : function(){};
        options   = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, UI.$.isFunction(options) ? {}:options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button js-modal-confirm-cancel">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-confirm">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.element.find(".js-modal-confirm, .js-modal-confirm-cancel").on("click", function(){
            UI.$(this).is('.js-modal-confirm') ? onconfirm() : oncancel();
            modal.hide();
        });

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('.js-modal-confirm').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.prompt = function(text, value, onsubmit, options) {

        onsubmit = UI.$.isFunction(onsubmit) ? onsubmit : function(value){};
        options  = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            text ? '<div class="uk-modal-content uk-form">'+String(text)+'</div>':'',
            '<div class="uk-margin-small-top uk-modal-content uk-form"><p><input type="text" class="uk-width-1-1"></p></div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-modal-close">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-ok">'+options.labels.Ok+'</button></div>'
        ]).join(""), options),

        input = modal.element.find("input[type='text']").val(value || '').on('keyup', function(e){
            if (e.keyCode == 13) {
                modal.element.find('.js-modal-ok').trigger('click');
            }
        });

        modal.element.find('.js-modal-ok').on('click', function(){
            if (onsubmit(input.val())!==false){
                modal.hide();
            }
        });

        return modal.show();
    };

    UI.modal.blockUI = function(content, options) {

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content || '<div class="uk-text-center">...</div>')+'</div>'
        ]).join(""), UI.$.extend({bgclose:false, keyboard:false, modal:false}, options));

        modal.content = modal.element.find('.uk-modal-content:first');

        return modal.show();
    };

    UI.modal.labels = {
        Ok: 'Ok',
        Cancel: 'Cancel'
    };

    // helper functions
    function setContent(content, modal){

        if(!modal) return;

        if (typeof content === 'object') {

            // convert DOM object to a jQuery object
            content = content instanceof jQuery ? content : UI.$(content);

            if(content.parent().length) {
                modal.persist = content;
                modal.persist.data('modalPersistParent', content.parent());
            }
        }else if (typeof content === 'string' || typeof content === 'number') {
                // just insert the data as innerHTML
                content = UI.$('<div></div>').html(content);
        }else {
                // unsupported data type!
                content = UI.$('<div></div>').html('UIkit.modal Error: Unsupported data type: ' + typeof content);
        }

        content.appendTo(modal.element.find('.uk-modal-dialog'));

        return modal;
    }

})(UIkit);

(function(UI) {

    "use strict";

    UI.component('nav', {

        defaults: {
            toggle: '>li.uk-parent > a[href="#"]',
            lists: '>li.uk-parent > ul',
            multiple: false
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-nav]', context).each(function() {
                    var nav = UI.$(this);

                    if (!nav.data('nav')) {
                        var obj = UI.nav(nav, UI.Utils.options(nav.attr('data-uk-nav')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.on('click.uk.nav', this.options.toggle, function(e) {
                e.preventDefault();
                var ele = UI.$(this);
                $this.open(ele.parent()[0] == $this.element[0] ? ele : ele.parent("li"));
            });

            this.update();

            UI.domObserve(this.element, function(e) {
                if ($this.element.find($this.options.lists).not('[role]').length) {
                    $this.update();
                }
            });
        },

        update: function() {

            var $this = this;

            this.find(this.options.lists).each(function() {

                var $ele   = UI.$(this).attr('role', 'menu'),
                    parent = $ele.closest('li'),
                    active = parent.hasClass("uk-active");

                if (!parent.data('list-container')) {
                    $ele.wrap('<div style="overflow:hidden;height:0;position:relative;"></div>');
                    parent.data('list-container', $ele.parent()[active ? 'removeClass':'addClass']('uk-hidden'));
                }

                // Init ARIA
                parent.attr('aria-expanded', parent.hasClass("uk-open"));

                if (active) $this.open(parent, true);
            });
        },

        open: function(li, noanimation) {

            var $this = this, element = this.element, $li = UI.$(li), $container = $li.data('list-container');

            if (!this.options.multiple) {

                element.children('.uk-open').not(li).each(function() {

                    var ele = UI.$(this);

                    if (ele.data('list-container')) {
                        ele.data('list-container').stop().animate({height: 0}, function() {
                            UI.$(this).parent().removeClass('uk-open').end().addClass('uk-hidden');
                        });
                    }
                });
            }

            $li.toggleClass('uk-open');

            // Update ARIA
            $li.attr('aria-expanded', $li.hasClass('uk-open'));

            if ($container) {

                if ($li.hasClass('uk-open')) {
                    $container.removeClass('uk-hidden');
                }

                if (noanimation) {

                    $container.stop().height($li.hasClass('uk-open') ? 'auto' : 0);

                    if (!$li.hasClass('uk-open')) {
                        $container.addClass('uk-hidden');
                    }

                    this.trigger('display.uk.check');

                } else {

                    $container.stop().animate({
                        height: ($li.hasClass('uk-open') ? getHeight($container.find('ul:first')) : 0)
                    }, function() {

                        if (!$li.hasClass('uk-open')) {
                            $container.addClass('uk-hidden');
                        } else {
                            $container.css('height', '');
                        }

                        $this.trigger('display.uk.check');
                    });
                }
            }
        }
    });


    // helper

    function getHeight(ele) {

        var $ele = UI.$(ele), height = 'auto';

        if ($ele.is(':visible')) {
            height = $ele.outerHeight();
        } else {

            var tmp = {
                position: $ele.css('position'),
                visibility: $ele.css('visibility'),
                display: $ele.css('display')
            };

            height = $ele.css({position: 'absolute', visibility: 'hidden', display: 'block'}).outerHeight();

            $ele.css(tmp); // reset element
        }

        return height;
    }

})(UIkit);

(function(UI) {

    "use strict";

    var scrollpos = {x: window.scrollX, y: window.scrollY},
        $win      = UI.$win,
        $doc      = UI.$doc,
        $html     = UI.$html,
        Offcanvas = {

        show: function(element, options) {

            element = UI.$(element);

            if (!element.length) return;

            options = UI.$.extend({mode: 'push'}, options);

            var $body     = UI.$('body'),
                bar       = element.find('.uk-offcanvas-bar:first'),
                rtl       = (UI.langdirection == 'right'),
                flip      = bar.hasClass('uk-offcanvas-bar-flip') ? -1:1,
                dir       = flip * (rtl ? -1 : 1),

                scrollbarwidth =  window.innerWidth - $body.width();

            scrollpos = {x: window.pageXOffset, y: window.pageYOffset};

            bar.attr('mode', options.mode);
            element.addClass('uk-active');

            $body.css({width: window.innerWidth - scrollbarwidth, height: window.innerHeight}).addClass('uk-offcanvas-page');

            if (options.mode == 'push' || options.mode == 'reveal') {
                $body.css((rtl ? 'margin-right' : 'margin-left'), (rtl ? -1 : 1) * (bar.outerWidth() * dir));
            }

            if (options.mode == 'reveal') {
                bar.css('clip', 'rect(0, '+bar.outerWidth()+'px, 100vh, 0)');
            }

            $html.css('margin-top', scrollpos.y * -1).width(); // .width() - force redraw


            bar.addClass('uk-offcanvas-bar-show');

            this._initElement(element);

            bar.trigger('show.uk.offcanvas', [element, bar]);

            // Update ARIA
            element.attr('aria-hidden', 'false');
        },

        hide: function(force) {

            var $body = UI.$('body'),
                panel = UI.$('.uk-offcanvas.uk-active'),
                rtl   = (UI.langdirection == 'right'),
                bar   = panel.find('.uk-offcanvas-bar:first'),
                finalize = function() {
                    $body.removeClass('uk-offcanvas-page').css({width: '', height: '', marginLeft: '', marginRight: ''});
                    panel.removeClass('uk-active');

                    bar.removeClass('uk-offcanvas-bar-show');
                    $html.css('margin-top', '');
                    window.scrollTo(scrollpos.x, scrollpos.y);
                    bar.trigger('hide.uk.offcanvas', [panel, bar]);

                    // Update ARIA
                    panel.attr('aria-hidden', 'true');
                };

            if (!panel.length) return;
            if (bar.attr('mode') == 'none') force = true;

            if (UI.support.transition && !force) {

                $body.one(UI.support.transition.end, function() {
                    finalize();
                }).css((rtl ? 'margin-right' : 'margin-left'), '');

                if (bar.attr('mode') == 'reveal') {
                    bar.css('clip', '');
                }

                setTimeout(function(){
                    bar.removeClass('uk-offcanvas-bar-show');
                }, 0);

            } else {
                finalize();
            }
        },

        _initElement: function(element) {

            if (element.data('OffcanvasInit')) return;

            element.on('click.uk.offcanvas swipeRight.uk.offcanvas swipeLeft.uk.offcanvas', function(e) {

                var target = UI.$(e.target);

                if (!e.type.match(/swipe/)) {

                    if (!target.hasClass('uk-offcanvas-close')) {
                        if (target.hasClass('uk-offcanvas-bar')) return;
                        if (target.parents('.uk-offcanvas-bar:first').length) return;
                    }
                }

                e.stopImmediatePropagation();
                Offcanvas.hide();
            });

            element.on('click', 'a[href*="#"]', function(e){

                var link = UI.$(this),
                    href = link.attr('href');

                if (href == '#') {
                    return;
                }

                UI.$doc.one('hide.uk.offcanvas', function() {

                    var target;

                    try {
                        target = UI.$(link[0].hash);
                    } catch (e){
                        target = '';
                    }

                    if (!target.length) {
                        target = UI.$('[name="'+link[0].hash.replace('#','')+'"]');
                    }

                    if (target.length && UI.Utils.scrollToElement) {
                        UI.Utils.scrollToElement(target, UI.Utils.options(link.attr('data-uk-smooth-scroll') || '{}'));
                    } else {
                        window.location.href = href;
                    }
                });

                Offcanvas.hide();
            });

            element.data('OffcanvasInit', true);
        }
    };

    UI.component('offcanvasTrigger', {

        boot: function() {

            // init code
            $html.on('click.offcanvas.uikit', '[data-uk-offcanvas]', function(e) {

                e.preventDefault();

                var ele = UI.$(this);

                if (!ele.data('offcanvasTrigger')) {
                    var obj = UI.offcanvasTrigger(ele, UI.Utils.options(ele.attr('data-uk-offcanvas')));
                    ele.trigger("click");
                }
            });

            $html.on('keydown.uk.offcanvas', function(e) {

                if (e.keyCode === 27) { // ESC
                    Offcanvas.hide();
                }
            });
        },

        init: function() {

            var $this = this;

            this.options = UI.$.extend({
                target: $this.element.is('a') ? $this.element.attr('href') : false,
                mode: 'push'
            }, this.options);

            this.on('click', function(e) {
                e.preventDefault();
                Offcanvas.show($this.options.target, $this.options);
            });
        }
    });

    UI.offcanvas = Offcanvas;

})(UIkit);

(function(UI) {

    "use strict";

    var Animations;

    UI.component('switcher', {

        defaults: {
            connect   : false,
            toggle    : '>*',
            active    : 0,
            animation : false,
            duration  : 200,
            swiping   : true
        },

        animating: false,

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-switcher]', context).each(function() {
                    var switcher = UI.$(this);

                    if (!switcher.data('switcher')) {
                        var obj = UI.switcher(switcher, UI.Utils.options(switcher.attr('data-uk-switcher')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.on('click.uk.switcher', this.options.toggle, function(e) {
                e.preventDefault();
                $this.show(this);
            });

            if (!this.options.connect) {
                return;
            }

            this.connect = UI.$(this.options.connect);

            if (!this.connect.length) {
                return;
            }

            this.connect.on('click.uk.switcher', '[data-uk-switcher-item]', function(e) {

                e.preventDefault();

                var item = UI.$(this).attr('data-uk-switcher-item');

                if ($this.index == item) return;

                switch(item) {
                    case 'next':
                    case 'previous':
                        $this.show($this.index + (item=='next' ? 1:-1));
                        break;
                    default:
                        $this.show(parseInt(item, 10));
                }
            });

            if (this.options.swiping) {

                this.connect.on('swipeRight swipeLeft', function(e) {
                    e.preventDefault();
                    if (!window.getSelection().toString()) {
                        $this.show($this.index + (e.type == 'swipeLeft' ? 1 : -1));
                    }
                });
            }

            this.update();
        },

        update: function() {

            this.connect.children().removeClass('uk-active').attr('aria-hidden', 'true');

            var toggles = this.find(this.options.toggle),
                active  = toggles.filter('.uk-active');

            if (active.length) {
                this.show(active, false);
            } else {

                if (this.options.active===false) return;

                active = toggles.eq(this.options.active);
                this.show(active.length ? active : toggles.eq(0), false);
            }

            // Init ARIA for toggles
            toggles.not(active).attr('aria-expanded', 'false');
            active.attr('aria-expanded', 'true');
        },

        show: function(tab, animate) {

            if (this.animating) {
                return;
            }

            var toggles = this.find(this.options.toggle);

            if (isNaN(tab)) {
                tab = UI.$(tab);
            } else {
                tab = tab < 0 ? toggles.length-1 : tab;
                tab = toggles.eq(toggles[tab] ? tab : 0);
            }

            var $this     = this,
                active    = UI.$(tab),
                animation = Animations[this.options.animation] || function(current, next) {

                    if (!$this.options.animation) {
                        return Animations.none.apply($this);
                    }

                    var anim = $this.options.animation.split(',');

                    if (anim.length == 1) {
                        anim[1] = anim[0];
                    }

                    anim[0] = anim[0].trim();
                    anim[1] = anim[1].trim();

                    return coreAnimation.apply($this, [anim, current, next]);
                };

            if (animate===false || !UI.support.animation) {
                animation = Animations.none;
            }

            if (active.hasClass("uk-disabled")) return;

            // Update ARIA for Toggles
            toggles.attr('aria-expanded', 'false');
            active.attr('aria-expanded', 'true');

            toggles.filter(".uk-active").removeClass("uk-active");
            active.addClass("uk-active");

            if (this.options.connect && this.connect.length) {

                this.index = this.find(this.options.toggle).index(active);

                if (this.index == -1 ) {
                    this.index = 0;
                }

                this.connect.each(function() {

                    var container = UI.$(this),
                        children  = UI.$(container.children()),
                        current   = UI.$(children.filter('.uk-active')),
                        next      = UI.$(children.eq($this.index));

                        $this.animating = true;

                        animation.apply($this, [current, next]).then(function(){

                            current.removeClass("uk-active");
                            next.addClass("uk-active");

                            // Update ARIA for connect
                            current.attr('aria-hidden', 'true');
                            next.attr('aria-hidden', 'false');

                            UI.Utils.checkDisplay(next, true);

                            $this.animating = false;

                        });
                });
            }

            this.trigger("show.uk.switcher", [active]);
        }
    });

    Animations = {

        'none': function() {
            var d = UI.$.Deferred();
            d.resolve();
            return d.promise();
        },

        'fade': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-fade', current, next]);
        },

        'slide-bottom': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-bottom', current, next]);
        },

        'slide-top': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-top', current, next]);
        },

        'slide-vertical': function(current, next, dir) {

            var anim = ['uk-animation-slide-top', 'uk-animation-slide-bottom'];

            if (current && current.index() > next.index()) {
                anim.reverse();
            }

            return coreAnimation.apply(this, [anim, current, next]);
        },

        'slide-left': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-left', current, next]);
        },

        'slide-right': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-right', current, next]);
        },

        'slide-horizontal': function(current, next, dir) {

            var anim = ['uk-animation-slide-right', 'uk-animation-slide-left'];

            if (current && current.index() > next.index()) {
                anim.reverse();
            }

            return coreAnimation.apply(this, [anim, current, next]);
        },

        'scale': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-scale-up', current, next]);
        }
    };

    UI.switcher.animations = Animations;


    // helpers

    function coreAnimation(cls, current, next) {

        var d = UI.$.Deferred(), clsIn = cls, clsOut = cls, release;

        if (next[0]===current[0]) {
            d.resolve();
            return d.promise();
        }

        if (typeof(cls) == 'object') {
            clsIn  = cls[0];
            clsOut = cls[1] || cls[0];
        }

        UI.$body.css('overflow-x', 'hidden'); // fix scroll jumping in iOS

        release = function() {

            if (current) current.hide().removeClass('uk-active '+clsOut+' uk-animation-reverse');

            next.addClass(clsIn).one(UI.support.animation.end, function() {

                setTimeout(function () {
                    next.removeClass(''+clsIn+'').css({opacity:'', display:''});
                }, 0);

                d.resolve();

                UI.$body.css('overflow-x', '');

                if (current) current.css({opacity:'', display:''});

            }.bind(this)).show();
        };

        next.css('animation-duration', this.options.duration+'ms');

        if (current && current.length) {

            current.css('animation-duration', this.options.duration+'ms');

            current.css('display', 'none').addClass(clsOut+' uk-animation-reverse').one(UI.support.animation.end, function() {
                release();
            }.bind(this)).css('display', '');

        } else {
            next.addClass('uk-active');
            release();
        }

        return d.promise();
    }

})(UIkit);

(function(UI) {

    "use strict";

    UI.component('tab', {

        defaults: {
            target    : '>li:not(.uk-tab-responsive, .uk-disabled)',
            connect   : false,
            active    : 0,
            animation : false,
            duration  : 200,
            swiping   : true
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-tab]', context).each(function() {

                    var tab = UI.$(this);

                    if (!tab.data('tab')) {
                        var obj = UI.tab(tab, UI.Utils.options(tab.attr('data-uk-tab')));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.current = false;

            this.on('click.uk.tab', this.options.target, function(e) {

                e.preventDefault();

                if ($this.switcher && $this.switcher.animating) {
                    return;
                }

                var current = $this.find($this.options.target).not(this);

                current.removeClass('uk-active').blur();

                $this.trigger('change.uk.tab', [UI.$(this).addClass('uk-active'), $this.current]);

                $this.current = UI.$(this);

                // Update ARIA
                if (!$this.options.connect) {
                    current.attr('aria-expanded', 'false');
                    UI.$(this).attr('aria-expanded', 'true');
                }
            });

            if (this.options.connect) {
                this.connect = UI.$(this.options.connect);
            }

            // init responsive tab
            this.responsivetab = UI.$('<li class="uk-tab-responsive uk-active"><a></a></li>').append('<div class="uk-dropdown uk-dropdown-small"><ul class="uk-nav uk-nav-dropdown"></ul><div>');

            this.responsivetab.dropdown = this.responsivetab.find('.uk-dropdown');
            this.responsivetab.lst      = this.responsivetab.dropdown.find('ul');
            this.responsivetab.caption  = this.responsivetab.find('a:first');

            if (this.element.hasClass('uk-tab-bottom')) this.responsivetab.dropdown.addClass('uk-dropdown-up');

            // handle click
            this.responsivetab.lst.on('click.uk.tab', 'a', function(e) {

                e.preventDefault();
                e.stopPropagation();

                var link = UI.$(this);

                $this.element.children('li:not(.uk-tab-responsive)').eq(link.data('index')).trigger('click');
            });

            this.on('show.uk.switcher change.uk.tab', function(e, tab) {
                $this.responsivetab.caption.html(tab.text());
            });

            this.element.append(this.responsivetab);

            // init UIkit components
            if (this.options.connect) {
                
                this.switcher = UI.switcher(this.element, {
                    toggle    : '>li:not(.uk-tab-responsive)',
                    connect   : this.options.connect,
                    active    : this.options.active,
                    animation : this.options.animation,
                    duration  : this.options.duration,
                    swiping   : this.options.swiping
                });
            }

            UI.dropdown(this.responsivetab, {mode: 'click', preventflip: 'y'});

            // init
            $this.trigger('change.uk.tab', [this.element.find(this.options.target).not('.uk-tab-responsive').filter('.uk-active')]);

            this.check();

            UI.$win.on('resize orientationchange', UI.Utils.debounce(function(){
                if ($this.element.is(':visible'))  $this.check();
            }, 100));

            this.on('display.uk.check', function(){
                if ($this.element.is(':visible'))  $this.check();
            });
        },

        check: function() {

            var children = this.element.children('li:not(.uk-tab-responsive)').removeClass('uk-hidden');

            if (!children.length) {
                this.responsivetab.addClass('uk-hidden');
                return;
            }

            var top          = (children.eq(0).offset().top + Math.ceil(children.eq(0).height()/2)),
                doresponsive = false,
                item, link, clone;

            this.responsivetab.lst.empty();

            children.each(function(){

                if (UI.$(this).offset().top > top) {
                    doresponsive = true;
                }
            });

            if (doresponsive) {

                for (var i = 0; i < children.length; i++) {

                    item  = UI.$(children.eq(i));
                    link  = item.find('a');

                    if (item.css('float') != 'none' && !item.attr('uk-dropdown')) {

                        if (!item.hasClass('uk-disabled')) {

                            clone = UI.$(item[0].outerHTML);
                            clone.find('a').data('index', i);

                            this.responsivetab.lst.append(clone);
                        }

                        item.addClass('uk-hidden');
                    }
                }
            }

            this.responsivetab[this.responsivetab.lst.children('li').length ? 'removeClass':'addClass']('uk-hidden');
        }
    });

})(UIkit);

(function(UI){

    "use strict";

    UI.component('cover', {

        defaults: {
            automute : true
        },

        boot: function() {

            // auto init
            UI.ready(function(context) {

                UI.$('[data-uk-cover]', context).each(function(){

                    var ele = UI.$(this);

                    if(!ele.data('cover')) {
                        var plugin = UI.cover(ele, UI.Utils.options(ele.attr('data-uk-cover')));
                    }
                });
            });
        },

        init: function() {

            this.parent = this.element.parent();

            UI.$win.on('load resize orientationchange', UI.Utils.debounce(function(){
                this.check();
            }.bind(this), 100));

            this.on('display.uk.check', function(e) {
                if (this.element.is(':visible')) this.check();
            }.bind(this));

            this.check();

            if (this.element.is('iframe') && this.options.automute) {

                var src = this.element.attr('src');

                this.element.attr('src', '').on('load', function(){
                    this.contentWindow.postMessage('{ "event": "command", "func": "mute", "method":"setVolume", "value":0}', '*');
                }).attr('src', [src, (src.indexOf('?') > -1 ? '&':'?'), 'enablejsapi=1&api=1'].join(''));
            }
        },

        check: function() {

            this.element.css({ width  : '', height : '' });

            this.dimension = {w: this.element.width(), h: this.element.height()};

            if (this.element.attr('width') && !isNaN(this.element.attr('width'))) {
                this.dimension.w = this.element.attr('width');
            }

            if (this.element.attr('height') && !isNaN(this.element.attr('height'))) {
                this.dimension.h = this.element.attr('height');
            }

            this.ratio = this.dimension.w / this.dimension.h;

            var w = this.parent.width(), h = this.parent.height(), width, height;

            // if element height < parent height (gap underneath)
            if ((w / this.ratio) < h) {

                width  = Math.ceil(h * this.ratio);
                height = h;

            // element width < parent width (gap to right)
            } else {

                width  = w;
                height = Math.ceil(w / this.ratio);
            }

            this.element.css({ width  : width, height : height });
        }
    });

})(UIkit);

/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == 'function' && define.amd) {
        define('uikit-autocomplete', ['uikit'], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var active;

    UI.component('autocomplete', {

        defaults: {
            minLength: 3,
            param: 'search',
            method: 'post',
            delay: 300,
            loadingClass: 'uk-loading',
            flipDropdown: false,
            skipClass: 'uk-skip',
            hoverClass: 'uk-active',
            source: null,
            renderer: null,

            // template

            template: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>'
        },

        visible  : false,
        value    : null,
        selected : null,

        boot: function() {

            // init code
            UI.$html.on('focus.autocomplete.uikit', '[data-uk-autocomplete]', function(e) {

                var ele = UI.$(this);

                if (!ele.data('autocomplete')) {
                    UI.autocomplete(ele, UI.Utils.options(ele.attr('data-uk-autocomplete')));
                }
            });

            // register outer click for autocompletes
            UI.$html.on('click.autocomplete.uikit', function(e) {
                if (active && e.target!=active.input[0]) active.hide();
            });
        },

        init: function() {

            var $this   = this,
                select  = false,
                trigger = UI.Utils.debounce(function(e) {

                    if (select) {
                        return (select = false);
                    }

                    $this.handle();
                }, this.options.delay);


            this.dropdown = this.find('.uk-dropdown');
            this.template = this.find('script[type="text/autocomplete"]').html();
            this.template = UI.Utils.template(this.template || this.options.template);
            this.input    = this.find("input:first").attr("autocomplete", "off");

            if (!this.dropdown.length) {
               this.dropdown = UI.$('<div class="uk-dropdown"></div>').appendTo(this.element);
            }

            if (this.options.flipDropdown) {
                this.dropdown.addClass('uk-dropdown-flip');
            }

            this.dropdown.attr('aria-expanded', 'false');

            this.input.on({

                keydown: function(e) {

                    if (e && e.which && !e.shiftKey && $this.visible) {

                        switch (e.which) {
                            case 13: // enter
                                select = true;

                                if ($this.selected) {
                                    e.preventDefault();
                                    $this.select();
                                }
                                break;
                            case 38: // up
                                e.preventDefault();
                                $this.pick('prev', true);
                                break;
                            case 40: // down
                                e.preventDefault();
                                $this.pick('next', true);
                                break;
                            case 27:
                            case 9: // esc, tab
                                $this.hide();
                                break;
                            default:
                                break;
                        }
                    }

                },

                keyup: trigger
            });

            this.dropdown.on('click', '.uk-autocomplete-results > *', function(){
                $this.select();
            });

            this.dropdown.on('mouseover', '.uk-autocomplete-results > *', function(){
                $this.pick(UI.$(this));
            });

            this.triggercomplete = trigger;
        },

        handle: function() {

            var $this = this, old = this.value;

            this.value = this.input.val();

            if (this.value.length < this.options.minLength) return this.hide();

            if (this.value != old) {
                $this.request();
            }

            return this;
        },

        pick: function(item, scrollinview) {

            var $this    = this,
                items    = UI.$(this.dropdown.find('.uk-autocomplete-results').children(':not(.'+this.options.skipClass+')')),
                selected = false;

            if (typeof item !== "string" && !item.hasClass(this.options.skipClass)) {
                selected = item;
            } else if (item == 'next' || item == 'prev') {

                if (this.selected) {
                    var index = items.index(this.selected);

                    if (item == 'next') {
                        selected = items.eq(index + 1 < items.length ? index + 1 : 0);
                    } else {
                        selected = items.eq(index - 1 < 0 ? items.length - 1 : index - 1);
                    }

                } else {
                    selected = items[(item == 'next') ? 'first' : 'last']();
                }

                selected = UI.$(selected);
            }

            if (selected && selected.length) {
                this.selected = selected;
                items.removeClass(this.options.hoverClass);
                this.selected.addClass(this.options.hoverClass);

                // jump to selected if not in view
                if (scrollinview) {

                    var top       = selected.position().top,
                        scrollTop = $this.dropdown.scrollTop(),
                        dpheight  = $this.dropdown.height();

                    if (top > dpheight ||  top < 0) {
                        $this.dropdown.scrollTop(scrollTop + top);
                    }
                }
            }
        },

        select: function() {

            if(!this.selected) return;

            var data = this.selected.data();

            this.trigger('selectitem.uk.autocomplete', [data, this]);

            if (data.value) {
                this.input.val(data.value).trigger('change');
            }

            this.hide();
        },

        show: function() {

            if (this.visible) return;

            this.visible = true;
            this.element.addClass('uk-open');

            if (active && active!==this) {
                active.hide();
            }

            active = this;

            // Update aria
            this.dropdown.attr('aria-expanded', 'true');

            return this;
        },

        hide: function() {
            if (!this.visible) return;
            this.visible = false;
            this.element.removeClass('uk-open');

            if (active === this) {
                active = false;
            }

            // Update aria
            this.dropdown.attr('aria-expanded', 'false');

            return this;
        },

        request: function() {

            var $this   = this,
                release = function(data) {

                    if(data) {
                        $this.render(data);
                    }

                    $this.element.removeClass($this.options.loadingClass);
                };

            this.element.addClass(this.options.loadingClass);

            if (this.options.source) {

                var source = this.options.source;

                switch(typeof(this.options.source)) {
                    case 'function':

                        this.options.source.apply(this, [release]);

                        break;

                    case 'object':

                        if(source.length) {

                            var items = [];

                            source.forEach(function(item){
                                if(item.value && item.value.toLowerCase().indexOf($this.value.toLowerCase())!=-1) {
                                    items.push(item);
                                }
                            });

                            release(items);
                        }

                        break;

                    case 'string':

                        var params ={};

                        params[this.options.param] = this.value;

                        UI.$.ajax({
                            url: this.options.source,
                            data: params,
                            type: this.options.method,
                            dataType: 'json'
                        }).done(function(json) {
                            release(json || []);
                        });

                        break;

                    default:
                        release(null);
                }

            } else {
                this.element.removeClass($this.options.loadingClass);
            }
        },

        render: function(data) {

            this.dropdown.empty();

            this.selected = false;

            if (this.options.renderer) {

                this.options.renderer.apply(this, [data]);

            } else if(data && data.length) {

                this.dropdown.append(this.template({items:data}));
                this.show();

                this.trigger('show.uk.autocomplete');
            }

            return this;
        }
    });

    return UI.autocomplete;
});

/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == 'function' && define.amd) {
        define('uikit-form-password', ['uikit'], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('formPassword', {

        defaults: {
            lblShow: 'Show',
            lblHide: 'Hide'
        },

        boot: function() {
            // init code
            UI.$html.on('click.formpassword.uikit', '[data-uk-form-password]', function(e) {

                var ele = UI.$(this);

                if (!ele.data('formPassword')) {

                    e.preventDefault();

                    UI.formPassword(ele, UI.Utils.options(ele.attr('data-uk-form-password')));
                    ele.trigger('click');
                }
            });
        },

        init: function() {

            var $this = this;

            this.on('click', function(e) {

                e.preventDefault();

                if($this.input.length) {
                    var type = $this.input.attr('type');
                    $this.input.attr('type', type=='text' ? 'password':'text');
                    $this.element.html($this.options[type=='text' ? 'lblShow':'lblHide']);
                }
            });

            this.input = this.element.next('input').length ? this.element.next('input') : this.element.prev('input');
            this.element.html(this.options[this.input.is('[type="password"]') ? 'lblShow':'lblHide']);


            this.element.data('formPassword', this);
        }
    });

    return UI.formPassword;
});

/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == 'function' && define.amd) {
        define('uikit-notify', ['uikit'], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var containers = {},
        messages   = {},

        notify     =  function(options){

            if (UI.$.type(options) == 'string') {
                options = { message: options };
            }

            if (arguments[1]) {
                options = UI.$.extend(options, UI.$.type(arguments[1]) == 'string' ? {status:arguments[1]} : arguments[1]);
            }

            return (new Message(options)).show();
        },
        closeAll  = function(group, instantly){

            var id;

            if (group) {
                for(id in messages) { if(group===messages[id].group) messages[id].close(instantly); }
            } else {
                for(id in messages) { messages[id].close(instantly); }
            }
        };

    var Message = function(options){

        this.options = UI.$.extend({}, Message.defaults, options);

        this.uuid    = UI.Utils.uid('notifymsg');
        this.element = UI.$([

            '<div class="uk-notify-message">',
                '<a class="uk-close"></a>',
                '<div></div>',
            '</div>'

        ].join('')).data("notifyMessage", this);

        this.content(this.options.message);

        // status
        if (this.options.status) {
            this.element.addClass('uk-notify-message-'+this.options.status);
            this.currentstatus = this.options.status;
        }

        this.group = this.options.group;

        messages[this.uuid] = this;

        if(!containers[this.options.pos]) {
            containers[this.options.pos] = UI.$('<div class="uk-notify uk-notify-'+this.options.pos+'"></div>').appendTo('body').on("click", ".uk-notify-message", function(){

                var message = UI.$(this).data('notifyMessage');

                message.element.trigger('manualclose.uk.notify', [message]);
                message.close();
            });
        }
    };


    UI.$.extend(Message.prototype, {

        uuid: false,
        element: false,
        timout: false,
        currentstatus: "",
        group: false,

        show: function() {

            if (this.element.is(':visible')) return;

            var $this = this;

            containers[this.options.pos].show().prepend(this.element);

            var marginbottom = parseInt(this.element.css('margin-bottom'), 10);

            this.element.css({opacity:0, marginTop: -1*this.element.outerHeight(), marginBottom:0}).animate({opacity:1, marginTop:0, marginBottom:marginbottom}, function(){

                if ($this.options.timeout) {

                    var closefn = function(){ $this.close(); };

                    $this.timeout = setTimeout(closefn, $this.options.timeout);

                    $this.element.hover(
                        function() { clearTimeout($this.timeout); },
                        function() { $this.timeout = setTimeout(closefn, $this.options.timeout);  }
                    );
                }

            });

            return this;
        },

        close: function(instantly) {

            var $this    = this,
                finalize = function(){
                    $this.element.remove();

                    if (!containers[$this.options.pos].children().length) {
                        containers[$this.options.pos].hide();
                    }

                    $this.options.onClose.apply($this, []);
                    $this.element.trigger('close.uk.notify', [$this]);

                    delete messages[$this.uuid];
                };

            if (this.timeout) clearTimeout(this.timeout);

            if (instantly) {
                finalize();
            } else {
                this.element.animate({opacity:0, marginTop: -1* this.element.outerHeight(), marginBottom:0}, function(){
                    finalize();
                });
            }
        },

        content: function(html){

            var container = this.element.find(">div");

            if(!html) {
                return container.html();
            }

            container.html(html);

            return this;
        },

        status: function(status) {

            if (!status) {
                return this.currentstatus;
            }

            this.element.removeClass('uk-notify-message-'+this.currentstatus).addClass('uk-notify-message-'+status);

            this.currentstatus = status;

            return this;
        }
    });

    Message.defaults = {
        message: "",
        status: "",
        timeout: 5000,
        group: null,
        pos: 'top-center',
        onClose: function() {}
    };

    UI.notify          = notify;
    UI.notify.message  = Message;
    UI.notify.closeAll = closeAll;

    return notify;
});

/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == 'function' && define.amd) {
        define('uikit-search', ['uikit'], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('search', {
        defaults: {
            msgResultsHeader   : 'Search Results',
            msgMoreResults     : 'More Results',
            msgNoResults       : 'No results found',
            template           : '<ul class="uk-nav uk-nav-search uk-autocomplete-results">\
                                      {{#msgResultsHeader}}<li class="uk-nav-header uk-skip">{{msgResultsHeader}}</li>{{/msgResultsHeader}}\
                                      {{#items && items.length}}\
                                          {{~items}}\
                                          <li data-url="{{!$item.url}}">\
                                              <a href="{{!$item.url}}">\
                                                  {{{$item.title}}}\
                                                  {{#$item.text}}<div>{{{$item.text}}}</div>{{/$item.text}}\
                                              </a>\
                                          </li>\
                                          {{/items}}\
                                          {{#msgMoreResults}}\
                                              <li class="uk-nav-divider uk-skip"></li>\
                                              <li class="uk-search-moreresults" data-moreresults="true"><a href="#" onclick="jQuery(this).closest(\'form\').submit();">{{msgMoreResults}}</a></li>\
                                          {{/msgMoreResults}}\
                                      {{/end}}\
                                      {{^items.length}}\
                                        {{#msgNoResults}}<li class="uk-skip"><a>{{msgNoResults}}</a></li>{{/msgNoResults}}\
                                      {{/end}}\
                                  </ul>',

            renderer: function(data) {

                var opts = this.options;

                this.dropdown.append(this.template({items:data.results || [], msgResultsHeader:opts.msgResultsHeader, msgMoreResults: opts.msgMoreResults, msgNoResults: opts.msgNoResults}));
                this.show();
            }
        },

        boot: function() {

            // init code
            UI.$html.on('focus.search.uikit', '[data-uk-search]', function(e) {
                var ele =UI.$(this);

                if (!ele.data('search')) {
                    UI.search(ele, UI.Utils.options(ele.attr('data-uk-search')));
                }
            });
        },

        init: function() {
            var $this = this;

            this.autocomplete = UI.autocomplete(this.element, this.options);

            this.autocomplete.dropdown.addClass('uk-dropdown-search');

            this.autocomplete.input.on("keyup", function(){
                $this.element[$this.autocomplete.input.val() ? 'addClass':'removeClass']('uk-active');
            }).closest("form").on("reset", function(){
                $this.value = '';
                $this.element.removeClass('uk-active');
            });

            this.on('selectitem.uk.autocomplete', function(e, data) {
                if (data.url) {
                  location.href = data.url;
                } else if(data.moreresults) {
                  $this.autocomplete.input.closest('form').submit();
                }
            });

            this.element.data('search', this);
        }
    });
});

/*! UIkit 2.27.2 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == 'function' && define.amd) {
        define('uikit-upload', ['uikit'], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('uploadSelect', {

        init: function() {

            var $this = this;

            this.on('change', function() {
                xhrupload($this.element[0].files, $this.options);
                var twin = $this.element.clone(true).data('uploadSelect', $this);
                $this.element.replaceWith(twin);
                $this.element = twin;
            });
        }
    });

    UI.component('uploadDrop', {

        defaults: {
            'dragoverClass': 'uk-dragover'
        },

        init: function() {

            var $this = this, hasdragCls = false;

            this.on('drop', function(e){

                if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files) {

                    e.stopPropagation();
                    e.preventDefault();

                    $this.element.removeClass($this.options.dragoverClass);
                    $this.element.trigger('dropped.uk.upload', [e.originalEvent.dataTransfer.files]);

                    xhrupload(e.originalEvent.dataTransfer.files, $this.options);
                }

            }).on('dragenter', function(e){
                e.stopPropagation();
                e.preventDefault();
            }).on('dragover', function(e){
                e.stopPropagation();
                e.preventDefault();

                if (!hasdragCls) {
                    $this.element.addClass($this.options.dragoverClass);
                    hasdragCls = true;
                }
            }).on('dragleave', function(e){
                e.stopPropagation();
                e.preventDefault();
                $this.element.removeClass($this.options.dragoverClass);
                hasdragCls = false;
            });
        }
    });


    UI.support.ajaxupload = (function() {

        function supportFileAPI() {
            var fi = document.createElement('INPUT'); fi.type = 'file'; return 'files' in fi;
        }

        function supportAjaxUploadProgressEvents() {
            var xhr = new XMLHttpRequest(); return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
        }

        function supportFormData() {
            return !! window.FormData;
        }

        return supportFileAPI() && supportAjaxUploadProgressEvents() && supportFormData();
    })();


    function xhrupload(files, settings) {

        if (!UI.support.ajaxupload){
            return this;
        }

        settings = UI.$.extend({}, xhrupload.defaults, settings);

        if (!files.length){
            return;
        }

        if (settings.allow !== '*.*') {

            for(var i=0,file;file=files[i];i++) {

                if(!matchName(settings.allow, file.name)) {

                    if(typeof(settings.notallowed) == 'string') {
                       alert(settings.notallowed);
                    } else {
                       settings.notallowed(file, settings);
                    }
                    return;
                }
            }
        }

        var complete = settings.complete;

        if (settings.single){

            var count    = files.length,
                uploaded = 0,
                allow    = true;

                settings.beforeAll(files);

                settings.complete = function(response, xhr){

                    uploaded = uploaded + 1;

                    complete(response, xhr);

                    if (settings.filelimit && uploaded >= settings.filelimit){
                        allow = false;
                    }

                    if (allow && uploaded<count){
                        upload([files[uploaded]], settings);
                    } else {
                        settings.allcomplete(response, xhr);
                    }
                };

                upload([files[0]], settings);

        } else {

            settings.complete = function(response, xhr){
                complete(response, xhr);
                settings.allcomplete(response, xhr);
            };

            upload(files, settings);
        }

        function upload(files, settings){

            // upload all at once
            var formData = new FormData(), xhr = new XMLHttpRequest();

            if (settings.before(settings, files)===false) return;

            for (var i = 0, f; f = files[i]; i++) { formData.append(settings.param, f); }
            for (var p in settings.params) { formData.append(p, settings.params[p]); }

            // Add any event handlers here...
            xhr.upload.addEventListener('progress', function(e){
                var percent = (e.loaded / e.total)*100;
                settings.progress(percent, e);
            }, false);

            xhr.addEventListener('loadstart', function(e){ settings.loadstart(e); }, false);
            xhr.addEventListener('load',      function(e){ settings.load(e);      }, false);
            xhr.addEventListener('loadend',   function(e){ settings.loadend(e);   }, false);
            xhr.addEventListener('error',     function(e){ settings.error(e);     }, false);
            xhr.addEventListener('abort',     function(e){ settings.abort(e);     }, false);

            xhr.open(settings.method, settings.action, true);

            if (settings.type=='json') {
                xhr.setRequestHeader('Accept', 'application/json');
            }

            for (var h in settings.headers) {
                xhr.setRequestHeader(h, settings.headers[h]);
            }

            xhr.onreadystatechange = function() {

                settings.readystatechange(xhr);

                if (xhr.readyState==4){

                    var response = xhr.responseText;

                    if (settings.type=='json') {
                        try {
                            response = UI.$.parseJSON(response);
                        } catch(e) {
                            response = false;
                        }
                    }

                    settings.complete(response, xhr);
                }
            };
            settings.beforeSend(xhr);
            xhr.send(formData);
        }
    }

    xhrupload.defaults = {
        action: '',
        single: true,
        method: 'POST',
        param : 'files[]',
        params: {},
        allow : '*.*',
        type  : 'text',
        filelimit: false,
        headers: {},

        // events
        before          : function(o){},
        beforeSend      : function(xhr){},
        beforeAll       : function(){},
        loadstart       : function(){},
        load            : function(){},
        loadend         : function(){},
        error           : function(){},
        abort           : function(){},
        progress        : function(){},
        complete        : function(){},
        allcomplete     : function(){},
        readystatechange: function(){},
        notallowed      : function(file, settings){ alert('Only the following file types are allowed: '+settings.allow); }
    };

    function matchName(pattern, path) {

        var parsedPattern = '^' + pattern.replace(/\//g, '\\/').
            replace(/\*\*/g, '(\\/[^\\/]+)*').
            replace(/\*/g, '[^\\/]+').
            replace(/((?!\\))\?/g, '$1.') + '$';

        parsedPattern = '^' + parsedPattern + '$';

        return (path.match(new RegExp(parsedPattern, 'i')) !== null);
    }

    UI.Utils.xhrupload = xhrupload;

    return xhrupload;
});

window.UION = window.UI = (function(exports, window) {
	exports.isArray = function (obj) {
		return Array.isArray ? Array.isArray(obj) : (Object.prototype.toString.call(obj) == '[object Array]');
	};

	exports.isString = function (obj) {
		return Object.prototype.toString.call(obj) == '[object String]';
	};

	exports.isObject = function (obj) {
		return Object.prototype.toString.call(obj) == '[object Object]';
	};

	exports.isDefined = function (obj) {
		return obj !== undefined;
	};

	exports.isUndefined = function (obj) {
		return obj === undefined;
	};

	exports.isNumber = function (obj) {
		return Object.prototype.toString.call(obj) == '[object Number]';
	};

	exports.isBoolean = function (obj) {
		return Object.prototype.toString.call(obj) == '[object Boolean]';
	};

	exports.isFunction = function (obj) {
		return Object.prototype.toString.call(obj) == '[object Function]';
	};

	exports.assert = function (cond, msg, details) {
		if (!cond) {
			if (details) exports.log("debug", details);
			exports.fail(msg);
		}
	};

	exports.fail = function (message) {
		exports.log("error", message);
		if (exports.debug !== false) {
			debugger;
			throw new Error(message);
		}
	};

	exports.replaceString = function (str, obj) {
		var regex = /\{\{[^\s}]*}}/gi;
		return str.replace(regex, function (match) {
			return exports.selectors.property(match.substring(2, match.length - 2))(obj);
		});
	};

	exports.extend = function (target, src) {
		for (var i in src) {
			if (src.hasOwnProperty(i) && exports.isDefined(src[i])) {
				target[i] = src[i];
			}
		}
		return target;
	};

	exports.defaults = function (target, defaults) {
		for (var i in defaults) {
			if (defaults.hasOwnProperty(i) && !exports.isDefined(target[i])) {
				target[i] = defaults[i];
			}
		}
		return target;
	};

	exports.pluck = function (array, property) {
		var result = [];
		for (var i = 0; i < array.length; i++) {
			result.push(array[i][property])
		}
		return result;
	};

	exports.classes = {};

	exports.def = function (config) {
		var bases = Array.prototype.slice.call(arguments, 1);
		var cls = exports.class(config, bases);
		exports.classes[config.__name__] = cls;
		return cls;
	};

	exports.stringCSS = function (value) {
		if (exports.isArray(value)) {
			var noDups = [];
			for (var i = 0; i < value.length; i++)
				if (noDups.indexOf(value[i]) == -1)
					noDups.push(value[i]);
			return noDups.join(' ');
		}
		else if (exports.isString(value)) {
			return value;
		}
		else return '';
	};

	exports.stringTemplate = function (string, scope) {
		return exports.replaceString(string, scope);
	};

	exports.template = function (template, config, thisArg, parentNode) {
		if (exports.isFunction(template)) {
			template = template.call(thisArg, config);
		}
		if (exports.isString(template)) {
			parentNode.innerHTML = exports.stringTemplate(template, config);
		}
		else if (exports.isObject(template)) {
			if (!template.$ui) {
				template.$ui = exports.new(template);
				thisArg.$components.push(template.$ui);
				parentNode.appendChild(template.$ui._html);
			}
		}
		else {
			exports.assert(false, 'Unrecognized template!', config);
		}
	};

	exports.class = function (config, bases) {
		exports.assert(config.__name__, "__name__ not defined.", config);
		var compiled = exports.extend({}, config);
		var init = config.__init__ ? [config.__init__] : [];
		var after = config.__after__ ? [config.__after__] : [];
		var $defaults = config.$defaults || {};
		var $setters = config.$setters || {};
		var $types = config.$types || {};

		var baseNames = [];
		for (var j = 0; j < bases.length; j++) {
			exports.assert(exports.isDefined(bases[j]),
				exports.replaceString("Invalid extension source from {{name}}", {name: config.__name__}));

			if (bases[j].__name__) {
				baseNames.push(bases[j].__name__);
			}
			else if (exports.isFunction(bases[j])) {
				baseNames.push(bases[j].prototype.__name__);
				baseNames = baseNames.concat(bases[j].prototype.__base__);
			}
		}

		for (var base, i = 0; i < bases.length; i++) {
			base = bases[i];
			if (exports.isFunction(base)) {
				base = base.prototype;
			}
			if (base.__check__) {
				base.__check__(baseNames);
			}
			if (base.__init__) {
				init.push(base.__init__);
			}
			if (base.__after__) {
				after.push(base.__after__);
			}
			if (base.$defaults) {
				exports.defaults($defaults, base.$defaults);
			}
			if (base.$types) {
				exports.defaults($types, base.$types);
			}
			if (base.$setters) {
				exports.defaults($setters, base.$setters);
			}
			exports.defaults(compiled, base);
		}

		// Override special properties that are carried through the inheritance structure.
		compiled.__init__ = function () {
			// Initialize ancestor bases first.
			for (var k = init.length - 1; k >= 0; k--) {
				init[k].apply(this, arguments);
			}
		};
		compiled.__after__ = function () {
			// Initialize ancestor bases first.
			for (var h = after.length - 1; h >= 0; h--)
				after[h].apply(this, arguments);
		};
		compiled.__name__ = config.__name__;
		compiled.__base__ = baseNames;
		compiled.$defaults = $defaults;
		compiled.$types = $types;
		compiled.$setters = $setters;
		var constructor = function (config) {
			exports.defaults(config, this.$defaults);
			exports.defaults(this, config);
			this.template = config.template || this.template;
			if (this.__init__) this.__init__(config);
			if (this.__after__) this.__after__(config);
			if (this.dispatch) this.dispatch("onInitialized");
		};
		constructor.prototype = compiled;

		return constructor;
	};

	exports.echo = function (input) {
		return function () {
			return input;
		}
	};

	exports.bind = function (func, object) {
		return function () {
			return func.apply(object, arguments);
		};
	};

	exports.delay = function (func, obj, params, delay) {
		return window.setTimeout(function () {
			func.apply(obj, params);
		}, delay || 1);
	};

	exports.uid = function () {
		if (!this._counter) this._counter = 0;
		this._counter++;
		return this._counter;
	};

	exports.node = function (node) {
		return typeof node == "string" ? document.getElementById(node) : node;
	};

	exports._listeners = {};
	exports.addListener = function (node, event, handler, thisArg) {
		exports.assert(node, exports.replaceString("Invalid node as target for {{event}} event", {event: event}));
		exports.assert(handler, exports.replaceString("Invalid handler as target for {{event}} event", {event: event}));
		node = exports.node(node);

		var id = exports.uid();

		if (thisArg)
			handler = exports.bind(handler, thisArg);

		exports._listeners[id] = [node, event, handler];	//store event info, for detaching

		// Not officially supporting, or going out of the way to support IE10-
		node.addEventListener(event, handler);

		return id;
	};

	exports.removeListener = function (id) {
		if (!id) return;
		exports.assert(exports._listeners[id], exports.replaceString("Event with id {{id}} does not exist", {id: id}));

		var e = exports._listeners[id];
		e[0].removeEventListener(e[1], e[2]);

		delete exports._listeners[id];
	};


	exports.log = function (type, message, explanation) {
		if (message === undefined) {
			message = type;
			type = "log";
		}
		if (window.console) {
			if (window.console[type]) window.console[type](message || "");
			else window.console.log(type + ": " + message);
			if (explanation) window.console.log(explanation);
		}
	};


	exports.Dispatcher = {
		__name__: "Dispatcher",
		__init__: function (config) {
			this._listenersByEvent = {};
			this._listeners = {};

			var listeners = config.on;
			if (listeners) {
				for (var i in listeners) {
					if (listeners.hasOwnProperty(i)) {
						this.addListener(i, listeners[i]);
					}
				}
			}
		},
		dispatch: function (type, params) {
			/**
			 * Dispatches an event to the element. This is the way user-interaction is handled.
			 * @param type Name of the event.
			 * @param params Array of the parameters to pass to the handler. Typically, this follows the order of the component configuration, the HTML element, and the event.
			 * @example dispatch('onClick', [config, element, event])
			 */
			var handlers = this._listenersByEvent[type];
			if (handlers) {
				for (var i = 0; i < handlers.length; i++) {
					handlers[i].apply(this, params);
				}
			}
		},
		addListener: function (type, func, id) {
			/**
			 * Adds an event handler to the component.
			 * @param type The type of event.
			 * @param func The handling function.
			 * @param id An optional event id that can be used to remove the listener.
			 * @returns The event id, automatically generated if id is not set.
			 * @example addListener('onClick', function(config, element, event) {})
			 */
			exports.assert(func, "Invalid event handler for " + type);

			id = id || exports.uid();

			var handlers = this._listenersByEvent[type] || exports.list();
			handlers.push(func);
			this._listenersByEvent[type] = handlers;
			this._listeners[id] = {_func: func, _name: type};

			return id;
		},
		removeListener: function (id) {
			/**
			 * Removes a listener based on the event id.
			 * @param id Listener id from adding the listener.
			 * @example removeListener(listenerId)
			 * @returns {boolean}
			 */
			if (!this._listeners[id]) return;

			var name = this._listeners[id]._name;
			var func = this._listeners[id]._func;

			var handlers = this._listenersByEvent[name];
			handlers.remove(func);

			delete this._listeners[id];
		},
		hasListener: function (id) {
			/**
			 * Checks if an particular event listener exists.
			 * @param id Listener id from adding the listener.
			 * @example hasListener(listenerId)
			 * @returns {boolean}
			 */
			return !!this._listeners[id];
		},
		hasListenersForEvent: function (type) {
			/**
			 * Checks if there are any listeners to a particular event.
			 * @param type Type of event.
			 * @example hasListenersForEvent('onInitialized')
			 * @returns {boolean}
			 */
			var handlers = this._listenersByEvent[type];
			return handlers && handlers.length;
		}
	};


	exports.ListMethods = {
		removeAt: function (index) {
			/**
			 * Remove the element at an index.
			 * @param index The non-negative index of the element. (0-based)
			 * @returns {boolean} True if removed, false if index does not exist.
			 */
			if (index >= 0 && index < this.length) {
				return this.splice(index, 1)[0];
			}
			return false;
		},
		remove: function (value, thisArg) {
			/**
			 * Removes a specific element.
			 * @param value Element to remove.
			 * @returns {boolean} True if removed, false if index does not exist.
			 */
			var index = (thisArg || this).indexOf(value);
			if (index >= 0) {
				this.splice(index, 1);
				return index;
			}
			return false;
		},
		contains: function (value) {
			/**
			 * Checks if a specific element exists.
			 * @param value Element to check for.
			 * @returns {boolean}
			 */
			return this.indexOf(value) != -1;
		},
		replace: function (oldValue, newValue) {
			/**
			 * Replace an existing element in the list with another element.
			 * @param oldValue The element to replace.
			 * @param newValue The element to replace it with.
			 */
			this[this.indexOf(oldValue)] = newValue;
		},
		insertAt: function (index, item) {
			/**
			 * Inserts an element at a specific index, pushing all other elements forward.
			 * @param index The index to insert to.
			 * @param item The element to insert.
			 */
			index = index || 0;
			this.splice(index, 0, item);
		},
		removeWhere: function (key, value) {
			var i = 0;
			var results = [];
			while (i < this.length) {
				if (value == this[i][key]) {
					results.push(this.splice(i, 1));
				}
				else {
					i += 1;
				}
			}
			return results;
		},
		removeOne: function (key, value) {
			var i = 0;
			while (i < this.length) {
				if (value == this[i][key]) {
					return this.splice(i, 1);
				}
				else {
					i += 1;
				}
			}
			exports.fail(exports.replaceString("{{key}}: {{value}} cannot be removed in {{array}}",
				{key: key, value: value, array: this}));
		},
		indexWhere: function (key, value) {
			var results = [];
			for (var i = 0; i < this.length; i++) {
				if (this[i][key] == value)
					results.push(i);
			}
			return results;
		},
		findWhere: function (key, value) {
			var results = [];
			for (var i = 0; i < this.length; i++) {
				if (this[i][key] == value)
					results.push(this[i]);
			}
			return results;
		},
		findOne: function (key, value, error) {
			for (var i = 0; i < this.length; i++) {
				// Apparently 1 == "1" in JS
				if (this[i][key] === value)
					return this[i];
			}
			if (error)
				exports.fail(exports.replaceString("{{key}}: {{value}} not found in {{array}}",
					{key: key, value: value, array: this}));
		},
		copy: function () {
			return this.slice();
		},
		first: function () {
			return this[0];
		},
		last: function () {
			return this[this.length - 1];
		},
		until: function (operator, thisArg) {
			var copy = this.slice();
			var value, i = 0;
			while (copy.length) {
				value = copy.shift();
				if (!operator.call(thisArg, value, copy)) {
					copy.push(value);
					i++;
				}
				else {
					i = 0;
				}
				if (copy.length == 0) {
					break;
				}
				else if (i > copy.length) {
					exports.fail("Infinite loop detected.");
					break;  // Infinite loop detected.
				}
			}
		},
		any: function (operator, thisArg) {
			for (var i = 0; i < this.length; i++) {
				if (operator.call(thisArg || this, this[i], i)) {
					return true;
				}
			}
			return false;
		},
		all: function (operator, thisArg) {
			for (var i = 0; i < this.length; i++) {
				if (!operator.call(thisArg || this, this[i], i)) {
					return false;
				}
			}
			return true;
		},
		each: function (operator, thisArg) {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				result[i] = operator.call(thisArg || this, this[i], i);
			}
			return result;
		},
		remap: function (operator, thisArg) {
			for (var i = 0; i < this.length; i++) {
				this[i] = operator.call(thisArg || this, this[i]);
			}
		},
		filter: function (operator, thisArg) {
			var results = [];
			for (var i = 0; i < this.length; i++) {
				if (operator.call(thisArg || this, this[i])) {
					results.push(this[i]);
				}
			}
			return results;
		},
		insertSorted: function (item, cmp, thisArg) {
			for (var sort, i = this.length - 1; i >= 0; i--) {
				sort = cmp.call(thisArg || this, item, this[i]);
				if (sort >= 0) {
					this.insertAt(i, item);
					return i;
				}
			}
			this.push(item);
			return i;
		}
	};


	exports.list = function (array) {
		return exports.extend((array || []), exports.ListMethods);
	};


	exports.selectors = {
		property: function (name) {
			var nested = name.split(".");
			return function (obj) {
				var result = obj;
				for (var i = 0; i < nested.length; i++)
					result = result[nested[i]]
				return result;
			}
		}
	};


	exports.css = {
		flex: {
			true: "uk-flex",
			false: "",
			inline: "uk-flex-inline"
		},
		selectable: {
			true: "",
			false: "unselectable"
		},
		order: {
			first: "uk-flex-order-first",
			last: "uk-flex-order-last",
			"first-sm": "uk-flex-order-first-small",
			"last-sm": "uk-flex-order-last-small",
			"first-md": "uk-flex-order-first-medium",
			"last-md": "uk-flex-order-last-medium",
			"first-lg": "uk-flex-order-first-large",
			"last-lg": "uk-flex-order-last-large",
			"first-xlg": "uk-flex-order-first-xlarge",
			"last-xlg": "uk-flex-order-last-xlarge",
			"": "",
			$multiple: true
		},
		wrap: {
			break: "uk-text-break",
			nowrap: "uk-text-nowrap",
			truncate: "uk-text-truncate",
			"": ""
		},
		padding: {
			"": "",
			none: "uk-padding-remove"
		},
		size: {
			"": "",
			none: "uk-flex-item-none",
			auto: "uk-flex-item-auto",
			flex: "uk-flex-item-1"
		},
		flexAlign: {
			center: "uk-flex-center",
			right: "uk-flex-right",
			top: "uk-flex-top",
			middle: "uk-flex-middle",
			bottom: "uk-flex-bottom",
			"": ""
		},
		display: {
			block: "uk-display-block",
			inline: "uk-display-inline",
			"inline-block": "uk-display-inline-block",
			"": ""
		},
		halign: {
			center: "uk-align-center",
			left: "uk-align-left",
			right: "uk-align-right",
			"left-md": "uk-align-medium-left",
			"right-md": "uk-align-medium-right",
			"": ""
		},
		valign: {
			middle: "uk-vertical-align-middle",
			parent: "uk-vertical-align",
			bottom: "uk-vertical-align-bottom",
			"": ""
		},
		position: {
			"top": "uk-position-top",
			"top-left": "uk-position-top-left",
			"top-right": "uk-position-top-right",
			"bottom": "uk-position-bottom",
			"bottom-right": "uk-position-bottom-right",
			"bottom-left": "uk-position-bottom-left",
			"cover": "uk-position-cover",
			"relative": "uk-position-relative",
			"absolute": "uk-position-absolute",
			"z-index": "uk-position-z-index",
			"": "",
			$multiple: true
		},
		fill: {
			height: "uk-height-1-1",
			width: "uk-width-100",
			screen: ["uk-height-1-1", "uk-width-100"],
			"": ""
		},
		float: {
			left: "uk-float-left",
			right: "uk-float-right",
			clearfix: "uk-clearfix",
			"": ""
		},
		scroll: {
			xy: "uk-overflow-container",
			y: "uk-overflow-ycontainer",
			text: "uk-scrollable-text",
			"": ""
		},
		hidden: {
			true: "uk-hidden",
			false: "",
			touch: "uk-hidden-touch",
			notouch: "uk-hidden-notouch",
			invisible: "uk-invisible",
			hover: "uk-hidden-hover",
			small: "uk-hidden-small",
			medium: "uk-hidden-medium",
			large: "uk-hidden-large",
			$multiple: true
		},
		margin: {
			"none": "uk-margin-remove",
			"top-rm": "uk-margin-top-remove",
			"bottom-rm": "uk-margin-bottom-remove",
			"": "",
			"all-sm": ["uk-margin-small-left", "uk-margin-small-right", "uk-margin-small-top", "uk-margin-small-bottom"],
			"all": ["uk-margin-left", "uk-margin-right", "uk-margin-top", "uk-margin-bottom"],
			"all-lg": ["uk-margin-large-left", "uk-margin-large-right", "uk-margin-large-top", "uk-margin-large-bottom"],
			"lg": "uk-margin-large",
			"sm": "uk-margin-small",
			"top": "uk-margin-top",
			"top-lg": "uk-margin-large-top",
			"top-sm": "uk-margin-small-top",
			"bottom": "uk-margin-bottom",
			"bottom-lg": "uk-margin-large-bottom",
			"bottom-sm": "uk-margin-small-bottom",
			"left": "uk-margin-left",
			"left-lg": "uk-margin-large-left",
			"left-sm": "uk-margin-small-left",
			"right": "uk-margin-right",
			"right-lg": "uk-margin-large-right",
			"right-sm": "uk-margin-small-right",
			$multiple: true
		},
		inputWidth: {
			"": "",
			mini: "uk-form-width-mini",
			small: "uk-form-width-small",
			medium: "uk-form-width-medium",
			large: "uk-form-width-large",
			full: "uk-width-100"
		},
		screen: {
			"small": "uk-visible-small",
			"medium": "uk-visible-medium",
			"large": "uk-visible-large",
			"except-small": "uk-hidden-small",
			"except-medium": "uk-hidden-medium",
			"except-large": "uk-hidden-large",
			"": "",
			$multiple: true
		},
		device: {
			touch: "uk-hidden-notouch",
			notouch: "uk-hidden-touch",
			"": ""
		}
	};


	exports.html = {
		createElement: function (name, attrs, html) {
			attrs = attrs || {};
			var node = document.createElement(name);
			for (var attribute in attrs) {
				if (attrs.hasOwnProperty(attribute))
					node.setAttribute(attribute, attrs[attribute]);
			}
			if (attrs.style)
				node.style.cssText = attrs.style;
			if (attrs.class)
				node.className = attrs["class"];
			if (html)
				node.innerHTML = html;
			return node;
		},
		preventEvent: function (e) {
			if (e && e.preventDefault) e.preventDefault();
			e.defaultPrevented = true;
			e.cancelBubble = true;
		},
		addCSS: function (node, name) {
			var classList = exports.stringCSS(name).split(' ');
			for (var cls, i = 0; i < classList.length; i++) {
				cls = classList[i];
				if (cls) node.classList.add(cls);
			}
		},
		hasCSS: function (node, name) {
			return node.classList.contains(name);
		},
		removeCSS: function (node, name) {
			if (name && name.length > 0)
				node.classList.remove(name);
		}
	};


	exports.ready = function (code) {
		if (exports._ready) code.call();
		else exports._onload.push(code);
	};
	exports._ready = false;
	exports._onload = [];


	(function () {
		var ready = function () {
			exports._ready = true;
			document.body.setAttribute("data-uk-observe", "");
			for (var i = 0; i < exports._onload.length; i++) {
				exports._onload[i]();
			}

			exports._globalMouseUp = function (e) {
				var dragged = exports._dragged;
				if (dragged) {
					var display = dragged.node.style.display;
					dragged.node.style.display = 'none';

					var src = e.changedTouches ? e.changedTouches[0] : e;
					var dropTarget = findDroppableParent(document.elementFromPoint(src.clientX, src.clientY));
					if (dropTarget && dropTarget.master._droppable(dropTarget.config, dragged.config, dragged.node)) {
						// Must be before dragEnd to prevent position of elements shifting in tree
						// Shifted position will shift the drop target
						dropTarget.master.dispatch("onItemDrop", [dropTarget.config, dragged.config, dropTarget, e]);
					}

					dragged.target.dispatch("onItemDragEnd", [dragged.config, dragged.node, e]);
					exports.html.removeCSS(dragged.node, 'uk-active-drag');
					dragged.node.style.top = dragged.originalPos.top;
					dragged.node.style.left = dragged.originalPos.left;
					dragged.node.style.display = display;
					exports._dragged = null;


				}
				exports._selectedForDrag = null;
			};

			exports._globalMouseMove = function (e) {
				var selectedForDrag = exports._selectedForDrag;
				var src = e.touches ? e.touches[0] : e;
				if (selectedForDrag) {
					if (Math.abs(src.clientX - selectedForDrag.pos.x) > exports._dragThreshold ||
						Math.abs(src.clientY - selectedForDrag.pos.y) > exports._dragThreshold) {
						// Begin drag event
						exports._dragged = selectedForDrag;
						exports._selectedForDrag = null;
						exports.html.addCSS(selectedForDrag.node, 'uk-active-drag');

						// Fire drag listener event
						selectedForDrag.target.dispatch("onItemDragStart",
							[selectedForDrag.config, selectedForDrag.node, selectedForDrag.event]);
					}
				}
				else if (exports._dragged) {
					var dragged = exports._dragged;
					dragged.node.style.top = (src.clientY + dragged.mouseOffset.top) + 'px';
					dragged.node.style.left = (src.clientX + dragged.mouseOffset.left) + 'px';

					var dropTarget = findDroppableParent(document.elementFromPoint(src.clientX, src.clientY));
					if (dropTarget && dropTarget.master._droppable(dropTarget.config, dragged.config, dragged.node)) {
						var oldDropTarget = exports._dropTarget;
						if (oldDropTarget != dropTarget) {
							if (oldDropTarget) {
								oldDropTarget.master.dispatch('onItemDragLeave', [oldDropTarget.config, oldDropTarget, e]);
							}
							dropTarget.master.dispatch('onItemDragEnter', [dropTarget.config, dropTarget, e]);
							exports._dropTarget = dropTarget;
						}
						else if (oldDropTarget) {
							oldDropTarget.master.dispatch('onItemDragOver', [oldDropTarget.config, oldDropTarget, e]);
						}
					}
				}
			};

			exports._dragThreshold = 10;

			exports.addListener(window, "mouseup", exports._globalMouseUp);
			exports.addListener(window, "mousemove", exports._globalMouseMove);

			if (UIkit.support.touch) {
				exports.addListener(window, "touchend", exports._globalMouseUp);
				exports.addListener(window, "touchmove", exports._globalMouseMove);
			}

			function findDroppableParent(node) {
				// Exit after 100 tries, otherwise assume circular reference
				for (var i = 0; i < 100; i++) {
					if (!node)
						break;
					else if (node.config && node.master && node.$droppable)
						return node;
					else
						node = node.parentNode;
				}
			}
		};
		if (document.readyState == "complete") ready();
		else exports.addListener(window, "load", ready);
	}());


	exports.PropertySetter = {
		__name__: "PropertySetter",
		__check__: function (bases) {
			exports.assert(bases.indexOf("PropertySetter") == bases.length - 1,
				exports.replaceString("PropertySetter should be the last extension in {{name}}", {name: this.__name__}));
		},
		__init__: function (config) {
			this.config = config;
			this._config = config;
		},
		__after__: function (config) {
			if (this.$setters) {
				var names = Object.keys(config);
				for (var name, i = 0; i < names.length; i++) {
					name = names[i];
					this.set(name, config[name]);
				}
			}
		},
		set: function (name, value) {
			/**
			 * Sets a property of the component and invokes its setter function.
			 * @param name Name of the property.
			 * @param value Value of the property.
			 * @example set('type', 'primary')
			 */
			if (this.$setters.hasOwnProperty(name)) {
				exports.assert(exports.isFunction(this.$setters[name]),
					exports.replaceString("Property setter for {{name}} is not a function.", {name: name}));
				this[name] = this.$setters[name].call(this, value);
				this._config[name] = value;
			}
			else {
				this._config[name] = value;
			}
		}
	};


	exports.AbsolutePositionMethods = {
		positionNextTo: function (node, position, marginX, marginY) {
			/**
			 * Positions this element next to another element.
			 * @param node The anchor element to position next to.
			 * @param position Can be 1 of the following values: bottom-right, bottom-left, bottom-center, top-right, top-left, top-center, left-top, left-bottom, left-center, right-top, right-bottom, right-center.
			 * @param marginX The amount of x-offset from the anchor element edge.
			 * @param marginY The amount of y-offset from the anchor element edge.
			 */
			var bodyPos = document.body.getBoundingClientRect(); // Affected by scrolling
			var origin = node.getBoundingClientRect();
			var rect = this.getBoundingClientRect();
			var width = rect.width,
				height = rect.height;

			marginX = marginX || 0;
			marginY = marginY || 0;

			var variants = {
				"bottom-left": {top: origin.height + marginY, left: marginX},
				"bottom-right": {top: origin.height + marginY, left: origin.width - width + marginX},
				"bottom-center": {top: origin.height + marginY, left: origin.width / 2 - width / 2 + marginX},
				"top-left": {top: -marginY - height, left: 0},
				"top-right": {top: -marginY - height, left: origin.width - width},
				"top-center": {top: -marginY - height, left: origin.width / 2 - width / 2},
				"left-top": {top: marginY, left: -marginX - width},
				"left-bottom": {top: origin.height - height, left: -marginX - width},
				"left-center": {top: origin.height / 2 - height / 2, left: -marginX - width},
				"right-top": {top: marginY, left: origin.width + marginX},
				"right-bottom": {top: origin.height - height, left: origin.width + marginX},
				"right-center": {top: origin.height / 2 - height / 2, left: origin.width + marginX}
			};

			this._html.style.top = (origin.top - bodyPos.top + variants[position].top) + "px";
			this._html.style.left = (origin.left + variants[position].left) + "px";
			this._html.style.position = "absolute";
		},
		getBoundingClientRect: function () {
			/**
			 * Gets the bounding rectangle of the element. Needs to be added first since this delegates the call to element.getBoundingClientRect.
			 * @returns {*|ClientRect}
			 */
			return this._html.getBoundingClientRect();
		},
		position: function (pos) {
			/**
			 * Sets the position of the element.
			 * @param pos Position information object.
			 * @example position({top: 0, left: 0})
			 */
			this._html.style.top = (pos.top || 0) + "px";
			this._html.style.left = (pos.left || 0) + "px";
			this._html.style.position = "absolute";
		},

		moveWithinBoundary: function (boundary, pivot, padding, offset) {
			/**
			 * Moves the element to be within the specified boundary.
			 * @param boundary The bounding box to move the element inside of.
			 * @param pivot Use this to override the final boundary edges values.
			 * @param padding The amount of padding to the edges of the boundary.
			 * @param offset The amount of final offset added to the position depending on which edges are hidden.
			 * @example moveWithinBoundary({top: 0, bottom: 500, left: 0, right: 1000}, {top: 100, bottom: 100}, {top: 10, left: 10}, {top: 10, left: 20, right: 30, bottom: 40})
			 */
			var bodyPos = document.body.getBoundingClientRect(); // Affected by scrolling

			padding = padding || {};
			pivot = pivot || {};
			boundary = boundary || {};
			offset = offset || {};

			var paddingTop = padding.top || 0;
			var paddingRight = padding.right || 0;
			var paddingBottom = padding.bottom || 0;
			var paddingLeft = padding.left || 0;

			var boundaryTop = boundary.top || 0;
			var boundaryBottom = boundary.bottom || window.innerHeight;
			var boundaryLeft = boundary.left || 0;
			var boundaryRight = boundary.right || window.innerWidth;

			var pivotLeft = pivot.left || boundaryLeft + paddingLeft;
			var pivotRight = pivot.right || boundaryRight - paddingRight;
			var pivotTop = pivot.top || boundaryTop + paddingTop;
			var pivotBottom = pivot.bottom || boundaryBottom - paddingBottom;

			var rect = this.getBoundingClientRect();
			rect.left = this._html.style.left || rect.left;
			rect.top = this._html.style.top || rect.top;

			var hiddenLeft = rect.left < boundaryLeft + paddingLeft;
			var hiddenRight = rect.left + rect.width > boundaryRight - paddingRight;
			var hiddenTop = rect.top < boundaryTop + paddingTop;
			var hiddenBottom = rect.top + rect.height > boundaryBottom - paddingBottom;

			var offsetTop = offset.top || 0;
			var offsetBottom = offset.bottom || 0;
			var offsetLeft = offset.left || 0;
			var offsetRight = offset.right || 0;

			if (hiddenLeft) {
				this._html.style.left = (pivotLeft + offsetLeft) + "px";
			}
			else if (hiddenRight) {
				this._html.style.left = (pivotRight - rect.width + offsetRight) + "px";
			}

			if (hiddenTop) {
				this._html.style.top = (pivotTop + offsetTop - bodyPos.top) + "px";
			}
			else if (hiddenBottom) {
				this._html.style.top = (pivotBottom - rect.height + offsetBottom - bodyPos.top) + "px";
			}
		}
	};


	exports.new = function (config, parent) {
		var node = makeView(config);
		exports.assert(node, exports.replaceString("Unknown node view {{view}}.", {view: config.view}), config);
		if (parent)
			parent.appendChild(node.element);
		return node;

		function makeView(config) {
			if (config.view) {
				var view = config.view;
				exports.assert(exports.classes[view], "unknown view:" + view);
				return new exports.classes[view](config);
			}
			else if (config.cells)
				return new exports.classes.flexgrid(config);
			else
				return new exports.classes.element(config);
		}
	};
	
	exports.components = {};

	exports.new.uid = function (name) {
		this._names = this._names || {};
		this._names[name] = this._names[name] || 0;
		this._names[name]++;
		return '' + name + this._names[name];
	};


	exports.views = {};
	window.$$ = exports.$$ = function (id) {
		if (!id)
			return null;
		else if (exports.views[id])
			return exports.views[id];
	};

	exports.forIn = function (func, obj, thisArg) {
		var result = {};
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				result[i] = func.call(thisArg, obj[i], i);
			}
		}
		return result;
	};


	exports.setCSS = function (cssOptions) {
		return exports.forIn(function (options, property) {
			var multipleAllowed = options.$multiple;
			delete options.$multiple;

			var setter = function (value) {
				var oldValue = this._config[property];
				if (options[oldValue])
					exports.html.removeCSS(this._html, options[oldValue]);

				var values = String(value).split(" ");

				for (var v, i = 0; i < values.length; i++) {
					v = values[i];
					exports.assert(options.hasOwnProperty(v),
						exports.replaceString("Invalid value for '{{property}}': '{{value}}'!",
							{property: property, value: v}));

					var classes = options[v];
					if (exports.isArray(classes))
						for (var c = 0; c < classes.length; c++)
							exports.html.addCSS(this._html, classes[c]);
					else
						exports.html.addCSS(this._html, classes);
				}

				return value;
			};
			setter.options = options;
			setter.multipleAllowed = !!multipleAllowed;
			return setter;
		}, cssOptions);
	};


	exports.CommonCSS = {
		__name__: "CommonCSS",
		__check__: function (bases) {
			exports.assert(bases.indexOf("CommonCSS") != -1, "CommonCSS is an abstract class.");
			exports.assert(bases.indexOf("PropertySetter") != -1, "CommonCSS must extend PropertySetter.");
		},
		$setters: exports.setCSS(exports.css)
	};


	exports.CommonEvents = {
		__name__: "CommonEvents",
		__after__: function (config) {
			var $this = this;
			if (config.on) {
				if (config.on.onResize) {
					exports.addListener(window, "resize", function (e) {
						this.dispatch("onResize", [e]);
					}, $this);
				}
				if (config.on.onDebounceResize) {
					exports.addListener(window, "resize", UIkit.Utils.debounce(function (e) {
						$this.dispatch("onDebounceResize", [e]);
					}, 1000));
				}
				if (config.on.onFocus) {
					exports.addListener(this.firstResponder(), "focus", function (e) {
						this.dispatch("onFocus", [e]);
					}, $this);
				}
				if (config.on.onBlur) {
					exports.addListener(this.firstResponder(), "blur", function (e) {
						this.dispatch("onBlur", [e]);
					}, $this);
				}
			}
		},
		firstResponder: function () {
			return this._html;
		}
	};


	exports.components.element = exports.def({
		__name__: "element",
		$defaults: {
			tooltipPos: 'bottom',
			dropdownEvent: "onClick",
			dropdownPos: 'bottom-center',
			dropdownId: undefined,
			dropdownMarginX: 5,
			dropdownMarginY: 5,
			margin: "",
			uploadOptions: {},
			$preventDefault: true
		},
		$setters: {
			disabled: function (value) {
				if (value)
					this.disable();
				else
					this.enable();
				return value;
			},
			css: function (value) {
				exports.html.addCSS(this._html, exports.stringCSS(value));
				return value;
			},
			tooltip: function (value) {
				if (value) {
					this._html.setAttribute("data-uk-tooltip", "");
					this._html.setAttribute("title", value);
					this._html.setAttribute("data-uk-tooltip", exports.replaceString("{pos: '{{pos}}'}",
							{pos: this._config.tooltipPos}));
				}
				else
					exports.html.removeCSS(this._html, "data-uk-tooltip");

				return value;
			},
			dropdown: function (value) {
				var $this = this;
				var config = $this._config;

				var dropdown = {
					id: config.dropdownId,
					view: "dropdown",
					pos: config.dropdownPos,
					dropdown: value,
					dropdownCSS: config.dropdownCSS
				};

				var ui = exports.new(dropdown, document.body);

				config.on = config.on || {};
				this.addListener(config.dropdownEvent, function (config, node) {
					ui.open(config);
					ui.positionNextTo(node, dropdown.pos, config.dropdownMarginX, config.dropdownMarginY);
					ui.moveWithinBoundary();
				});
				$this.dropdownPopup = ui;
				return value;
			},
			inline: function (value) {
				if (value)
					exports.html.addCSS(this._html, "uk-display-inline");
			},
			uploader: function (value) {
				if (value) {
					// Must allow default events to open uploader
					this._config.$preventDefault = false;
					// Add css to mock a file input
					exports.html.addCSS(this._html, "uk-form-file");
					this._html.appendChild(this._uploadFileHTML());
				}
				return value;
			}
		},
		__init__: function (config) {
			if (!config.id) config.id = exports.new.uid(this.__name__);
			var node = exports.node(config.id);
			exports.assert(!node, exports.replaceString("Node with id '{{id}}' already exists", {id: config.id}), config);
			exports.views[config.id] = this;

			this.$components = exports.list();
			this.element = this._html = exports.html.createElement(config.htmlTag || "DIV", {id: config.id});
			if (config.tagClass)
				this.element.setAttribute("class", config.tagClass);

			exports.extend(this._html.style, config.style || {});

			this.render();
		},
		render: function () {
			/**
			 * Force a rerender of the element, which runs the template function.
			 */
			exports.template(this.template, this._config, this, this._html);
		},
		template: function (config, component, parent) {
			/**
			 * The template function of the final HTML.
			 * @param config The configuration JSON.
			 * @param component The created component object with functions.
			 * @param parent The parent HTML element.
			 * @returns {string}
			 */
			return ""
		},
		getNode: function () {
			/**
			 * Function to get the underlying HTML element.
			 * @returns {Element}
			 */
			return this._html;
		},
		isVisible: function () {
			/**
			 * Checks if the element is hidden. (Not to be confused with conceal/reveal.)
			 */
			return !exports.html.hasCSS(this._html, "uk-hidden");
		},
		show: function () {
			/**
			 * Shows the element.
			 */
			exports.html.removeCSS(this._html, "uk-hidden");
		},
		hide: function () {
			/**
			 * Hides the element.
			 */
			exports.html.addCSS(this._html, "uk-hidden");
		},
		conceal: function () {
			/**
			 * Makes the element invisible, which doesn't affect the layout.
			 */
			exports.html.addCSS(this._html, "uk-invisible");
		},
		reveal: function () {
			/**
			 * Makes the element visible again.
			 */
			exports.html.removeCSS(this._html, "uk-invisible");
		},
		isEnabled: function () {
			/**
			 * Checks if the element is enabled.
			 * @returns {boolean}
			 */
			return !this._html.getAttribute('disabled');
		},
		disable: function () {
			/**
			 * Disables the element.
			 */
			this._html.setAttribute('disabled', "");
		},
		enable: function () {
			/**
			 * Enables the element.
			 */
			this._html.removeAttribute('disabled');
		},
		getComponent: function(key, value) {
			/**
			 * Gets a child component from a key value match.
			 * @param key The key to look up.
			 * @param value The compared value.
			 * @returns {UI.components.element}
			 */
			return this.$components.findOne(key, value);
		},
		_uploadFileHTML: function () {
			var config = this._config;
			var self = this;

			var settings = exports.extend({
				type: 'json',
				before: function (settings, files) {
					self.dispatch("onFilesAdded", [settings, files]);
					return false;
				}
			}, config.uploadOptions);

			var attrs = settings.filelimit > 1 ? {type: "file", multiple: "multiple"} : {type: "file"};
			var input = exports.html.createElement("INPUT", attrs);
			UIkit.uploadSelect(input, settings);

			return input;
		}
	}, exports.Dispatcher, exports.CommonEvents, exports.CommonCSS, exports.PropertySetter);

	// Define setter options for auto-documentation
	(function($) {
		$.disabled.isBoolean = true;
		$.tooltip.isText = true;
		$.css.isText = true;
		$.dropdown.description = "Configuration object to show in a context menu.";
		$.inline.isBoolean = true;
		$.uploader.isBoolean = true;

		$._meta = exports.extend({
			dropdownEvent: "The event type to trigger a dropdown. Examples: onClick (default), onContext.",
			dropdownPos: {options: ['bottom-center', 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'left-top', 'left-bottom', 'left-center', 'right-top', 'right-bottom', 'right-center']},
			dropdownMarginX: "The left margin of the dropdown from anchor component.",
			dropdownMarginY: "The top margin of the dropdown from anchor component.",
			template: "A string or a function that returns a HTML template string for the component. For examples, see source code on Github.",
			style: "A object containing properties to feed into the style attribute of the element"
		}, $._meta || {});
	}(exports.components.element.prototype.$setters));


	exports.components.flexgrid = exports.def({
		__name__: "flexgrid",
		$defaults: {
			layout: "row",
			flex: true,
			size: "flex",
			singleView: false
		},
		$setters: exports.extend(exports.setCSS({
			layout: {
				"": "",
				column: "uk-flex-column",
				row: "uk-flex-row",
				"row-reverse": "uk-flex-row-reverse",
				"column-reverse": "uk-flex-column-reverse"
			},
			spacing: {
				between: "uk-flex-space-between",
				around: "uk-flex-space-around"
			}
		}),{
			cells: function (value) {
				exports.assert(exports.isArray(value), "The cells property must be an Array.", this);

				for (var config, i = 0; i < value.length; i++) {
					config = value[i];
					this.addChild(config);
				}

				if (this._config.singleView && this._config.defaultView)
					this.setChild(this._config.defaultView);

				return value;
			}
		}),
		render: function () {
			// Do nothing, overwrites render function.
		},
		each: function (func, thisArg) {
			/**
			 * Invokes a function on each child of the flexgrid.
			 * @param func The invoked function.
			 * @param thisArg The 'this' object passed to the invoked function.
			 * @returns Return an array containing the results of the invoked call.
			 */
			return this.$components.each(func, thisArg);
		},
		insertChild: function (index, config) {
			/**
			 * Inserts a child configuration object at a particular index.
			 * @param index Index to insert at.
			 * @param config The configuration object representing the new child.
			 * @returns {object} The child component
			 */
			var ui = config.element ? config : exports.new(config);
			this.$components.splice(index, 0, ui);

			if (!this._config.singleView) {
				if (index > 0)
					this._html.insertAfter(ui._html, this.$components[index-1]._html);
				else if (index+1 < this.$components.length)
					this._html.insertBefore(ui._html, this.$components[index+1]._html);
				else
					this._html.appendChild(ui._html)
			}

			return ui;
		},
		addChild: function (config) {
			/**
			 * Adds a child to the end of the stack.
			 * @param config Configuration of the new child.
			 * @returns {object} The child component
			 */
			var ui = config.element ? config : exports.new(config);
			this.$components.push(ui);

			if (!this._config.singleView)
				this._html.appendChild(ui._html);

			return ui;
		},
		removeChild: function (id) {
			/**
			 * Removes a child by its id.
			 * @param id Id of the child to remove.
			 */
			if (id.element) {
				this._html.removeChild(id._html);
				this.$components.remove(id);
			}
			else if (exports.isString(id)) {
				this._html.removeChild(this.getChild(id)._html);
				this.$components.removeWhere('id', id);
			}
			else {
				exports.fail("flexgrid: unknown argument id " + id + " received in removeChild().");
			}
		},
		getChild: function (id) {
			/**
			 * Get a child of the flexgrid by id.
			 * @param id The string id of the component.
			 * @returns {UI.components.element}
			 */
			return this.$components.findOne('id', id);
		},
		getChildren: function () {
			/**
			 * Get a list of all children. Make a copy if mutating this object.
			 * @returns {array} Array of child components.
			 */
			return this.$components;
		},
		getItems: function () {
			/**
			 * Get a list of the children's JSON configuration objects. Do not need to make a copy if mutating.
			 * @returns {array} Array of child components config objects.
			 */
			return this.$components.each(function (item) {
				return item.config;
			});
		},
		activeChild: function () {
			/**
			 * Returns the current active child.
			 */
			return this._activeChild;
		},

		setChild: function (id) {
			/**
			 * Makes a child visible, also makes it the active child.
			 * @dispatch onChildChange
			 * @param id The id of a child.
			 */
			this._setVisible('id', [id]);
			var newChild = this.getChild(id);
			this.dispatch("onChildChange", [this._activeChild, newChild]);
			this._activeChild = newChild;
		},
		getBatch: function () {
			/**
			 * Get the 'batch' value that was passed to `setBatch`.
			 */
			return this.$batch;
		},
		showBatch: function (name) {
			/**
			 * Checks the batch property of all children and makes all matching batch visible.
			 * @param name An array or a string to identify batch(es). Matching is done using indexOf.
			 */
			// Tricky: Rendering input fields will cause problems with on-screen keyboards.
			// However, to preserve the order of elements, will need to rerender.
			this._setVisible('batch', exports.isArray(name) ? name : [name], true);
			this.$batch = name;
		},
		_setVisible: function (key, value, rerender) {
			this.$components.each(function (item) {
				if (value.indexOf(item.config[key]) != -1) {
					if (item._html.parentNode != this._html || rerender) {
						this._html.appendChild(item._html);
					}
				}
				else if (item._html.parentNode) {
					this._html.removeChild(item._html);
				}
			}, this);
		}
	}, exports.components.element);

	// Define setter options for auto-documentation
	(function($) {
		$.cells.description = "A list of configuration objects.";
	}(exports.components.flexgrid.prototype.$setters));


	exports.ClickEvents = {
		$setters: {
			target: function (value) {
				this._html.setAttribute("target", value);
				return value;
			},
			href: function (value) {
				this._html.setAttribute("href", value);
				return value;
			}
		},
		__check__: function (bases) {
			exports.assert(bases.indexOf('CommonEvents') != -1, "ClickEvents must extend CommonEvents.");
		},
		__after__: function (config) {
			config.on = config.on || {};
			exports.addListener(this.firstResponder(), "click", this._onClick, this);
			exports.addListener(this.firstResponder(), "contextmenu", this._onContext, this);

			// Optimization: these rarely get used.
			if (config.on.onMouseDown) {
				exports.addListener(this.firstResponder(), "mousedown", this._onMouseDown, this);
			}
			if (config.on.onMouseUp) {
				exports.addListener(this.firstResponder(), "mouseup", this._onMouseUp, this);
			}
		},
		_onClick: function (e) {
			if (this._config.$preventDefault !== false) {
				exports.html.preventEvent(e);
			}
			this.dispatch("onClick", [this._config, this._html, e]);
		},
		_onMouseDown: function (e) {
			if (this._config.$preventDefault !== false) {
				exports.html.preventEvent(e);
			}
			this.dispatch("onMouseDown", [this._config, this._html, e]);
		},
		_onMouseUp: function (e) {
			this.dispatch("onMouseUp", [this._config, this._html, e]);
			if (this._config.$preventDefault !== false) {
				exports._globalMouseUp(e);
				exports.html.preventEvent(e);
			}
		},
		_onContext: function (e) {
			if (this._config.$preventDefault !== false) {
				exports.html.preventEvent(e);
			}
			this.dispatch("onContext", [this._config, this._html, e]);
		}
	};


	exports.components.modal = exports.def({
		__name__: "modal",
		$defaults: {
			tagClass: "uk-modal",
			light: false,
			closeButton: true,
			bgClose: true,
			keyboard: true,
			minScrollHeight: 150,
			closeModals: false,
			center: true,
			flex: false,
			margin: "",
			size: "",
			layout: "",
			dialogClass: "",
			headerClass: "",
			footerClass: ""
		},
		__init__: function (config) {
			this.header = this._header = exports.html.createElement("DIV", {class: "uk-modal-header"});
			this.footer = this._footer = exports.html.createElement("DIV", {class: "uk-modal-footer"});
			this.body = this._body = exports.html.createElement("DIV", {class: "uk-modal-dialog"});

			if (config.headerClass) exports.html.addCSS(this._header, config.headerClass);
			if (config.dialogClass) exports.html.addCSS(this._body, config.dialogClass);
			if (config.footerClass) exports.html.addCSS(this._footer, config.footerClass);

			this._html.appendChild(this._body);
			if (config.header) this._body.appendChild(this._header);
			if (config.footer) this._body.appendChild(this._footer);
		},
		$setters: {
			light: function (value) {
				if (value)
					exports.html.addCSS(this._html, "uk-modal-dialog-lightbox");
				return value;
			},
			bodyWidth: function (value) {
				value = exports.isNumber(value) ? value + "px" : value;
				this._body.style.width = value;
				return value;
			},
			bodyHeight: function (value) {
				value = exports.isNumber(value) ? value + "px" : value;
				this._body.style.height = value;
				return value;
			},
			closeButton: function (value) {
				if (value) {
					this._close = exports.html.createElement("A",
						{class: "uk-modal-close uk-close"});
					if (this._body.firstChild) {
						this._body.insertBefore(this._close, this._body.firstChild);
					}
					else {
						this._body.appendChild(this._close);
					}
				}
				return value;
			},
			body: function (value) {
				var innerBody = exports.new(value);
				this.bodyContent = innerBody;
				this.$components.push(this.bodyContent);

				if (this._footer.parentNode) {
					this._body.insertBefore(innerBody._html, this._footer);
				}
				else {
					this._body.appendChild(innerBody._html);
				}
				return value;
			},
			header: function (value) {
				var innerHeader = exports.new(value);
				this._header.appendChild(innerHeader._html);
				this.headerContent = innerHeader;
				this.$components.push(this.headerContent);
				return value;
			},
			footer: function (value) {
				var innerFooter = exports.new(value);
				this._footer.appendChild(innerFooter._html);
				this.footerContent = innerFooter;
				this.$components.push(this.footerContent);
				return value;
			},
			caption: function (value) {
				if (!this._caption)
					this._caption = exports.html.createElement("DIV", {class: "uk-modal-caption"});
				this._caption.innerHTML = value;
				this._body.appendChild(this._caption);
				return value;
			}
		},
		open: function (args) {
			/**
			 * Opens the modal.
			 * @dispatch onOpen, onOpened
			 * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
			 */
			var config = this._config;
			this.dispatch("onOpen", [config, this._html, args]);
			UIkit.modal('#' + config.id, {
				center: config.center,
				bgclose: config.bgClose,
				keyboard: config.keyboard,
				modal: config.closeModals,
				minScrollHeight: config.minScrollHeight
			}).show();
			this.dispatch("onOpened", [config, this._html, args]);
		},
		close: function (args) {
			/**
			 * Closes the modal.
			 * @dispatch onClose, onClosed
			 * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
			 */
			this.dispatch("onClose", [this._config, this._html, args]);
			UIkit.modal('#' + this._config.id).hide();
			this.dispatch("onClosed", [this._config, this._html, args]);
		}
	}, exports.components.flexgrid);


	// Define setter options for auto-documentation
	(function($) {
		$.light.isBoolean = true;
		$.bodyWidth.isText = true;
		$.bodyHeight.isText = true;
		$.closeButton.isBoolean = true;
		$.body.description = "Configuration object to put in the modal body.";
		$.header.description = "Configuration object to put in the modal header.";
		$.footer.description = "Configuration object to put in the modal footer.";
		$.caption.isText = true;
		$._meta = exports.extend({
			bgClose: {isBoolean: true},
			keyboard: {isBoolean: true},
			minScrollHeight: {isNumber: true},
			closeModals: {isBoolean: true},
			center: {isBoolean: true},
			dialogClass: {options: ['', 'uk-modal-dialog-blank', 'uk-modal-dialog-full']}
		}, $._meta || {});
	}(exports.components.modal.prototype.$setters));


	exports.components.button = exports.def({
		__name__: "button",
		$defaults: {
			label: "",
			htmlTag: "BUTTON",
			tagClass: "uk-button",
			iconClass: "uk-icon-small",
			selectable: false
		},
		$setters: exports.setCSS({
			type: {
				primary: "uk-button-primary",
				success: "uk-button-success",
				danger: "uk-button-danger",
				link: "uk-button-link",
				"": ""
			},
			size: {
				mini: "uk-button-mini",
				small: "uk-button-small",
				large: "uk-button-large",
				"": ""
			},
			textAlign: {
				middle: "uk-text-middle",
				top: "uk-text-top",
				bottom: "uk-text-bottom"
			}
		}),
		template: function (config) {
			if (config.type == "icon")
				return "<i class='{{icon}} {{iconClass}}'></i><span>{{label}}</span>";
			else
				return "<span>{{label}}</span>";
		},
		select: function () {
			/**
			 * Change the button state to selected.
             */
			this._config.$selected = true;
			exports.html.addCSS(this._html, "uk-active");
		},
		isSelected: function () {
			/**
			 * Returns if the button is in the selected state.
			 * @returns {boolean}
			 */
			return !!this._config.$selected;
		},
		unselect: function () {
			/**
			 * Change the button state to unselected.
             */
			this._config.$selected = false;
			exports.html.removeCSS(this._html, "uk-active");
		}
	}, exports.ClickEvents, exports.components.element);


	// Define setter options for auto-documentation
	(function($) {
		$._meta = exports.extend({
			iconClass: {isText: true},
			icon: {isText: true}
		}, $._meta || {});
	}(exports.components.button.prototype.$setters));


	exports.components.icon = exports.def({
		__name__: "icon",
		$defaults: {
			htmlTag: "A",
			tagClass: "uk-icon-hover",
			iconClass: "uk-icon-small",
			selectable: false,
			content: ""
		},
		__init__: function (config) {
			if (config.type == "button")
				config.tagClass = "uk-icon-button";
		},
		template: "<i class='{{icon}} {{iconClass}}'>{{content}}</i>"
	}, exports.ClickEvents, exports.components.element);


	// Define setter options for auto-documentation
	(function($) {
		$._meta = exports.extend({
			iconClass: {isText: true}
		}, $._meta || {});
	}(exports.components.icon.prototype.$setters));


	exports.components.label = exports.def({
		__name__: "label",
		$defaults: {
			label: "",
			htmlTag: "SPAN",
			selectable: false
		},
		$setters: exports.setCSS({
			type: {
				form: "uk-form-label",
				"": ""
			}
		}),
		template: function (config) {
			return config.label;
		},
		getValue: function () {
			/**
			 * Gets the text value (HTML accepted) of the label.
			 * @returns {string}
			 */
			return this._config.label;
		},
		setValue: function (value) {
			/**
			 * Sets the value (HTML accepted) of the label component.
			 * @param value
			 */
			this._config.label = value;
			this.render();
		}
	}, exports.components.element);


	exports.components.link = exports.def({
		__name__: "link",
		$defaults: {
			label: "",
			htmlTag: "A",
			margin: "",
			$preventDefault: false
		},
		template: function (config) {
			return config.label;
		}
	}, exports.ClickEvents, exports.components.element);


	exports.components.progress = exports.def({
		__name__: "progress",
		$defaults: {
			htmlTag: "DIV",
			tagClass: "uk-progress",
			fill: "width"
		},
		$setters: exports.setCSS({
			size: {
				mini: "uk-progress-mini",
				small: "uk-progress-small",
				"": ""
			},
			type: {
				danger: "uk-progress-danger",
				warning: "uk-progress-warning",
				success: "uk-progress-success",
				striped: "uk-progress-striped",
				"": "",
				$multiple: true
			}
		}),
		render: function () {
		},
		__init__: function () {
			this._bar = exports.html.createElement("DIV", {class: "uk-progress-bar"});
			this._html.appendChild(this._bar);
		},
		getValue: function () {
			/**
			 * Gets the value of the progress component.
			 * @returns {number}
			 */
			return this._progress;
		},
		setValue: function (value) {
			/**
			 * Sets the value of the progress component.
			 * @param value A percentage value from 0-100.
			 */
			exports.assert(exports.isNumber(value), "Progress value should be a number.");

			var $this = this;
			$this._bar.style.width = value + '%';
			$this._progress = value;
		}
	}, exports.components.element);


	exports.components.image = exports.def({
		__name__: "image",
		$defaults: {
			htmlTag: "IMG",
			margin: "",
			src: ""
		},
		$setters: {
			src: function (value) {
				this._html.setAttribute("src", value);
				return value;
			}
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "load", function (e) {
				this.dispatch("onLoad", [e])
			}, this);
		}
	}, exports.ClickEvents, exports.components.element);


	exports.FormControl = {
		$setters: exports.extend(exports.setCSS(
			{
				size: {
					large: "uk-form-large",
					small: "uk-form-small",
					"": ""
				}
			}),
			{
				class: function (value) {
					this.setClass(value);
					return value;
				},
				help: function (value) {
					if (this.help && this.help.parentNode) {
						this.help.parentNode.removeChild(this.help);
					}
					if (value) {
						if (this._config.inline) {
							this.help = exports.html.createElement("SPAN", {class: "uk-form-help-inline"});
						}
						else {
							this.help = exports.html.createElement("P", {class: "uk-form-help-block"});
						}
						this.help.innerHTML = value;
						this.getFormControl().parentNode.appendChild(this.help);
					}
					return this.help;
				},
				autocomplete: function (value) {
					if (value == "off" || !value)
						this.getFormControl().setAttribute("autocomplete", "off");
					return value;
				},
				autocapitalize: function (value) {
					if (value == "off" || !value)
						this.getFormControl().setAttribute("autocapitalize", "off");
					return value;
				},
				autocorrect: function (value) {
					if (value == "off" || !value)
						this.getFormControl().setAttribute("autocorrect", "off");
					return value;
				},
				type: function (value) {
					this.getFormControl().setAttribute("type", value);
					exports.html.addCSS(this.getFormControl(), "uk-vertical-align-middle");
					return value;
				},
				value: function (value) {
					if (value !== undefined)
						this.setValue(value);
					return value;
				},
				placeholder: function (value) {
					this.getFormControl().setAttribute("placeholder", value);
					return value;
				}
			}
		),
		firstResponder: function () {
			/**
			 * The first responder to events.
			 * This element will get bound to events such as blur/focus/change etc.
			 * @returns {Element}
			 */
			return this.getFormControl();
		},
		getFormControl: function () {
			/**
			 * Get the HTML element.
			 * @returns {Element}
			 */
			return this._html;
		},
		setClass: function (value) {
			/**
			 * Set the display class for the form control.
			 * @param value One of ['success', 'danger']
			 */
			var formControl = this.getFormControl();
			switch (value) {
				case "success":
					exports.html.removeCSS(formControl, "uk-form-danger");
					exports.html.addCSS(formControl, "uk-form-success");
					break;
				case "danger":
					exports.html.addCSS(formControl, "uk-form-danger");
					exports.html.removeCSS(formControl, "uk-form-success");
					break;
				default:
					exports.html.removeCSS(formControl, "uk-form-danger");
					exports.html.removeCSS(formControl, "uk-form-success");
			}
			var helpControl = this.help;
			if (helpControl) {
				switch (value) {
					case "success":
						exports.html.removeCSS(helpControl, "uk-text-danger");
						exports.html.addCSS(helpControl, "uk-text-success");
						break;
					case "danger":
						exports.html.addCSS(helpControl, "uk-text-danger");
						exports.html.removeCSS(helpControl, "uk-text-success");
						break;
					default:
						exports.html.removeCSS(helpControl, "uk-text-danger");
						exports.html.removeCSS(helpControl, "uk-text-success");
				}
			}
		},
		reset: function () {
			/**
			 * Clear the form control.
			 */
			this.getFormControl().value = "";
		},
		enable: function () {
			/**
			 * Enable the form control.
			 */
			this.getFormControl().removeAttribute('disabled');
		},
		disable: function () {
			/**
			 * Disable the form control.
			 */
			this.getFormControl().setAttribute('disabled', "");
		},
		getValue: function () {
			/**
			 * Get the value of the form control.
			 * @returns {*}
			 */
			return this.getFormControl().value;
		},
		setValue: function (value) {
			/**
			 * Set the value of the form control.
			 * @param value
			 */
			this.getFormControl().value = value;
		}
	};

	// Define setter options for auto-documentation
	(function($) {
		$.help.isText = true;
		$.autocomplete.isBoolean = true;
		$.autocapitalize.isBoolean = true;
		$.autocorrect.isBoolean = true;
		$.placeholder.isText = true;
		$.class.options = {"": "", "danger": "danger", "success": "success"};
		$.type.description = "Set the type of the HTML input element.";
		$.value.description = "Initial value of the HTML input element.";
	}(exports.FormControl.$setters));


	exports.components.toggle = exports.def({
		__name__: "toggle",
		$setters: exports.setCSS({
			type: {
				"success": "uk-toggle-success",
				"danger": "uk-toggle-danger",
				"warning": "uk-toggle-warning",
				"": ""
			}
		}),
		$defaults: {
			htmlTag: "LABEL",
			tagClass: "uk-toggle"
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "change", this._onChange, this);
		},
		_onChange: function () {
			this.dispatch("onChange", [this.getValue()]);
		},
		template: function (config) {
			return exports.replaceString('<input type="checkbox"{{checked}}><div class="uk-toggle-slider"></div>',
				{checked: config.checked ? " checked" : ""});
		},
		getFormControl: function() {
			/**
			 * Get the HTML input element.
			 * @returns {Element}
			 */
			return this._html.firstChild;
		},
		reset: function () {
			/**
			 * Reset the toggle.
             */
			this.getFormControl().checked = false;
		},
		getValue: function () {
			/**
			 * Get the value of the toggle.
			 * @returns {boolean}
			 */
			return this.getFormControl().checked;
		},
		setValue: function (value) {
			/**
			 * Set the value of the toggle.
			 * @paramm value
			 */
			this.getFormControl().checked = value;
		}
	}, exports.components.element);


	exports.components.input = exports.def({
		__name__: "input",
		$defaults: {
			htmlTag: "INPUT",
			inputWidth: "medium",
			autocomplete: "on",
			autocapitalize: "on",
			autocorrect: "on",
			inline: false
		},
		$setters: {
			checked: function (value) {
				this.getFormControl().checked = value;
				return value;
			}
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "change", this._onChange, this);
			exports.addListener(this.firstResponder(), "input", this._onInput, this);
			exports.addListener(this.firstResponder(), "keyup", function (e) {
				this.dispatch("onKeyUp", [e, this._html, this]);
			}, this);
		},
		_onChange: function () {
			this.dispatch("onChange", [this.getValue()]);
		},
		_onInput: function () {
			this.dispatch("onInput", [this.getValue()]);
		},
		reset: function () {
			/**
			 * Clear the HTML input element.
			 */
			switch (this._config.type) {
				case "checkbox":
					this.getFormControl().checked = this._config.checked;
					break;
				case "number":
					this.getFormControl().value = 0;
					break;
				default:
					this.getFormControl().value = "";
					break;
			}
		},
		getValue: function () {
			/**
			 * Get the value of the HTML input element.
			 * @returns {string|boolean}
			 */
			if (this._config.type == "checkbox") {
				return this.getFormControl().checked;
			}
			else return this.getFormControl().value;
		},
		setValue: function (value) {
			/**
			 * Set the value of the HTML input element.
			 * @param value
			 */
			if (this._config.type == "checkbox") {
				this.getFormControl().checked = value;
			}
			else this.getFormControl().value = value;
		}
	}, exports.FormControl, exports.components.element);

	// Define setter options for auto-documentation
	(function($) {
		$.checked.isBoolean = true;
	}(exports.components.input.prototype.$setters));


	exports.components.password = exports.def({
		__name__: "password",
		$defaults: {
			tagClass: "uk-form-password",
			inputWidth: "medium"
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "change", this._onChange, this);
			exports.addListener(this.firstResponder(), "input", this._onInput, this);
		},
		_onChange: function () {
			this.dispatch("onChange", [this.getValue()]);
		},
		_onInput: function () {
			this.dispatch("onInput", [this.getValue()]);
		},
		getFormControl: function () {
			/**
			 * Gets the HTML input element.
			 * @returns {Element}
			 */
			return this._html.firstChild;
		},
		template: "<input type='password' style='width:100%'><a class='uk-form-password-toggle' data-uk-form-password>Show</a>"
	}, exports.FormControl, exports.components.element);


	exports.components.autocomplete = exports.def({
		__name__: "autocomplete",
		$defaults: {
			tagClass: "uk-autocomplete",
			placeholder: "",
			minLength: 0,
			caseSensitive: false,
			sources: [],
			autocomplete: function (release) {
				var searchValue = this.getValue();
				var config = this._config;
				if (!config.caseSensitive) searchValue = searchValue.toLowerCase();

				release(exports.ListMethods.filter.call(this._getSource(),
					function (item) {
						var value = config.caseSensitive ? item.value : item.value.toLowerCase();
						return value.indexOf(searchValue) != -1;
					}));
			}
		},
		$setters: {
			sources: function (value) {
				if (exports.isFunction(value))
					this._getSource = value;
				else
					this._getSource = exports.echo(value);
				return value;
			},
			autocomplete: function (value) {
				var self = this;
				this._html.style.wordBreak = "break-word";
				self._autocomplete = UIkit.autocomplete(self._html,
					{source: exports.bind(value, self), minLength: self._config.minLength});
				self._autocomplete.dropdown.attr("style", "width:100%");
				self._autocomplete.dropdown.addClass('uk-dropdown-small');
				self._autocomplete.on("selectitem.uk.autocomplete", function (e, obj) {
					self.dispatch("onChange", [obj.value]);
					self.dispatch("onAutocomplete", [obj]);
				});
			}
		},
		template: function (config) {
			return exports.replaceString(
				'<input type="text" placeholder="{{placeholder}}" style="width:100%">',
				{placeholder: config.placeholder});
		}
	}, exports.components.password);


	// Define setter options for auto-documentation
	(function($) {
		$._meta = exports.extend({
			caseSensitive: {isBoolean: true},
			minLength: {isNumber: true},
			sources: 'An array of sources for the autocomplete.',
			autocomplete: "A matching function that is passed a release callback to determine the final displayed autocomplete results. Default uses the 'sources' property."
		}, $._meta || {});
	}(exports.components.input.prototype.$setters));


	exports.components.search = exports.def({
		__name__: "search",
		$defaults: {
			tagClass: "uk-search",
			placeholder: "Search...",
			iconTemplate: "<i class='uk-icon-search uk-margin-right'></i>",
			inputClass: "uk-search-field",
			inputType: "search"
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "change", this._onChange, this);
			exports.addListener(this.firstResponder(), "input", this._onInput, this);
			exports.addListener(this.firstResponder(), "keyup", function (e) {
				this.dispatch("onKeyUp", [e, this._html, this]);
			}, this);
		},
		_onChange: function () {
			this.dispatch("onChange", [this.getValue()]);
		},
		_onInput: function () {
			this.dispatch("onInput", [this.getValue()]);
		},
		getFormControl: function () {
			/**
			 * Gets the HTML input element.
			 * @returns {Element}
			 */
			return this._html.lastChild;
		},
		template: '{{iconTemplate}}<input class="{{inputClass}}" type="{{inputType}}" placeholder="{{placeholder}}">'
	}, exports.FormControl, exports.components.element);


	exports.components.dropdown = exports.def({
		__name__: "dropdown",
		$defaults: {
			mode: "click",
			pos: "bottom-center",
			margin: "",
			padding: "none",
			justify: false,
			dropdownCSS: "uk-dropdown-small uk-dropdown-close",
			blank: false
		},
		$setters: {
			dropdown: function (value) {
				var dropdown = exports.html.createElement("DIV",
					{class: exports.stringCSS(this._dropdownCSS())});

				if (!value.listStyle) {
					value.listStyle = "dropdown";
				}

				var ui = exports.new(value);
				dropdown.appendChild(ui._html);
				this._html.appendChild(dropdown);
				this._inner = ui;
				this.$components.push(this._inner);
				return value;
			}
		},
		__init__: function (config) {
			this._dropdown = UIkit.dropdown(this._html, {pos: config.pos, justify: config.justify, mode: config.mode});
		},
		_dropdownCSS: function () {
			var config = this._config;
			var result = config.dropdownCSS;
			result += config.blank ? " uk-dropdown-blank" : " uk-dropdown";
			result += config.scrollable ? "uk-dropdown-scrollable" : "";
			return result;
		},
		getBoundingClientRect: function () {
			/**
			 * Gets the bounding rectangle of the element. Needs to be added first since this delegates the call to element.getBoundingClientRect.
			 * @returns {*|ClientRect}
			 */
			return this._html.firstChild.getBoundingClientRect();
		},
		isOpened: function () {
			/**
			 * Returns if the dropdown is open.
			 * @returns {boolean}
			 */
			return exports.html.hasCSS(this._html, 'uk-open');
		},
		open: function (args) {
			/**
			 * Opens the dropdown.
			 * @dispatch onOpen, onOpened
			 * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
			 */
			args = [this._config, this._html, args];
			this.dispatch("onOpen", args);
			this._inner.dispatch("onOpen", args);
			this._dropdown.show();
			this.dispatch("onOpened", args);
			this._inner.dispatch("onOpened", args);
		},
		close: function (args) {
			args = [this._config, this._html, args];
			$this.dispatch("onClose", args);
			$this._inner.dispatch("onClose", args);
			// Tricky: on mobile browsers HTML update/rendering timings are a bit wonky
			// Adding a delay helps close dropdowns properly on Chrome (mobile)
			setTimeout(function () {
				exports.html.removeCSS($this._html, 'uk-open');
				$this.dispatch("onClosed", args);
				$this._inner.dispatch("onClosed", args);
			}, 10);
		}
	}, exports.components.flexgrid, exports.AbsolutePositionMethods);


	exports.LinkedList = {
		__name__: "LinkedList",
		__check__: function (bases) {
			exports.assert(bases.indexOf('LinkedList') != -1, "LinkedList is an abstract class and must be extended.");
			exports.assert(bases.indexOf('Dispatcher') != -1, "LinkedList must extend Dispatcher.");
		},
		__init__: function () {
			this.headNode = null;
			this.tailNode = null;
			this._nodeList = [];
		},
		id: function (data) {
			/**
			 * Assigns an id to an object if one doesn't exist.
			 * @param data The object to assign an id to.
			 * @returns {*|string} The id of the object.
			 */
			return data.id || (data.id = exports.new.uid("data"));
		},
		getItem: function (id) {
			/**
			 * Gets a configuration object by its id.
			 * @param id The id of the element.
			 * @returns {object}
			 */
			return this.findOne('id', id);
		},
		count: function () {
			/**
			 * Gets a count of all objects.
			 * @returns {number}
			 */
			return this._nodeList.length;
		},
		updateItem: function (item, update) {
			/**
			 * Updates an item by adding properties found on the update object.
			 * @param item The itemt o update.
			 * @param update An object containing properties and values to modify.
			 */
			exports.assert(update, exports.replaceString("Invalid update object for Id {{id}}", {id: item.id}));
			var refNode = item.$tailNode;
			this.remove(item);
			exports.extend(item, update, true);
			this.add(item, refNode);
		},
		refresh: function () {
			/**
			 * Refresh the list.
			 * @dispatch onRefresh
			 */
			this.dispatch("onRefresh");
		},
		pluck: function (key) {
			/**
			 * Plucks a property from all child objects.
			 * @param key The key of the child objects.
			 * @returns {array}
			 */
			return this.each(function (item) {
				return item[key]
			});
		},
		each: function (func, thisArg) {
			/**
			 * Invokes a function on each child.
			 * @param func The invoked function.
			 * @param thisArg The 'this' object passed to the invoked function.
			 * @returns Return an array containing the results of the invoked call.
			 */
			var node = this.headNode;
			var nextNode;
			var results = [];
			while (node) {
				nextNode = node.$tailNode;
				results.push(func.call(thisArg || this, node));
				node = nextNode;
			}
			return results;
		},
		add: function (item, node) {
			/**
			 * Adds an item to the end.
			 * @param item The item to add.
			 * @dispatch onAdd, onAdded
			 * @returns The object id after adding.
			 */
			return this.insertBefore(item, node);
		},
		insertBefore: function (item, node) {
			/**
			 * Add an item before another item.
			 * @param item The item to add.
			 * @param node The reference item to add the item before.
			 * @dispatch onAdd, onAdded
			 * @returns The object id after adding.
			 */
			exports.assert(exports.isObject(item), exports.replaceString("Expected object, got {{type}}: {{item}}", {type: typeof item, item: item}));
			exports.assert(this._nodeList.indexOf(item) == -1, "Circular reference detected with node insert!");

			item.id = this.id(item);

			if (!node && this.tailNode) {
				// Insert as last node
				return this.insertAfter(item, this.tailNode);
			}
			else {
				this.dispatch("onAdd", [item]);

				if (this.headNode == null || this.tailNode == null) {
					this.headNode = item;
					this.tailNode = item;
					item.$headNode = item.$tailNode = null;
				}
				else {
					if (node.$headNode) {
						node.$headNode.$tailNode = item;
					}
					item.$headNode = node.$headNode;
					item.$tailNode = node;
					node.$headNode = item;

					if (node == this.headNode)
						this.headNode = item;
				}

				this._nodeList.push(item);

				this.dispatch("onAdded", [item, node]);

				return item.id;
			}
		},
		insertAfter: function (item, node) {
			/**
			 * Add an item after another item.
			 * @param item The item to add.
			 * @param node The reference item to add the item after.
			 * @dispatch onAdd, onAdded
			 * @returns The object id after adding.
			 */
			exports.assert(exports.isObject(item), exports.replaceString("Expected object, got {{item}}", {item: item}));
			exports.assert(this._nodeList.indexOf(item) == -1, "Circular reference detected with node insert!");

			item.id = this.id(item);

			if (!node && this.headNode) {
				// Insert as first node
				return this.insertBefore(item, this.headNode);
			}
			else {
				this.dispatch("onAdd", [item]);

				if (this.headNode == null || this.tailNode == null) {
					this.headNode = item;
					this.tailNode = item;
					item.$headNode = item.$tailNode = null;
				}
				else {
					if (node.$tailNode) {
						node.$tailNode.$headNode = item;
					}
					item.$tailNode = node.$tailNode;
					item.$headNode = node;
					node.$tailNode = item;

					if (node == this.tailNode)
						this.tailNode = item;
				}

				this._nodeList.push(item);

				this.dispatch("onAdded", [item]);

				return item.id;
			}
		},
		remove: function (item) {
			/**
			 * Removes an item.
			 * @param item The item to remove.
			 * @dispatch onDelete, onDeleted
			 * @returns The item object.
			 */
			exports.assert(exports.isObject(item), exports.replaceString("Expected object, got {{item}}", {item: item}));

			this.dispatch("onDelete", [item]);

			if (item.$headNode) item.$headNode.$tailNode = item.$tailNode;
			if (item.$tailNode) item.$tailNode.$headNode = item.$headNode;
			if (item == this.headNode)
				this.headNode = item.$tailNode;
			if (item == this.tailNode)
				this.tailNode = item.$headNode;
			item.$tailNode = item.$headNode = null;

			if (this._nodeList.indexOf(item) != -1)
				exports.ListMethods.remove.call(this._nodeList, item);

			this.dispatch("onDeleted", [item]);
			return item;
		},
		clearAll: function () {
			/**
			 * Remove all items.
             */
			this.headNode = null;
			this.tailNode = null;
			this._nodeList = [];
			this.dispatch("onClearAll", []);
		},
		previous: function (node) {
			return node.$headNode;
		},
		next: function (node) {
			return node.$tailNode;
		},
		contains: function (item) {
			/**
			 * Checks if an item exists.
			 * @param item The item to check for.
			 */
			return this._nodeList.indexOf(item) != -1;
		},
		indexOf: function (item, beginNode) {
			/**
			 * Gets the index of an item.
			 * @param item The item to find the index for.
			 * @param beginNode An optional node which specifies the start.
			 * @returns {int|undefined} The index of the item, or undefined if doesn't exist.
			 */
			var i = 0;
			var node = beginNode || this.headNode;
			while (node) {
				// Apparently 1 == "1" in JS
				if (node === item)
					return i;
				node = node.$tailNode;
				i++;
			}
		},
		findWhere: function (key, value, beginNode) {
			/**
			 * Find all items based on a key and value.
			 * @param key The key to look at for matching.
			 * @param value The value of the key.
			 * @param beginNode An optional node which specifies the start.
			 * @returns {object} The item if found, undefined otherwise.
			 */
			var result = [];
			var node = beginNode || this.headNode;
			while (node) {
				// Apparently 1 == "1" in JS
				if (node[key] === value)
					result.push(node);
				node = node.$tailNode;
			}
			return result;
		},
		findOne: function (key, value, beginNode) {
			/**
			 * Finds an item based on a key and value of the item.
			 * @param key The key to look at for matching.
			 * @param value The value of the key.
			 * @param beginNode An optional node which specifies the start.
			 * @returns {object} The item if found, undefined otherwise.
			 */
			var node = beginNode || this.headNode;
			while (node) {
				// Apparently 1 == "1" in JS
				if (node[key] === value)
					return node;
				node = node.$tailNode;
			}
		},
		findFirst: function (cond, beginNode, thisArg) {
			/**
			 * Finds the first item which matches a condition predicate function.
			 * @param cond The condition function.
			 * @param beginNode An optional node which specifies the start.
			 * @param thisArg The 'this' argument to pass to the function.
			 * @returns {object} The item if found, undefined otherwise.
			 */
			var node = beginNode || this.headNode;
			while (node) {
				if (cond.call(thisArg || this, node)) {
					return node;
				}
				node = node.$tailNode;
			}
		},
		findLast: function (cond, beginNode, thisArg) {
			/**
			 * Finds the last item which matches a condition predicate function.
			 * @param cond The condition function.
			 * @param beginNode An optional node which specifies the start.
			 * @param thisArg The 'this' argument to pass to the function.
			 * @returns {object} The item if found, undefined otherwise.
			 */
			var node = beginNode || this.headNode;
			var lastNode = null;
			while (node) {
				if (cond.call(thisArg || this, node)) {
					lastNode = node;
				}
				else {
					return lastNode;
				}
				node = node.$tailNode;
			}
			return lastNode;
		}
	};


	exports.stack = exports.def({
		__name__: "stack",
		$defaults: {
			filter: function () {
				return true;
			}
		},
		$setters: {
			filter: function (value) {
				exports.assert(exports.isFunction(value), "Expected function for 'filter', got: " + value);
				return value;
			},
			droppable: function (value) {
				if (exports.isFunction(value))
					this._droppable = value;
				return value;
			}
		},
		__after__: function (config) {
			this.addListener("onAdded", this._onAdded);
			this.addListener("onDeleted", this._onDeleted);
			this.addListener("onRefresh", this._onRefresh);
			this.addListener("onClearAll", this._onClearAll);

			if (config.data) {
				this.setData(config.data);
			}
		},
		__init__: function () {
			this._itemNodes = {};
		},
		getItemNode: function (id) {
			/**
			 * Get the wrapper element that used to hold a child component with a specific id. For example, this would be an LI in a list.
			 * @returns {Element}
			 */
			return this._itemNodes[id];
		},
		render: function () {
			// Do nothing, overwrites render function.
		},
		_droppable: function () {
			return true;
		},
		_containerHTML: function () {
			return this._html;
		},
		_itemHTML: function () {
			return exports.html.createElement("DIV");
		},
		_innerHTML: function () {
			return {id: exports.new.uid("item")};
		},
		_createItem: function (obj) {
			var item = this._itemHTML(obj);
			item.setAttribute('data-id', obj.id);
			this._innerHTML(item, obj);
			this._itemNodes[obj.id] = item;
			return item;
		},
		_onAdded: function (obj) {
			if (obj.$tailNode)
				this._containerHTML().insertBefore(this._createItem(obj), this.getItemNode(obj.$tailNode.id));
			else
				this._containerHTML().appendChild(this._createItem(obj));

			if (obj.$parent) {
				var parent = this.getItem(obj.$parent);
				var parentNode = this.getItemNode(parent.id);
				parentNode.parentNode.replaceChild(this._createItem(parent), parentNode);
			}

			this.dispatch("onDOMChanged", [obj, "added"]);
		},
		_onDeleted: function (obj) {
			if (obj.$parent) {
				var parent = this.getItem(obj.$parent);
				parent.$children.remove(obj);
				var parentNode = this.getItemNode(parent.id);
				parentNode.parentNode.replaceChild(this._createItem(parent), parentNode);
			}
			this._containerHTML().removeChild(this.getItemNode(obj.id));
			delete this._itemNodes[obj.id];

			this.dispatch("onDOMChanged", [obj, "deleted"]);
		},
		_onRefresh: function () {
			this._onClearAll();
			this._itemNodes = {};
			this.each(function (node) {
				this._itemNodes[node.id] = this._createItem(node);
				if (this.filter(node))
					this._containerHTML().appendChild(this._itemNodes[node.id]);
			}, this);

			this.dispatch("onDOMChanged", [null, "refresh"]);
		},
		_onClearAll: function () {
			for (var j in this._itemNodes) {
				if (this._itemNodes.hasOwnProperty(j) && this._itemNodes[j].parentNode)
					this._containerHTML().removeChild(this._itemNodes[j]);
			}

			this.dispatch("onDOMChanged", [null, "clear"]);
		},
		setData: function (value) {
			/**
			 * Sets the data for the component.
			 * @param value An array of component configuration objects. The default view object is 'link' if none is specified.
			 */
			exports.assert(exports.isArray(value), "setData expected array, got: " + value, this);
			this.clearAll();
			for (var i = 0; i < value.length; i++) {
				if (this.filter(value[i])) {
					this.add(value[i]);
				}
			}
			this.data = value;
		},
		getBatch: function () {
			/**
			 * Get the 'batch' value that was passed to `setBatch`.
			 */
			return this.$batch;
		},
		showBatch: function (name) {
			/**
			 * Show only elements with a specific 'batch' value in its configuration. Hides all other elements.
			 * @param name An array or a delimited string with a list of batch values to filter by.
			 * @example showBatch('icons sidebar mainWindow')
			 */
			this.$batch = name;
			this.each(function (item) {
				if (name.indexOf(item.batch) != -1)
					exports.html.removeCSS(this._itemNodes[item.id], "uk-hidden");
				else
					exports.html.addCSS(this._itemNodes[item.id], "uk-hidden");
			}, this);
		}
	}, exports.LinkedList, exports.components.element);


	(function($) {
		$.filter.description = 'A function to determine which child components to display. The function is passed the child component object.';
		$.droppable.description = 'A function to determine if a child component can be drag and dropped upon. The function is passed the child component object.';

		$._meta = exports.extend({
			data: 'An array of component objects.'
		}, $._meta || {});
	}(exports.stack.prototype.$setters));


	exports.components.list = exports.def({
		__name__: "list",
		$defaults: {
			htmlTag: "UL",
			itemTag: "LI",
			selectable: false,
			closeButton: false,
			listStyle: "list",
			itemClass: "",
			margin: "",
			dropdownEvent: "onItemClick"
		},
		$setters: exports.extend(
			exports.setCSS({
				listStyle: {
					"nav": "uk-nav",
					"side": ["uk-nav", "uk-nav-side"],
					"offcanvas": ["uk-nav", "uk-nav-offcanvas"],
					"dropdown": ["uk-nav", "uk-nav-dropdown", "uk-nav-side"],
					"stripped": ["uk-nav", "uk-list", "uk-list-stripped"],
					"line": ["uk-list", "uk-list-line"],
					"subnav": "uk-subnav",
					"navbar": "uk-navbar-nav",
					"navbar-center": "uk-navbar-center",
					"subnav-line": ["uk-subnav", "uk-subnav-line"],
					"subnav-pill": ["uk-subnav", "uk-subnav-pill"],
					"list": "uk-list",
					"tab": "uk-tab",
					"tab-flip": "uk-tab-flip",
					"tab-bottom": "uk-tab-bottom",
					"tab-center": "uk-tab-center",
					"tab-left": "uk-tab-left",
					"tab-right": "uk-tab-right",
					"breadcrumb": "uk-breadcrumb",
					"": "",
					$multiple: true
				}
			}),
			{
				accordion: function (value) {
					if (value)
						this._html.setAttribute("data-uk-nav", "");
					return value;
				},
				tab: function (value) {
					if (value) {
						var $this = this;
						$this.addListener("onItemClick", $this._onTabClick);

						if (value == "responsive") {
							// Create a list of linked data to the actual data
							// This avoids needing to duplicate the data
							var linkedData = exports.list($this.config.data).each(function (item) {
								return {label: item.label, $link: item, $close: item.$close};
							});

							$this.set('dropdownEvent', "onTabMenuClick");
							$this.set('dropdown', {
								view: "list",
								data: linkedData,
								on: {
									onItemClick: function (item, node, e) {
										$this._onTabClick(item.$link, node, e);
									},
									onItemSelectionChanged: function (item, node, e) {
										$this._onTabClick(item.$link, node, e);
									},
									onItemClosed: function (item) {
										$this.closeItem(item.$link);
									}
								}
							});
							$this.dropdownList = $this.dropdownPopup._inner;
						}
					}
					return value;
				}
			}
		),
		__after__: function (config) {
			if (config.tab) {
				this.addListener("onAdded", this._onTabAdded);
				this.addListener("onDeleted", this._onTabDeleted);
				this.addListener("onItemSelectionChanged", this._onItemSelectionChanged);
				if (config.tab == 'responsive') {
					this.addListener("onDOMChanged", this._onDOMChanged);
					this.add({label: "<i class='uk-icon-bars'></i>", $tabmenu: true, batch: "$menu"}, this.headNode);
					exports.addListener(window, "resize", this.updateFit, this);
					this.dispatch("onDOMChanged", [null, "refresh"]);
				}
			}
		},
		_onDOMChanged: function () {
			exports.delay(this.updateFit, this);
		},
		_onTabAdded: function (item, before) {
			if (this.dropdownList && !item.$tabmenu) {
				var linked = {label: item.label, $link: item, $close: item.$close};
				this.dropdownList.add(linked, this.dropdownList.findOne("$link", before));
				// Select dropdown item if item is selected
				if (item.$selected) {
					this.dropdownList.unselectAll();
					this.dropdownList.select(linked);
				}
			}
			if (item.$selected) {
				this.unselectAll();
				this.select(item);
			}
		},
		_onTabDeleted: function (item) {
			if (this.dropdownList) {
				var linked = this.dropdownList.findOne("$link", item);
				if (linked) this.dropdownList.remove(linked);
			}
		},
		_onTabClick: function (item, node, e) {
			if (item.$tabmenu) {
				this.dispatch("onTabMenuClick", [item, node, e]);
			}
			else {
				// Select tab item
				if (this.contains(item)) {
					this.dispatch("onItemSelectionChanged", [item]);
				}
			}
		},
		_onItemSelectionChanged: function (item) {
			this.unselectAll();
			this.select(item);

			// Select dropdown item
			if (this.dropdownList) {
				var linked = this.dropdownList.findOne("$link", item);
				if (linked) {
					this.dropdownList.unselectAll();
					this.dropdownList.select(linked);
				}

				// Show active visible item
				this.updateFit();
			}
		},
		updateFit: function () {
			/**
			 * Checks if the screen is wide enough to fit all components. Used with tab mode to allow for a responsive tab menu.
			 */
			this.each(function (item) {
				// Show everything for checking y-offset (keep invisible to avoid blink)
				exports.html.removeCSS(this._itemNodes[item.id], "uk-hidden");
				exports.html.addCSS(this._itemNodes[item.id], "uk-invisible");
				// Update batch according to $selected state
				if (!item.$tabmenu) {
					item.batch = item.$selected ? "$selected" : undefined;
				}
			}, this);

			var offset, doResponsive;
			for (var id in this._itemNodes) {
				if (this._itemNodes.hasOwnProperty(id)) {
					if (offset && this._itemNodes[id].offsetTop != offset) {
						doResponsive = true;
						break;
					}
					offset = this._itemNodes[id].offsetTop;
				}
			}

			this.each(function (item) {
				exports.html.removeCSS(this._itemNodes[item.id], "uk-invisible");
			}, this);

			if (doResponsive) {
				this.showBatch(["$menu", "$selected"]);
			}
			else {
				this.showBatch([undefined, "$selected"]);
			}
		},
		setActiveLabel: function (label) {
			/**
			 * Sets the active item of the list based on the item's label property. This operates as a single-selection of an item. Returns true on success.
			 * @param label The label value of an item.
			 * @returns {boolean}
			 */
			return this.setActive("label", label);
		},
		setActive: function (key, value) {
			/**
			 * Set the active item of the list based on a property. This operates as a single-selection of an item. Returns true on success.
			 * @returns {boolean}
			 */
			this.unselectAll();
			var item = this.findOne(key, value);
			if (item) this.select(item);
			return !!item;
		},
		isSelected: function (item) {
			/**
			 * Checks if an item is selected.
			 * @param item An item of the component.
			 */
			if (exports.isString(item))
				item = this.getItem(item);
			return item.$selected;
		},
		select: function (item) {
			/**
			 * Selects an active item of the list. This method will not unselect previously selected items.
			 * @param item The object to select in the list.
			 */
			if (exports.isString(item))
				item = this.getItem(item);
			item.$selected = true;
			exports.html.addCSS(this.getItemNode(item.id), "uk-active");
		},
		unselectAll: function () {
			/**
			 * Unselects all items in the list, use this for single-selection lists.
			 */
			this.each(function (item) {
				var node = this.getItemNode(item.id);
				item.$selected = false;
				exports.assert(node, "Node with id " + item.id + " does not exist");
				exports.html.removeCSS(node, "uk-active");
			}, this);
		},
		closeItem: function (item) {
			/**
			 * For tabs only, closes a tab item and removes it.
			 * @param item The item to remove.
			 * @dispatch onItemClose, onItemClosed, onItemSelectionChanged
			 */
			this.dispatch("onItemClose", [item]);

			if (this.isSelected(item)) {
				// Select the next tab that's not a tab menu.
				var nextItem = this.previous(item) || this.next(item);
				nextItem = nextItem && nextItem.$tabmenu ? this.next(item) : nextItem;

				if (nextItem && !nextItem.$tabmenu) {
					this.select(nextItem);
					this.dispatch("onItemSelectionChanged", [nextItem]);
				}
			}

			// Don't remove if is tabmenu
			if (item && !item.$tabmenu) {
				this.remove(item);
			}

			this.dispatch("onItemClosed", [item]);
		},
		_itemHTML: function (itemConfig) {
			var itemClass = itemConfig.$css || this._config.itemClass;

			var li = exports.html.createElement(this._config.itemTag,
				{
					class: exports.stringCSS(itemClass)
					+ (!itemConfig.view && itemConfig.header ? "uk-nav-header" : "")
					+ (!itemConfig.view && itemConfig.divider ? "uk-nav-divider" : "")
				});

			if (!itemConfig.header && !itemConfig.divider) {
				this._attachNodeEvents(li, itemConfig);
			}
			return li;
		},
		_innerHTML: function (parentNode, config) {
			if (config.view) {
				var ui = exports.new(config);
				this.$components.push(ui);
				parentNode.appendChild(ui._html);
			}
			else if (config.header) {
				parentNode.innerHTML = config.label;
			}
			else if (config.divider) {
			}
			else {
				var link = new exports.components.link(config);
				this.$components.push(link);

				parentNode.appendChild(link._html);

				if (config.closeButton) {
					this._addCloseHTML(link._html, config);
				}
			}
			return ui;
		},
		_addCloseHTML: function (node, item) {
			if (item.$close) {
				var close = exports.html.createElement("SPAN", {class: "uk-close"});

				exports.addListener(close, "click", function (e) {
					if (item.$preventDefault !== false) {
						exports.html.preventEvent(e);
					}
					this.closeItem(item);
				}, this);

				node.appendChild(close);
			}
		},
		_attachNodeEvents: function (node, itemConfig) {
			exports.addListener(node, "click", function (e) {
				if (itemConfig.$preventDefault !== false && this._config.$preventDefault !== false) {
					exports.html.preventEvent(e);
				}
				if (!exports._dragged) {
					this.dispatch("onItemClick", [itemConfig, node, e]);
				}
			}, this);

			if (this.context && itemConfig.context !== false) {
				exports.addListener(node, "contextmenu", function (e) {
					if (itemConfig.$preventDefault !== false) {
						exports.html.preventEvent(e);
					}
					this.dispatch("onItemContext", [itemConfig, node, e]);
				}, this);
			}

			if (this.droppable && itemConfig.$droppable !== false) {
				node.config = itemConfig;
				node.master = this;
				node.$droppable = true;
			}

			if (this.draggable && itemConfig.$draggable !== false) {
				node.setAttribute("draggable", "false");

				exports.addListener(node, "dragstart", function (e) {
					exports.html.preventEvent(e);
				}, this);

				function onMouseDown(e) {
					if (exports.isFunction(this.draggable) && !this.draggable(e)) {
						return;
					}
					var ev = e.touches && e.touches[0] || e;
					var offset = node.getBoundingClientRect();
					exports._selectedForDrag = {
						target: this,
						config: itemConfig,
						node: node,
						originalPos: {top: node.style.top, left: node.style.left},
						pos: {x: ev.clientX, y: ev.clientY},
						mouseOffset: {
							left: offset.left - ev.clientX,
							top: offset.top - ev.clientY
						},
						event: e
					};
				}

				if (UIkit.support.touch) exports.addListener(node, "touchstart", onMouseDown, this);
				exports.addListener(node, "mousedown", onMouseDown, this);
			}
		}
	}, exports.stack);


	(function($) {
		$.accordion.isBoolean = true;
		$.tab.description = 'When true, sets additional behaviors for tabs such as responsiveness and onTabMenuClick';
		$._meta = exports.extend({
			selectable: {isBoolean: true},
			itemClass: {isText: true}
		}, $._meta || {});
	}(exports.components.list.prototype.$setters));


	exports.components.tree = exports.def({
		__name__: "tree",
		$defaults: {
			listStyle: "side",
			selectable: false,
			indentWidth: 15,
			dataTransfer: 'id',
			draggable: true,
			orderAfter: function (other) {
				var isParent = this.$parent == other.id;
				var isNestedDeeper = this.$depth < other.$depth;
				var sameParent = this.$parent == other.$parent;
				return (isParent || isNestedDeeper || (sameParent && (
				this.label > other.label && this.$branch == other.$branch || this.$branch < other.$branch)));
			},
			droppable: function (item) {
				return item.$branch;
			}
		},
		__after__: function () {
			this.addListener("onItemClick", this.toggle);
			this.addListener("onItemDragStart", this._dragStart);
			this.addListener("onItemDragOver", this._dragOver);
			this.addListener("onItemDragLeave", this._dragLeave);
			this.addListener("onItemDragEnd", this._dragEnd);
			this.addListener("onItemDrop", this._dragLeave);
		},
		_innerHTML: function (parentNode, config) {
			parentNode.innerHTML = this.template(config);
		},
		_dragStart: function (item, node, e) {
			var $this = this;
			if (item.$branch)
				$this._hideChildren(item);
		},
		_dragEnd: function (item) {
			if (item.$branch && !item.$closed)
				this._showChildren(item);
		},
		_dragOver: function (item) {
			if (this._droppable(item, exports._dragged.config, exports._dragged.node))
				exports.html.addCSS(this.getItemNode(item.id), "uk-active");
		},
		_dragLeave: function (item) {
			exports.html.removeCSS(this.getItemNode(item.id), "uk-active");
		},
		_showChildren: function (item) {
			item.$children.until(function (child, queue) {
				exports.html.removeCSS(this.getItemNode(child.id), "uk-hidden");

				if (item.$branch && !child.$closed) {
					for (var i = 0; i < child.$children.length; i++) {
						queue.push(child.$children[i]);
					}
				}
				return true;
			}, this);
		},
		_hideChildren: function (item) {
			item.$children.until(function (child, queue) {
				exports.html.addCSS(this.getItemNode(child.id), "uk-hidden");

				if (item.$branch) {
					for (var i = 0; i < child.$children.length; i++) {
						queue.push(child.$children[i]);
					}
				}
				return true;
			}, this);
		},
		add: function (obj) {
			/**
			 * Add a child to the tree.
			 * @param item A child of the tree. The parent id of the object should be specified in its $parent property.
			 */
			var parent = null;
			obj.$children = exports.list();
			obj.$branch = !!obj.$branch; // Convert to boolean

			if (!obj.$parent) {
				obj.$depth = 0;
			}
			else {
				parent = this.findOne('id', obj.$parent);
				obj.$depth = parent.$depth + 1;
				parent.$branch = true;
				parent.$children.push(obj);
			}
			var refChild = this.findLast(this.config.orderAfter, parent, obj);
			this.insertAfter(obj, refChild);
		},
		remove: function (obj) {
			/**
			 * Removes a child of the tree. If the child is branch, removes all branch children as well.
			 * @param item A child of the tree.
			 */
			if (obj.$branch) {
				while (obj.$children.length > 0) {
					this.remove(obj.$children[0]);
				}
			}
			exports.LinkedList.remove.call(this, obj);
		},
		template: function (config) {
			return exports.replaceString(
				'<a><i class="uk-icon-{{icon}}" style="margin-left: {{margin}}px"></i><span class="uk-margin-small-left">{{label}}</span></a>',
				{
					icon: config.$branch ?
						(config.$children.length ?
							"folder" :
							"folder-o") :
						"file-o",
					label: config.label,
					margin: config.$depth * this.indentWidth
				})
		},
		open: function (item) {
			/**
			 * Expand a specific branch of the tree.
			 * @param item A child branch of the tree.
			 * @dispatch onOpen, onOpened
			 */
			if (!item.$branch || !item.$closed) return;

			this.dispatch("onOpen", [item.id]);

			item.$closed = false;
			var node = this.getItemNode(item.id);
			node.parentNode.replaceChild(this._createItem(item), node);

			this._showChildren(item);

			this.dispatch("onOpened", [item.id]);

			if (item.$parent)
				this.open(item.$parent);
		},
		close: function (item) {
			/**
			 * Collapse a specific branch of the tree.
			 * @param item A child branch of the tree.
			 * @dispatch onClose, onClosed
			 */
			if (!item.$branch || item.$closed) return;

			this.dispatch("onClose", [item.id]);

			item.$closed = true;
			var node = this.getItemNode(item.id);
			node.parentNode.replaceChild(this._createItem(item), node);

			this._hideChildren(item);

			this.dispatch("onClosed", [item.id]);
		},
		openAll: function () {
			/**
			 * Expand all children of the tree component.
			 * @dispatch onOpen, onOpened
			 */
			this.each(function (obj) {
				if (obj.$branch)
					this.open(obj.id);
			});
		},
		closeAll: function () {
			/**
			 * Collapse all children of the tree component.
			 * @dispatch onClose, onClosed
			 */
			this.each(function (obj) {
				if (obj.$branch)
					this.close(obj.id);
			});
		},
		isBranchOpen: function (item) {
			/**
			 * Checks if a specific branch of the tree is open.
			 * @param item A child branch of the tree.
			 * @returns {boolean}
			 */
			if (item.$branch && !item.$closed)
				return this.isBranchOpen(item.$parent);
			return false;
		},
		toggle: function (item) {
			/**
			 * Toggles a branch child of the tree. If the child is not a branch, ignores it.
			 * @param item A child branch of the tree.
			 * @dispatch onClose, onClosed, onOpen, onOpened
			 */
			if (item.$branch) {
				if (item.$closed)
					this.open(item);
				else
					this.close(item);
			}
		}
	}, exports.components.list);


	(function($) {
		$._meta = exports.extend({
			indentWidth: {isNumber: true},
			dataTransfer: 'The data representation of an item, only for FireFox.',
			draggable: {isBoolean: true},
			orderAfter: 'Low level function that determines ordering of tree items.',
			droppable: 'Function that determines if an item can be dropped upon.'
		}, $._meta || {});
	}(exports.components.tree.prototype.$setters));


	exports.components.table = exports.def({
		__name__: "table",
		$defaults: {
			tagClass: "uk-table",
			htmlTag: "TABLE",
			flex: false,
			margin: "",
			size: "",
			layout: "",
			listStyle: ""
		},
		__init__: function () {
			this.header = this._header = exports.html.createElement("THEAD");
			this.footer = this._footer = exports.html.createElement("TFOOT");
			this.body = this._body = exports.html.createElement("TBODY");

			// Make Chrome wrapping behavior same as firefox
			this._body.style.wordBreak = "break-word";

			this._html.appendChild(this._header);
			this._html.appendChild(this._footer);
			this._html.appendChild(this._body);
		},
		$setters: exports.extend(exports.setCSS({
				tableStyle: {
					hover: "uk-table-hover",
					striped: "uk-table-striped",
					condensed: "uk-table-condensed",
					$multiple: true
				}
			}),
			{
				columns: function (value) {
					exports.assert(exports.isArray(value), "Table 'columns' expected Array, got: " + value);
					value = exports.list(value);
					value.each(function (item) {
						if (exports.isUndefined(item.template) && item.name) {
							item.template = exports.selectors.property(item.name);
						}
					});
					return value;
				},
				header: function (value) {
					if (value) {
						if (exports.isObject(value)) {
							var column = exports.ListMethods.findOne.call(this._config.columns, "name", value.name, true);
							column.header = value.header;
						}
						var columns = this._config.columns;
						var headersHTML = "";
						for (var c, i = 0; i < columns.length; i++) {
							c = columns[i];
							headersHTML += c.align ?
								exports.replaceString("<th style='text-align: {{align}}'>{{text}}</th>", {
									align: c.align,
									text: c.header
								})
								: "<th>" + c.header + "</th>";
						}
						this._header.innerHTML = "<tr>" + headersHTML + "</tr>";
					}
					return value;
				},
				footer: function (value) {
					if (value) {
						if (exports.isObject(value)) {
							var column = exports.ListMethods.findOne.call(this._config.columns, "name", value.name);
							column.footer = value.footer;
						}
						var footers = exports.pluck(this._config.columns, "footer");
						this._footer.innerHTML = "<tr><td>" + footers.join("</td><td>") + "</td></tr>";
					}
					return value;
				},
				caption: function (value) {
					this._caption = exports.html.createElement("CAPTION");
					this._caption.innerHTML = value;
					this._html.appendChild(this._caption);
					return value;
				}
			}
		),
		_innerHTML: function (node, obj) {
			var td, column;
			for (var i = 0; i < this._config.columns.length; i++) {
				column = this._config.columns[i];
				td = exports.html.createElement("TD", {class: column.$css ? exports.stringCSS(column.$css) : ""});

				if (column.align)
					td.style.textAlign = column.align;

				exports.template(column.template, obj, this, td);
				node.appendChild(td);
			}
			this._attachNodeEvents(node, obj);
		},
		_itemHTML: function () {
			return exports.html.createElement("TR");
		},
		_containerHTML: function () {
			return this._body;
		}
	}, exports.components.list);

	(function($) {
		$.columns.description = "A list of schema objects containing data display info. Example: [{name: 'property.nested'}, {template: '<input type=&quot;checkbox&quot;>'}]";
		$.header.description = "A list of header objects containing the header and alignment info. Example: [{header: 'Awesome', align: 'center'}]";
		$.footer.description = "A list of footer objects containing the footer title.";
	}(exports.components.table.prototype.$setters));


	exports.components.select = exports.def({
		__name__: "select",
		$defaults: {
			tagClass: "",
			htmlTag: "SELECT",
			flex: false,
			margin: "",
			size: "",
			layout: "",
			listStyle: ""
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "change", this._onChange, this);
		},
		_onChange: function () {
			this.dispatch("onChange", [this.getValue()]);
		},
		select: function (item) {
			/**
			 * Selects an item in the select component.
			 * @param item Object to select.
			 */
			if (exports.isString(item))
				item = this.getItem(item);
			item.$selected = true;
			this.getFormControl().selectedIndex = this.indexOf(item);
		},
		unselectAll: function () {
			// Do nothing, invalid for select component.
		},
		setValue: function (value) {
			/**
			 * Sets the selected value of the select component.
			 * @param value
			 * @returns {boolean} True if value exist in options, false otherwise.
			 */
			return this.setActive('value', value);
		},
		template: function (itemConfig) {
			return itemConfig.label;
		},
		_innerHTML: function (parentNode, config) {
			parentNode.innerHTML = this.template(config);
		},
		_itemHTML: function (itemConfig) {
			var attrs = {value: itemConfig.value};
			if (itemConfig.selected) {
				attrs.selected = itemConfig.selected;
			}
			return exports.html.createElement("OPTION", attrs);
		}
	}, exports.FormControl, exports.components.list);


	exports.components.form = exports.def({
		__name__: "form",
		$defaults: {
			htmlTag: "FORM",
			tagClass: "uk-form",
			layout: "stacked",
			fieldset: []
		},
		$setters: exports.extend(
			exports.setCSS({
				layout: {
					stacked: "uk-form-stacked",
					horizontal: "uk-form-horizontal"
				},
				formStyle: {
					line: "uk-form-line",
					"": ""
				}
			}),
			{
				fieldset: function (value) {
					this.set('fieldsets', [{
						view: "fieldset",
						layout: this._config.layout,
						data: value
					}]);
				},
				fieldsets: function (value) {
					exports.assert(exports.isArray(value), "The fieldsets property must be an array.", this);

					for (var ui, i = 0; i < value.length; i++) {
						ui = exports.new(value[i]);
						this.$fieldsets.push(ui);
						this.$components.push(ui);
						this._html.appendChild(ui._html);
					}
					return value;
				}
			}),
		__init__: function() {
			this.$fieldsets = UI.list();
		},
		__after__: function () {
			exports.addListener(this.firstResponder(), "submit", this._onSubmit, this);
		},
		_onSubmit: function (e) {
			exports.html.preventEvent(e);
			this.dispatch("onSubmit", [this.getValues(), this]);
			return true;
		},
		clear: function () {
			/**
			 * Clear all values from the form.
			 */
			this.$fieldsets.each(function(fieldset) {
				fieldset.clear();
			});
		},
		enable: function () {
			/**
			 * Enable the fieldset of the form.
			 */
			this.$fieldsets.each(function(fieldset) {
				fieldset.enable();
			});
		},
		disable: function () {
			/**
			 * Disable the fieldset of the form.
			 */
			this.$fieldsets.each(function(fieldset) {
				fieldset.disable();
			});
		},
		getValues: function () {
			/**
			 * Gets the values of the form's components.
			 * @returns {object} Object of key values of the form.
			 */
			var result = {};
			this.$fieldsets.each(function(fieldset) {
				UI.extend(result, fieldset.getValues());
			});
			return result;
		},
		setValues: function (values) {
			/**
			 * Sets the values for the form components. The keys of the object correspond with the 'name' of child components.
			 * @param values Object of names and values.
			 */
			this.$fieldsets.each(function(fieldset) {
				fieldset.setValues(values);
			});
		},
		getFieldset: function(index) {
			/**
			 * Retrieves the fieldset component of the form.
			 * @param index The index of the fieldset in the form, default 0.
			 * @returns {UI.components.fieldset}
			 */
			return this.$fieldsets[index || 0];
		}
	}, exports.components.element);


	exports.components.fieldset = exports.def({
		__name__: "fieldset",
		$defaults: {
			htmlTag: "FIELDSET"
		},
		$setters: exports.setCSS({
			layout: {
				stacked: "uk-form-stacked",
				horizontal: "uk-form-horizontal"
			}
		}),
		_itemHTML: function (itemConfig) {
			if (itemConfig.title) {
				return exports.html.createElement("LEGEND",
					{class: itemConfig.$itemCSS ? exports.stringCSS(itemConfig.$itemCSS) : ""});
			}
			else {
				return exports.html.createElement("DIV",
					{class: itemConfig.$itemCSS ? exports.stringCSS(itemConfig.$itemCSS) : "uk-form-row"});
			}
		},
		_innerHTML: function (parentNode, config) {
			if (config.title) {
				parentNode.innerHTML = config.label;
			}
			else {
				var ui = exports.new(config);
				this.$components.push(ui);

				if (config.formLabel) {
					ui.label = exports.html.createElement("LABEL", {class: "uk-form-label", for: config.id});
					ui.label.innerHTML = config.formLabel;
					if (config.inline) exports.html.addCSS(ui.label, "uk-display-inline");
					parentNode.appendChild(ui.label);
				}

				var controlContainer = parentNode;
				if (!config.inline) {
					controlContainer = exports.html.createElement("DIV", {class: "uk-form-controls"});
					exports.html.addCSS(controlContainer, config.$css);
					parentNode.appendChild(controlContainer);
				}

				controlContainer.appendChild(ui._html);
			}
		},
		clear: function () {
			/**
			 * Clear all values from the fieldset.
			 */
			this.each(function (item) {
				if (item.name) {
					$$(item.id).reset();
				}
			});
		},
		enable: function () {
			/**
			 * Enables the fieldset.
			 */
			this.each(function (item) {
				if (item.name || item.view == "button") {
					$$(item.id).enable();
				}
			});
		},
		disable: function () {
			/**
			 * Disables the fieldset. (Works by disabling each child.)
			 */
			this.each(function (item) {
				if (item.name || item.view == "button") {
					$$(item.id).disable();
				}
			});
		},
		getValues: function () {
			/**
			 * Gets the values of the form's components.
			 * @returns {object} Object of key values of the fieldset.
			 */
			var results = {};

			var unprocessed = this.$components.copy();

			// Extract all children with `name` attributes, including nested flexgrid children.
			var ui;
			while (unprocessed.length > 0) {
				ui = unprocessed.pop();
				if (ui && ui.config.name) {
					results[ui.config.name] = ui.getValue();
				}
				else if (ui.$components) {
					unprocessed = unprocessed.concat(ui.$components);
				}
			}

			return results;
		},
		setValues: function (config) {
			/**
			 * Sets the values for the form components. The keys of the object correspond with the 'name' of child components.
			 * @param values Object of names and values.
			 */
			exports.assert(config, "fieldset setValues has recieved an invalid value.");

			var unprocessed = this.$components.copy();

			var ui;
			while (unprocessed.length > 0) {
				ui = unprocessed.pop();
				if (ui && exports.isDefined(config[ui.config.name])) {
					ui.setValue(config[ui.config.name]);
				}
				else if (ui.$components) {
					unprocessed = unprocessed.concat(ui.$components);
				}
			}
		}
	}, exports.stack);


	if (window.UIkit) {
		exports.message = UIkit.notify;
		exports.confirm = UIkit.modal.confirm;
		exports.prompt = UIkit.modal.prompt;
		exports.alert = UIkit.modal.alert;
	}
	
	return exports;
})({debug: true}, window);
