window.UION = window.UI = (function (exports, window, UIkit) {
  var $definitions = {},
    $listeners = {},
    $windowListeners = {
      mousemove: [windowOnMouseMove],
      mouseup: [windowOnMouseUp],
      touchend: [windowOnMouseUp],
      touchmove: [windowOnMouseMove],
      load: [windowOnLoad],
      resize: []
    },
    $globalListenerIds = {},
    $components = {};

  extend(exports, {
    $ready: false,
    $dragThreshold: 10,
    $globalListenerIds: $globalListenerIds,
    $windowListeners: $windowListeners,

    listeners: $listeners,
    definitions: $definitions,
    components: $components,

    $$: $$,

    message: UIkit.notify,
    confirm: UIkit.modal.confirm,
    prompt: UIkit.modal.prompt,
    alert: UIkit.modal.alert,

    isArray: isArray,
    isString: isString,
    isObject: isObject,
    isDefined: isDefined,
    isUndefined: isUndefined,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isFunction: isFunction,

    forIn: forIn,
    forEach: forEach,
    forInLoop: forInLoop,

    assert: assert,
    assertPropertyValidator: assertPropertyValidator,
    fail: fail,
    log: log,

    classString: classString,
    classSetters: classSetters,
    prefixClassOptions: prefixClassOptions,

    extend: extend,
    defaults: defaults,
    pluck: pluck,
    bind: bind,
    echo: echo,
    delay: delay,
    interpolate: interpolate,
    template: template,

    createElement: createElement,
    preventEvent: preventEvent,
    setAttributes: setAttributes,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,

    def: def,
    uid: uid,
    uidForComponent: uidForComponent,

    addListener: addListener,
    removeListener: removeListener
  });
  
  function isArray(obj) {
    return Array.isArray ? Array.isArray(obj) : (Object.prototype.toString.call(obj) == '[object Array]');
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) == '[object String]';
  }

  function isObject(obj) {
    return Object.prototype.toString.call(obj) == '[object Object]';
  }

  function isDefined(obj) {
    return obj !== undefined;
  }

  function isUndefined(obj) {
    return obj === undefined;
  }

  function isFalsy(obj) {
    return !obj;
  }

  function isNumber(obj) {
    return Object.prototype.toString.call(obj) == '[object Number]';
  }

  function isBoolean(obj) {
    return Object.prototype.toString.call(obj) == '[object Boolean]';
  }

  function isFunction(obj) {
    return Object.prototype.toString.call(obj) == '[object Function]';
  }

  function assert(cond, msg, details) {
    if (!cond) {
      fail(msg, details);
    }
  }

  function assertPropertyValidator(value, name, validator) {
    assert(validator(value),
      name + ' failed ' + validator.toString() +
      ' validator, got ' + value + ' instead');
  }

  function assertBasesCheck(baseName, defName, bases, isLast) {
    if (isLast)
      assert(bases.indexOf(baseName) == bases.length - 1,
        interpolate("{{base}} should be the last extension in {{name}}",
          {base: baseName, name: defName}));
    else if (defName == baseName)
      assert(bases.indexOf(baseName) != -1, defName + " is an abstract class.");
    else
      assert(bases.indexOf(baseName) != -1,
        interpolate("{{def}} must extend {{base}}.", {def: defName, base: baseName}));
  }

  function fail(message, details) {
    log("error", message);
    if (details) log("debug: ", details);
    if (exports.debug !== false) {
      throw new Error(message);
    }
  }

  function log(type, message, explanation) {
    if (message === undefined) {
      message = type;
      type = "log";
    }
    var console = window.console;
    if (console) {
      if (console[type]) console[type](message || "");
      else console.log(type + ": " + message);
      if (explanation) console.log(explanation);
    }
  }

  function interpolate(str, obj) {
    var regex = /\{\{[^\s}]*}}/gi;
    return str.replace(regex, function (match) {
      return exports.selectors.property(match.substring(2, match.length - 2))(obj);
    });
  }

  function extend(target, src) {
    forInLoop(function (key, value) {
      if (isDefined(value)) target[key] = value;
    }, src);
    return target;
  }

  function defaults(target, defaults) {
    forInLoop(function (key, value) {
      if (isUndefined(target[key])) target[key] = value;
    }, defaults);
    return target;
  }

  function pluck(array, property) {
    return forEach(exports.selectors.property(property), array);
  }

  function def(config) {
    var bases = Array.prototype.slice.call(arguments, 1);
    var cls = buildDef(config, bases);
    $definitions[config.__name__] = cls;
    return cls;
  }

  function classString(value) {
    if (isArray(value)) {
      var noDups = [];
      for (var i = 0; i < value.length; i++)
        if (noDups.indexOf(value[i]) == -1)
          noDups.push(value[i]);
      return noDups.join(' ');
    }
    else if (isString(value)) {
      return value;
    }
    else return String(value);
  }

  function template(template, config, thisArg, parentNode) {
    if (isFunction(template)) {
      template = template.call(thisArg, config);
    }
    if (isString(template)) {
      parentNode.innerHTML = interpolate(template, config);
    }
    else if (isObject(template)) {
      if (!template.$ui) {
        template.$ui = exports.new(template);
        thisArg.$components.push(template.$ui);
        parentNode.appendChild(template.$ui.el);
      }
    }
    else {
      fail('Unrecognized template!', config);
    }
  }

  function buildDef(config, bases) {
    assertPropertyValidator(config.__name__, '__name__', isDefined);

    var compiled = extend({}, config);
    var init = config.__init__ ? [config.__init__] : [];
    var after = config.__after__ ? [config.__after__] : [];
    var $defaults = config.$defaults || {};
    var $setters = config.$setters || {};
    var $events = config.$events || {};

    var baseNames = [];
    for (var j = 0; j < bases.length; j++) {
      assertPropertyValidator(bases[j], config.__name__ + ' base[' + j + ']', isDefined);

      if (bases[j].__name__) {
        baseNames.push(bases[j].__name__);
      }
      else if (isFunction(bases[j])) {
        baseNames.push(bases[j].prototype.__name__);
        baseNames = baseNames.concat(bases[j].prototype.__base__);
      }
    }

    for (var base, i = 0; i < bases.length; i++) {
      base = bases[i];
      if (isFunction(base)) {
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
        defaults($defaults, base.$defaults);
      }
      if (base.$events) {
        defaults($events, base.$events);
      }
      if (base.$setters) {
        defaults($setters, base.$setters);
      }
      defaults(compiled, base);
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
    compiled.$events = $events;
    compiled.$setters = $setters;

    function Constructor(config) {
      defaults(config, this.$defaults);
      defaults(this, config);
      this.template = config.template || this.template;
      if (this.__init__) this.__init__(config);
      if (this.__after__) this.__after__(config);
      if (this.dispatch) this.dispatch("onInitialized");
    }
    Constructor.prototype = compiled;

    return Constructor;
  }

  function echo(input) {
    return function () {
      return input;
    }
  }

  function bind(func, object) {
    return function () {
      return func.apply(object, arguments);
    };
  }

  function delay(func, obj, params, delay) {
    return window.setTimeout(function () {
      func.apply(obj, params);
    }, delay || 1);
  }

  function returnTrue() {
    return true;
  }

  function uid() {
    if (!this._counter) this._counter = 0;
    this._counter++;
    return this._counter;
  }

  function addListener(element, event, handler, thisArg) {
    assertPropertyValidator(element, 'element', isDefined);
    assertPropertyValidator(handler, 'handler', isDefined);

    var id = uid();

    if (thisArg)
      handler = bind(handler, thisArg);

    $listeners[id] = [element, event, handler];	//store event info, for detaching

    // Not officially supporting, or going out of the way to support IE10-
    element.addEventListener(event, handler);

    return id;
  }

  function removeListener(id) {
    if (!id) return;
    assertPropertyValidator($listeners[id], 'Event ' + id, isDefined);

    var e = $listeners[id];
    e[0].removeEventListener(e[1], e[2]);

    delete $listeners[id];
  }

  exports.Dispatcher = {
    __name__: "Dispatcher",
    __init__: function (config) {
      this._listenersByEvent = {};
      this._listeners = {};

      var listeners = config.on;
      if (listeners) forInLoop(this.addListener, listeners, this);
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
      assertPropertyValidator(func, "listener for " + type, isFunction);

      id = id || uid();

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


  exports.Responder = {
    __name__: "Responder",
    __check__: function (bases) {
      assertBasesCheck('Dispatcher', 'Responder', bases);
    },
    $events: {},
    __after__: function (config) {
      var $this = this;
      var on = config.on || {};
      forIn(function (eventName, listenerConfig) {
        if (!listenerConfig.lazy || on[listenerConfig.dispatch]) {
          addListener($this.responder(), eventName, function (e) {
            var retVal;
            if (isFunction(listenerConfig.callback)) {
              retVal = listenerConfig.callback.call($this, $this.config, $this.el, e);
            }
            if (!listenerConfig.defaultEvent) preventEvent(e);
            $this.dispatch(listenerConfig.dispatch, [$this.config, $this.el, e]);
            return retVal;
          });
        }
      }, defaults(config.$events || {}, $this.$events));
    },
    responder: function () {
      /**
       * The responder to events.
       * This element will get bound to events such as blur/focus/change etc.
       * @returns {Element}
       */
      return this.el;
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
      fail(interpolate("{{key}}: {{value}} cannot be removed in {{array}}",
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
        fail(interpolate("{{key}}: {{value}} not found in {{array}}",
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
          fail("Infinite loop detected.");
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
    return extend((array || []), exports.ListMethods);
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


  exports.classOptions = {
    flex: {
      true: "uk-flex",
      false: "",
      inline: "uk-flex-inline"
    },
    selectable: {
      true: "",
      false: "unselectable"
    },
    order: prefixClassOptions({
      first: "first",
      last: "last",
      "first-small": "",
      "last-small": "",
      "first-medium": "",
      "last-medium": "",
      "first-large": "",
      "last-large": "",
      "first-xlarge": "",
      "last-xlarge": "",
      "": ""
    }, 'uk-flex-order-', true),
    wrap: prefixClassOptions({
      break: "",
      nowrap: "",
      truncate: "",
      "": ""
    }, 'uk-text-', true),
    padding: {
      "": "",
      none: "uk-padding-remove"
    },
    size: prefixClassOptions({
      "": "",
      none: "none",
      auto: "auto",
      flex: "1"
    }, 'uk-flex-item-'),
    flexAlign: prefixClassOptions({
      center: "",
      right: "",
      top: "",
      middle: "",
      bottom: "",
      "": ""
    }, 'uk-flex-', true),
    display: prefixClassOptions({
      block: "",
      inline: "",
      "inline-block": "",
      "": ""
    }, 'uk-display-', true),
    halign: prefixClassOptions({
      center: "",
      left: "",
      right: "",
      "medium-left": "",
      "medium-right": "",
      "": ""
    }, 'uk-align-', true),
    valign: prefixClassOptions({
      middle: "align-middle",
      parent: "align",
      bottom: "align-bottom",
      "": ""
    }, 'uk-vertical-'),
    position: prefixClassOptions({
      "top": "",
      "top-left": "",
      "top-right": "",
      "bottom": "",
      "bottom-right": "",
      "bottom-left": "",
      "cover": "",
      "relative": "",
      "absolute": "",
      "z-index": "",
      "": ""
    }, 'uk-position-', true),
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
      large: "uk-hidden-large"
    },
    margin: prefixClassOptions({
      "none": "remove",
      "top-rm": "top-remove",
      "bottom-rm": "bottom-remove",
      "": "",
      "all-sm": ["small-left", "small-right", "small-top", "small-bottom"],
      "all": ["left", "right", "top", "bottom"],
      "all-lg": ["large-left", "large-right", "large-top", "large-bottom"],
      "lg": "large",
      "sm": "small",
      "top": "top",
      "top-lg": "large-top",
      "top-sm": "small-top",
      "bottom": "bottom",
      "bottom-lg": "large-bottom",
      "bottom-sm": "small-bottom",
      "left": "left",
      "left-lg": "large-left",
      "left-sm": "small-left",
      "right": "right",
      "right-lg": "large-right",
      "right-sm": "small-right"
    }, 'uk-margin-'),
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
      "": ""
    },
    device: prefixClassOptions({
      touch: "notouch",
      notouch: "touch",
      "": ""
    }, 'uk-hidden-'),
    textAlign: prefixClassOptions({
      middle: "",
      top: "",
      bottom: "",
      "": ""
    }, 'uk-text-', true)
  };

  function createElement(name, attributes, html) {
    attributes = attributes || {};
    var element = document.createElement(name);

    setAttributes(element, attributes);
    
    if (attributes.style)
      element.style.cssText = attributes.style;
    if (attributes.class)
      element.className = attributes["class"];
    if (html)
      element.innerHTML = html;
    return element;
  }

  function setAttributes(element, attributes) {
    forInLoop(element.setAttribute, attributes, element);
  }

  function preventEvent(e) {
    if (e && e.preventDefault) e.preventDefault();
    e.defaultPrevented = true;
    e.cancelBubble = true;
  }

  function addClass(node, name) {
    var classList = classString(name).split(' ');
    for (var cls, i = 0; i < classList.length; i++) {
      cls = classList[i];
      if (cls) node.classList.add(cls);
    }
  }

  function hasClass(node, name) {
    return node.classList.contains(name);
  }

  function removeClass(node, name) {
    if (name && name.length > 0)
      node.classList.remove(name);
  }

  exports.ready = function (fn) {
    if (exports.$ready) fn.call();
    else $windowListeners.load.push(fn);
  };

  function buildWindowListener(listeners) {
    assertPropertyValidator(listeners, 'listeners', isArray);
    function executeAllListeners(e) {
      for (var i=0; i<listeners.length; i++) {
        listeners[i].call(window, e);
      }
    }
    return executeAllListeners;
  }

  $globalListenerIds.mouseup = addListener(window, "mouseup", buildWindowListener($windowListeners.mouseup));
  $globalListenerIds.mousemove = addListener(window, "mousemove", buildWindowListener($windowListeners.mousemove));
  $globalListenerIds.resize = addListener(window, "resize", buildWindowListener($windowListeners.resize));

  if (document.readyState == "complete") {
    windowOnLoad();
  } else {
    $globalListenerIds.load = addListener(window, "load", buildWindowListener($windowListeners.load));
  }

  if (UIkit.support.touch) {
    $globalListenerIds.touchend = addListener(window, "touchend", buildWindowListener($windowListeners.touchend));
    $globalListenerIds.touchmove = addListener(window, "touchmove", buildWindowListener($windowListeners.touchmove));
  }

  function windowOnMouseUp(e) {
    var dragged = exports._dragged;
    if (dragged) {
      var nodeStyle = dragged.node.style;
      var display = nodeStyle.display;

      nodeStyle.display = 'none';

      var src = e.changedTouches ? e.changedTouches[0] : e;
      var dropTarget = findDroppableParent(document.elementFromPoint(src.clientX, src.clientY));
      if (dropTarget && dropTarget.master.config.droppable(dropTarget.config, dragged.config, dragged.node)) {
        // Must be before dragEnd to prevent position of elements shifting in tree
        // Shifted position will shift the drop target
        dropTarget.master.dispatch("onItemDrop", [dropTarget.config, dragged.config, dropTarget, e]);
      }

      dragged.target.dispatch("onItemDragEnd", [dragged.config, dragged.node, e]);

      removeClass(dragged.node, 'uk-active-drag');

      nodeStyle.top = dragged.originalPos.top;
      nodeStyle.left = dragged.originalPos.left;
      nodeStyle.display = display;
      exports._dragged = null;
    }
    exports._selectedForDrag = null;
  }

  function windowOnMouseMove(e) {
    var selectedForDrag = exports._selectedForDrag;
    var src = e.touches ? e.touches[0] : e;
    if (selectedForDrag) {
      if (Math.abs(src.clientX - selectedForDrag.pos.x) > exports.$dragThreshold ||
        Math.abs(src.clientY - selectedForDrag.pos.y) > exports.$dragThreshold) {
        // Begin drag event
        exports._dragged = selectedForDrag;
        exports._selectedForDrag = null;
        addClass(selectedForDrag.node, 'uk-active-drag');

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
      if (dropTarget && dropTarget.master.config.droppable(dropTarget.config, dragged.config, dragged.node)) {
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
  }

  function windowOnLoad() {
    exports.$ready = true;
    setAttributes(document.body, {"data-uk-observe": ""});
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


  exports.PropertySetter = {
    __name__: "PropertySetter",
    __check__: function (bases) {
      assertBasesCheck('PropertySetter', this.__name__, bases, true);
    },
    __init__: function (config) {
      this.config = config;
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
        assertPropertyValidator(this.$setters[name], 'Property setter for ' + name, isFunction);
        this.$setters[name].call(this, value);
      }
      this.config[name] = value;
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

      var htmlStyle = this.el.style;
      htmlStyle.top = (origin.top - bodyPos.top + variants[position].top) + "px";
      htmlStyle.left = (origin.left + variants[position].left) + "px";
      htmlStyle.position = "absolute";
    },
    getBoundingClientRect: function () {
      /**
       * Gets the bounding rectangle of the element. Needs to be added first since this delegates the call to element.getBoundingClientRect.
       * @returns {*|ClientRect}
       */
      return this.el.getBoundingClientRect();
    },
    position: function (pos) {
      /**
       * Sets the position of the element.
       * @param pos Position information object.
       * @example position({top: 0, left: 0})
       */
      var htmlStyle = this.el.style;
      htmlStyle.top = (pos.top || 0) + "px";
      htmlStyle.left = (pos.left || 0) + "px";
      htmlStyle.position = "absolute";
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
      var htmlStyle = this.el.style;

      rect.left = htmlStyle.left || rect.left;
      rect.top = htmlStyle.top || rect.top;

      var hiddenLeft = rect.left < boundaryLeft + paddingLeft;
      var hiddenRight = rect.left + rect.width > boundaryRight - paddingRight;
      var hiddenTop = rect.top < boundaryTop + paddingTop;
      var hiddenBottom = rect.top + rect.height > boundaryBottom - paddingBottom;

      var offsetTop = offset.top || 0;
      var offsetBottom = offset.bottom || 0;
      var offsetLeft = offset.left || 0;
      var offsetRight = offset.right || 0;

      if (hiddenLeft) {
        htmlStyle.left = (pivotLeft + offsetLeft) + "px";
      }
      else if (hiddenRight) {
        htmlStyle.left = (pivotRight - rect.width + offsetRight) + "px";
      }

      if (hiddenTop) {
        htmlStyle.top = (pivotTop + offsetTop - bodyPos.top) + "px";
      }
      else if (hiddenBottom) {
        htmlStyle.top = (pivotBottom - rect.height + offsetBottom - bodyPos.top) + "px";
      }
    }
  };


  exports.new = function (config, parent) {
    var node = makeView(config);
    if (parent)
      parent.appendChild(node.element);
    return node;

    function makeView(config) {
      if (config.view) {
        var view = config.view;
        assertPropertyValidator($definitions[view], 'definition ' + view, isDefined);
        return new $definitions[view](config);
      }
      else if (config.cells)
        return new $definitions.flexgrid(config);
      else
        return new $definitions.element(config);
    }
  };

  function uidForComponent(name) {
    var names = this._names || {};
    names[name] = names[name] || 0;
    names[name]++;
    this._names = names;
    return '' + name + names[name];
  }

  function $$(id) {
    if (!id)
      return null;
    else if ($components[id])
      return $components[id];
  }

  function forInLoop(func, obj, thisArg) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (func.call(thisArg, i, obj[i]) === false) {
          break;
        }
      }
    }
  }

  function forIn(func, obj, thisArg) {
    var result = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = func.call(thisArg, key, obj[key]);
      }
    }
    return result;
  }

  function forEach(func, array, thisArg) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      result[i] = func.call(thisArg, array[i], i);
    }
    return result;
  }

  function prefixClassOptions(obj, prefix, mirrorKey) {
    return forIn(function (key, value) {
      if (isArray(value)) {
        return forEach(function (string) {
          return !string.length ? string : prefix + string;
        }, value);
      } else {
        value = mirrorKey ? key : value;
        return !value.length ? value : prefix + value;
      }
    }, obj);
  }

  function classSetters(classOptions) {
    return forIn(function (property, options) {
      var setter = function (value) {
        var oldValue = this.config[property];
        if (options[oldValue])
          removeClass(this.el, options[oldValue]);

        var values = classString(value).split(" ");

        for (var v, i = 0; i < values.length; i++) {
          v = values[i];

          assertPropertyValidator(options[v], 'value ' + v + ' for property ' + property, isDefined);

          var classes = options[v];

          if (isArray(classes))
            for (var c = 0; c < classes.length; c++)
              addClass(this.el, classes[c]);
          else
            addClass(this.el, classes);
        }
      };
      setter.options = options;
      return setter;
    }, classOptions);
  }


  exports.CommonCSS = {
    __name__: "CommonCSS",
    __check__: function (bases) {
      assertBasesCheck('CommonCSS', 'CommonCSS', bases);
      assertBasesCheck('PropertySetter', 'CommonCSS', bases);
    },
    $setters: classSetters(exports.classOptions)
  };

  //[[?env.debug]]
  (function ($setters) {
    $setters.order.multipleAllowed = true;
    $setters.screen.multipleAllowed = true;
    $setters.margin.multipleAllowed = true;
    $setters.position.multipleAllowed = true;
    $setters.hidden.multipleAllowed = true;
  }(exports.CommonCSS.$setters));
  //[[?]]


  exports.CommonEvents = {
    __name__: "CommonEvents",
    __check__: function (bases) {
      assertBasesCheck('Responder', 'CommonEvents', bases);
    },
    $events: {
      focus: {lazy: true, dispatch: "onFocus", defaultEvent: true},
      blur: {lazy: true, dispatch: "onBlur", defaultEvent: true}
    },
    __after__: function (config) {
      var $this = this;
      if (config.on) {
        if (config.on.onResize) {
          $windowListeners.resize.push(function (e) {
            $this.dispatch("onResize", [e]);
          });
        }
        if (config.on.onDebounceResize) {
          $windowListeners.resize.push(UIkit.Utils.debounce(function (e) {
            $this.dispatch("onDebounceResize", [e]);
          }, 1000));
        }
      }
    }
  };


  $definitions.element = def({
    __name__: "element",
    $defaults: {
      tooltipPos: 'bottom',
      dropdownEvent: "onClick",
      dropdownPos: 'bottom-center',
      dropdownId: undefined,
      dropdownMarginX: 5,
      dropdownMarginY: 5,
      uploadOptions: {}
    },
    $setters: {
      disabled: function (value) {
        if (value)
          this.disable();
        else
          this.enable();
      },
      css: function (value) {
        addClass(this.el, classString(value));
      },
      tooltip: function (value) {
        var self = this;

        if (value)
          setAttributes(self.el, {
            "title": value,
            "data-uk-tooltip": interpolate("{pos: '{{pos}}'}", {pos: self.config.tooltipPos})
          });
        else
          removeClass(self.el, "data-uk-tooltip");
      },
      dropdown: function (value) {
        var self = this;
        var config = self.config;

        var dropdown = {
          id: config.dropdownId,
          view: "dropdown",
          pos: config.dropdownPos,
          dropdown: value,
          dropdownCSS: config.dropdownCSS
        };

        var ui = exports.new(dropdown, document.body);

        config.on = config.on || {};
        self.addListener(config.dropdownEvent, function (config, node) {
          ui.open(config);
          ui.positionNextTo(node, dropdown.pos, config.dropdownMarginX, config.dropdownMarginY);
          ui.moveWithinBoundary();
        });
        self.dropdownPopup = ui;
      },
      inline: function (value) {
        if (value)
          addClass(this.el, "uk-display-inline");
      },
      uploader: function (value) {
        if (value) {
          // Must allow default events to open uploader
          // Add css to mock a file input
          addClass(this.el, "uk-form-file");
          this.el.appendChild(this._uploadFileHTML());
        }
      }
    },
    __init__: function (config) {
      var self = this;
      if (!config.id) config.id = uidForComponent(self.__name__);
      var element = document.getElementById(config.id);

      assertPropertyValidator(element, 'node ' + config.id + ' exist check', isFalsy);

      $components[config.id] = self;

      self.$components = exports.list();
      self.element = self.el = createElement(config.htmlTag || "DIV", {id: config.id});

      if (isString(config.tagClass))
        setAttributes(self.el, {class: config.tagClass});

      extend(self.el.style, config.style || {});

      self.render();
    },
    render: function () {
      /**
       * Force a rerender of the element, which runs the template function.
       */
      template(this.template, this.config, this, this.el);
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
    isVisible: function () {
      /**
       * Checks if the element is hidden. (Not to be confused with conceal/reveal.)
       */
      return !hasClass(this.el, "uk-hidden");
    },
    show: function () {
      /**
       * Shows the element.
       */
      removeClass(this.el, "uk-hidden");
    },
    hide: function () {
      /**
       * Hides the element.
       */
      addClass(this.el, "uk-hidden");
    },
    conceal: function () {
      /**
       * Makes the element invisible, which doesn't affect the layout.
       */
      addClass(this.el, "uk-invisible");
    },
    reveal: function () {
      /**
       * Makes the element visible again.
       */
      removeClass(this.el, "uk-invisible");
    },
    isEnabled: function () {
      /**
       * Checks if the element is enabled.
       * @returns {boolean}
       */
      return !this.el.getAttribute('disabled');
    },
    disable: function () {
      /**
       * Disables the element.
       */
      setAttributes(this.el, {disabled: ""});
    },
    enable: function () {
      /**
       * Enables the element.
       */
      this.el.removeAttribute('disabled');
    },
    getComponent: function (key, value) {
      /**
       * Gets a child component from a key value match.
       * @param key The key to look up.
       * @param value The compared value.
       * @returns {UI.definitions.element}
       */
      return this.$components.findOne(key, value);
    },
    _uploadFileHTML: function () {
      var config = this.config;
      var self = this;

      var settings = extend({
        type: 'json',
        before: function (settings, files) {
          self.dispatch("onFilesAdded", [settings, files]);
          return false;
        }
      }, config.uploadOptions);

      var attrs = settings.filelimit > 1 ? {type: "file", multiple: "multiple"} : {type: "file"};
      var input = createElement("INPUT", attrs);
      UIkit.uploadSelect(input, settings);

      return input;
    }
  }, exports.Dispatcher, exports.Responder, exports.CommonEvents, exports.CommonCSS, exports.PropertySetter);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.disabled.isBoolean = true;
    $setters.tooltip.isText = true;
    $setters.css.isText = true;
    $setters.dropdown.description = "Configuration object to show in a context menu.";
    $setters.inline.isBoolean = true;
    $setters.uploader.isBoolean = true;

    $setters._meta = extend({
      dropdownEvent: "The event type to trigger a dropdown. Examples: onClick (default), onContext.",
      dropdownPos: {options: ['bottom-center', 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'left-top', 'left-bottom', 'left-center', 'right-top', 'right-bottom', 'right-center']},
      dropdownMarginX: "The left margin of the dropdown from anchor component.",
      dropdownMarginY: "The top margin of the dropdown from anchor component.",
      template: "A string or a function that returns a HTML template string for the component. For examples, see source code on Github.",
      style: "A object containing properties to feed into the style attribute of the element"
    }, $setters._meta || {});
  }($definitions.element.prototype.$setters));
  //[[?]]

  $definitions.flexgrid = def({
    __name__: "flexgrid",
    $defaults: {
      layout: "row",
      flex: true,
      size: "flex",
      singleView: false
    },
    $setters: extend(classSetters({
      layout: prefixClassOptions({
        "": "",
        column: "",
        row: "",
        "row-reverse": "",
        "column-reverse": ""
      }, 'uk-flex-', true),
      spacing: prefixClassOptions({
        between: "",
        around: ""
      }, 'uk-flex-space-', true)
    }), {
      cells: function (value) {
        assertPropertyValidator(value, 'cells', isArray);

        var self = this;

        for (var config, i = 0; i < value.length; i++) {
          config = value[i];
          self.addChild(config);
        }

        if (self.config.singleView && self.config.defaultView)
          self.setChild(self.config.defaultView);
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
      var self = this;
      self.$components.splice(index, 0, ui);

      if (!self.config.singleView) {
        if (index > 0)
          self.el.insertAfter(ui.el, self.$components[index - 1].el);
        else if (index + 1 < self.$components.length)
          self.el.insertBefore(ui.el, self.$components[index + 1].el);
        else
          self.el.appendChild(ui.el)
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

      if (!this.config.singleView)
        this.el.appendChild(ui.el);

      return ui;
    },
    removeChild: function (id) {
      /**
       * Removes a child by its id.
       * @param id Id of the child to remove.
       */
      var self = this;
      if (id.element) {
        self.el.removeChild(id.el);
        self.$components.remove(id);
      }
      else if (isString(id)) {
        self.el.removeChild(self.getChild(id).el);
        self.$components.removeWhere('id', id);
      }
      else {
        fail("flexgrid: unknown argument id " + id + " received in removeChild().");
      }
    },
    getChild: function (id) {
      /**
       * Get a child of the flexgrid by id.
       * @param id The string id of the component.
       * @returns {UI.definitions.element}
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
      var self = this;
      self._setVisible('id', [id]);
      var newChild = self.getChild(id);
      self.dispatch("onChildChange", [self._activeChild, newChild]);
      self._activeChild = newChild;
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
      this._setVisible('batch', isArray(name) ? name : [name], true);
      this.$batch = name;
    },
    _setVisible: function (key, value, rerender) {
      this.$components.each(function (item) {
        if (value.indexOf(item.config[key]) != -1) {
          if (item.el.parentNode != this.el || rerender) {
            this.el.appendChild(item.el);
          }
        }
        else if (item.el.parentNode) {
          this.el.removeChild(item.el);
        }
      }, this);
    }
  }, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.cells.description = "A list of configuration objects.";
  }($definitions.flexgrid.prototype.$setters));
  //[[?]]


  exports.FormControl = {
    __name__: 'FormControl',
    $setters: extend(
      classSetters({
        size: prefixClassOptions({
          large: "",
          small: "",
          "": ""
        }, 'uk-form-', true)
      }),
      {
        formClass: function (value) {
          this.setFormClass(value);
        },
        help: function (value) {
          var self = this;
          if (self.help && self.help.parentNode) {
            self.help.parentNode.removeChild(self.help);
          }
          if (value) {
            if (self.config.inline) {
              self.help = createElement("SPAN", {class: "uk-form-help-inline"});
            }
            else {
              self.help = createElement("P", {class: "uk-form-help-block"});
            }
            self.help.innerHTML = value;
            self.getFormControl().parentNode.appendChild(self.help);
          }
        },
        type: function (value) {
          setAttributes(this.getFormControl(), {type: value});
          addClass(this.getFormControl(), "uk-vertical-align-middle");
        },
        value: function (value) {
          if (value !== undefined)
            this.setValue(value);
        }
      }
    ),
    responder: function () {
      /**
       * The responder to events.
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
      return this.el;
    },
    clearFormClass: function () {
      /**
       * Clear any of display class applied to the form control.
       */
      var formControl = this.getFormControl();
      removeClass(formControl, "uk-form-danger");
      removeClass(formControl, "uk-form-success");

      var helpControl = this.help;
      if (helpControl) {
        removeClass(helpControl, "uk-text-danger");
        removeClass(helpControl, "uk-text-success");
      }
    },
    setFormClass: function (value) {
      /**
       * Set the display class for the form control.
       * @param value One of ['success', 'danger']
       */
      var formControl = this.getFormControl();
      var helpControl = this.help;

      this.clearFormClass();

      if (value == 'success') {
        addClass(formControl, "uk-form-success");
        if (helpControl) addClass(helpControl, "uk-text-success");
      }
      else if (value == 'danger') {
        addClass(formControl, "uk-form-danger");
        if (helpControl) addClass(helpControl, "uk-text-danger");
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
      setAttributes(this.getFormControl(), {disabled: 'disabled'});
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

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.help.isText = true;
    $setters.formClass.options = {"": "", "danger": "danger", "success": "success"};
    $setters.type.description = "Set the type of the HTML input element.";
    $setters.value.description = "Initial value of the HTML input element.";
  }(exports.FormControl.$setters));
  //[[?]]

  
  exports.ClickEvents = {
    __name__: 'ClickEvents',
    $events: {
      click: {dispatch: "onClick", defaultEvent: true},
      contextmenu: {lazy: true, dispatch: "onContext"},
      mousedown: {lazy: true, dispatch: "onMouseDown"},
      mouseup: {lazy: true, dispatch: "onMouseUp", callback: function (config, el, e) {
        windowOnMouseUp(e);
      }}
    },
    $setters: {
      target: function (value) {
        setAttributes(this.el, {target: value});
      },
      href: function (value) {
        setAttributes(this.el, {href: value});
      }
    },
    __check__: function (bases) {
      assertBasesCheck('Responder', 'ClickEvents', bases);
    }
  };


  $definitions.modal = def({
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
      size: "",
      layout: "",
      dialogClass: "",
      headerClass: "",
      footerClass: ""
    },
    __init__: function (config) {
      var self = this;
      self.header = self._header = createElement("DIV", {class: "uk-modal-header"});
      self.footer = self._footer = createElement("DIV", {class: "uk-modal-footer"});
      self.body = self._body = createElement("DIV", {class: "uk-modal-dialog"});

      if (config.headerClass) addClass(self._header, config.headerClass);
      if (config.dialogClass) addClass(self._body, config.dialogClass);
      if (config.footerClass) addClass(self._footer, config.footerClass);

      self.el.appendChild(self._body);
      if (config.header) self._body.appendChild(self._header);
      if (config.footer) self._body.appendChild(self._footer);
    },
    $setters: {
      light: function (value) {
        if (value)
          addClass(this.el, "uk-modal-dialog-lightbox");
      },
      bodyWidth: function (value) {
        value = isNumber(value) ? value + "px" : value;
        this._body.style.width = value;
      },
      bodyHeight: function (value) {
        value = isNumber(value) ? value + "px" : value;
        this._body.style.height = value;
      },
      closeButton: function (value) {
        if (value) {
          var self = this;
          self._close = createElement("A",
            {class: "uk-modal-close uk-close"});
          if (self._body.firstChild) {
            self._body.insertBefore(self._close, self._body.firstChild);
          }
          else {
            self._body.appendChild(self._close);
          }
        }
      },
      body: function (value) {
        var innerBody = exports.new(value);
        var self = this;
        self.bodyContent = innerBody;
        self.$components.push(self.bodyContent);

        if (self._footer.parentNode) {
          self._body.insertBefore(innerBody.el, self._footer);
        }
        else {
          self._body.appendChild(innerBody.el);
        }
      },
      header: function (value) {
        var innerHeader = exports.new(value);
        var self = this;
        self._header.appendChild(innerHeader.el);
        self.headerContent = innerHeader;
        self.$components.push(self.headerContent);
      },
      footer: function (value) {
        var innerFooter = exports.new(value);
        var self = this;
        self._footer.appendChild(innerFooter.el);
        self.footerContent = innerFooter;
        self.$components.push(self.footerContent);
      },
      caption: function (value) {
        var self = this;
        if (!self._caption)
          self._caption = createElement("DIV", {class: "uk-modal-caption"});
        self._caption.innerHTML = value;
        self._body.appendChild(self._caption);
      }
    },
    open: function (args) {
      /**
       * Opens the modal.
       * @dispatch onOpen, onOpened
       * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
       */
      var config = this.config;
      this.dispatch("onOpen", [config, this.el, args]);
      UIkit.modal('#' + config.id, {
        center: config.center,
        bgclose: config.bgClose,
        keyboard: config.keyboard,
        modal: config.closeModals,
        minScrollHeight: config.minScrollHeight
      }).show();
      this.dispatch("onOpened", [config, this.el, args]);
    },
    close: function (args) {
      /**
       * Closes the modal.
       * @dispatch onClose, onClosed
       * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
       */
      var self = this;
      self.dispatch("onClose", [self.config, self.el, args]);
      UIkit.modal('#' + self.config.id).hide();
      self.dispatch("onClosed", [self.config, self.el, args]);
    }
  }, $definitions.flexgrid);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.light.isBoolean = true;
    $setters.bodyWidth.isText = true;
    $setters.bodyHeight.isText = true;
    $setters.closeButton.isBoolean = true;
    $setters.body.description = "Configuration object to put in the modal body.";
    $setters.header.description = "Configuration object to put in the modal header.";
    $setters.footer.description = "Configuration object to put in the modal footer.";
    $setters.caption.isText = true;
    $setters._meta = extend({
      bgClose: {isBoolean: true},
      keyboard: {isBoolean: true},
      minScrollHeight: {isNumber: true},
      closeModals: {isBoolean: true},
      center: {isBoolean: true},
      dialogClass: {options: ['', 'uk-modal-dialog-blank', 'uk-modal-dialog-full']}
    }, $setters._meta || {});
  }($definitions.modal.prototype.$setters));
  //[[?]]


  $definitions.button = def({
    __name__: "button",
    $defaults: {
      label: "",
      htmlTag: "BUTTON",
      tagClass: "uk-button",
      iconClass: "uk-icon-small",
      selectable: false
    },
    $setters: classSetters({
      type: prefixClassOptions({
        primary: "",
        success: "",
        danger: "",
        link: "",
        "": ""
      }, 'uk-button-', true),
      size: prefixClassOptions({
        mini: "",
        small: "",
        large: "",
        "": ""
      }, 'uk-button-', true)
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
      this.config.$selected = true;
      addClass(this.el, "uk-active");
    },
    isSelected: function () {
      /**
       * Returns if the button is in the selected state.
       * @returns {boolean}
       */
      return !!this.config.$selected;
    },
    deselect: function () {
      /**
       * Change the button state to deselected.
       */
      this.config.$selected = false;
      removeClass(this.el, "uk-active");
    }
  }, exports.ClickEvents, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters._meta = extend({
      iconClass: {isText: true},
      icon: {isText: true}
    }, $setters._meta || {});
  }($definitions.button.prototype.$setters));
  //[[?]]


  $definitions.icon = def({
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
  }, exports.ClickEvents, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($) {
    $._meta = extend({
      iconClass: {isText: true}
    }, $._meta || {});
  }($definitions.icon.prototype.$setters));
  //[[?]]


  $definitions.label = def({
    __name__: "label",
    $defaults: {
      label: "",
      htmlTag: "SPAN",
      selectable: false
    },
    $setters: classSetters({
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
      return this.config.label;
    },
    setValue: function (value) {
      /**
       * Sets the value (HTML accepted) of the label component.
       * @param value
       */
      this.config.label = value;
      this.render();
    }
  }, $definitions.element);


  $definitions.link = def({
    __name__: "link",
    $defaults: {
      label: "",
      htmlTag: "A"
    },
    template: function (config) {
      return config.label;
    }
  }, exports.ClickEvents, $definitions.element);


  $definitions.progress = def({
    __name__: "progress",
    $defaults: {
      htmlTag: "DIV",
      tagClass: "uk-progress",
      fill: "width"
    },
    $setters: classSetters({
      size: prefixClassOptions({
        mini: "",
        small: "",
        "": ""
      }, 'uk-progress-', true),
      type: prefixClassOptions({
        danger: "",
        warning: "",
        success: "",
        striped: "",
        "": ""
      }, 'uk-progress-', true)
    }),
    render: function () {
    },
    __init__: function () {
      this._bar = createElement("DIV", {class: "uk-progress-bar"});
      this.el.appendChild(this._bar);
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
      assertPropertyValidator(value, 'value', isNumber);

      var self = this;
      self._bar.style.width = value + '%';
      self._progress = value;
    }
  }, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.type.multipleAllowed = true;
    $setters.type.description = "Set the style type of the progress element.";
  }($definitions.progress.prototype.$setters));
  //[[?]]


  $definitions.image = def({
    __name__: "image",
    $defaults: {
      htmlTag: "IMG"
    },
    $events: {
      load: {lazy: true, dispatch: "onLoad"}
    },
    $setters: {
      src: function (value) {
        setAttributes(this.el, {src: value});
      }
    }
  }, exports.ClickEvents, $definitions.element);


  exports.ChangeEvent = {
    __name__: 'ChangeEvent',
    __check__: function (bases) {
      assertBasesCheck('Responder', 'ChangeEvent', bases);
    },
    $events: {
      change: {lazy: true, dispatch: "onChange", defaultEvent: true}
    }
  };

  exports.InputControl = {
    __name__: 'ChangeEvent',
    __check__: function (bases) {
      assertBasesCheck('Responder', 'InputControl', bases);
      assertBasesCheck('FormControl', 'InputControl', bases);
    },
    $events: {
      input: {lazy: true, dispatch: 'onInput', defaultEvent: true},
      keyup: {lazy: true, dispatch: 'onKeyUp', defaultEvent: true}
    },
    $setters: {
      autocomplete: function (value) {
        setAttributes(this.getFormControl(), {autocomplete: value});
      },
      autocapitalize: function (value) {
        setAttributes(this.getFormControl(), {autocapitalize: value});
      },
      autocorrect: function (value) {
        setAttributes(this.getFormControl(), {autocorrect: value});
      },
      placeholder: function (value) {
        setAttributes(this.getFormControl(), {placeholder: value});
      }
    }
  };

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.autocomplete.isBoolean = true;
    $setters.autocapitalize.isBoolean = true;
    $setters.autocorrect.isBoolean = true;
    $setters.placeholder.isText = true;
  }(exports.InputControl.$setters));
  //[[?]]

  $definitions.toggle = def({
    __name__: "toggle",
    $setters: classSetters({
      type: prefixClassOptions({
        "success": "",
        "danger": "",
        "warning": "",
        "": ""
      }, 'uk-toggle-', true)
    }),
    $defaults: {
      htmlTag: "LABEL",
      tagClass: "uk-toggle"
    },
    template: function (config) {
      return interpolate('<input type="checkbox"{{checked}}><div class="uk-toggle-slider"></div>',
        {checked: config.checked ? " checked" : ""});
    },
    getFormControl: function () {
      /**
       * Get the HTML input element.
       * @returns {Element}
       */
      return this.el.firstChild;
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
       * @param value
       */
      this.getFormControl().checked = value;
    }
  }, exports.ChangeEvent, exports.FormControl, $definitions.element);


  $definitions.input = def({
    __name__: "input",
    $defaults: {
      htmlTag: "INPUT",
      inputWidth: "medium",
      inline: false
    },
    $setters: {
      checked: function (value) {
        this.getFormControl().checked = value;
      }
    },
    reset: function () {
      /**
       * Clear the HTML input element.
       */
      var self = this;
      var formControl = self.getFormControl();
      switch (self.config.type) {
        case "checkbox":
          formControl.checked = self.config.checked;
          break;
        case "number":
          formControl.value = 0;
          break;
        default:
          formControl.value = "";
          break;
      }
    },
    getValue: function () {
      /**
       * Get the value of the HTML input element.
       * @returns {string|boolean}
       */
      if (this.config.type == "checkbox") {
        return this.getFormControl().checked;
      }
      else return this.getFormControl().value;
    },
    setValue: function (value) {
      /**
       * Set the value of the HTML input element.
       * @param value
       */
      if (this.config.type == "checkbox") {
        this.getFormControl().checked = value;
      }
      else this.getFormControl().value = value;
    }
  }, exports.InputControl, exports.ChangeEvent, exports.FormControl, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.checked.isBoolean = true;
  }($definitions.input.prototype.$setters));
  //[[?]]


  $definitions.password = def({
    __name__: "password",
    $defaults: {
      tagClass: "uk-form-password",
      inputWidth: "medium"
    },
    getFormControl: function () {
      /**
       * Gets the HTML input element.
       * @returns {Element}
       */
      return this.el.firstChild;
    },
    template: "<input type='password' style='width:100%'><a class='uk-form-password-toggle' data-uk-form-password>Show</a>"
  }, exports.InputControl, exports.ChangeEvent, exports.FormControl, $definitions.element);


  $definitions.autocomplete = def({
    __name__: "autocomplete",
    $defaults: {
      tagClass: "uk-autocomplete",
      placeholder: "",
      minLength: 0,
      caseSensitive: false,
      sources: [],
      autocomplete: function (release) {
        var searchValue = this.getValue();
        var config = this.config;
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
        if (isFunction(value))
          this._getSource = value;
        else
          this._getSource = echo(value);
      },
      autocomplete: function (value) {
        var self = this;
        var autocomplete = self._autocomplete = UIkit.autocomplete(self.el,
          {source: bind(value, self), minLength: self.config.minLength});
        self.el.style.wordBreak = "break-word";
        autocomplete.dropdown.attr("style", "width:100%");
        autocomplete.dropdown.addClass('uk-dropdown-small');
        autocomplete.on("selectitem.uk.autocomplete", function (e, obj) {
          self.dispatch("onChange", [obj.value]);
          self.dispatch("onAutocomplete", [obj]);
        });
      }
    },
    template: function (config) {
      return interpolate(
        '<input type="text" placeholder="{{placeholder}}" style="width:100%">',
        {placeholder: config.placeholder});
    }
  }, $definitions.password);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters._meta = extend({
      caseSensitive: {isBoolean: true},
      minLength: {isNumber: true},
      sources: 'An array of sources for the autocomplete.',
      autocomplete: "A matching function that is passed a release callback to determine the final displayed autocomplete results. Default uses the 'sources' property."
    }, $setters._meta || {});
  }($definitions.input.prototype.$setters));
  //[[?]]


  $definitions.search = def({
    __name__: "search",
    $defaults: {
      tagClass: "uk-search",
      placeholder: "Search...",
      iconTemplate: "<i class='uk-icon-search uk-margin-right'></i>",
      inputClass: "uk-search-field",
      inputType: "search"
    },
    getFormControl: function () {
      /**
       * Gets the HTML input element.
       * @returns {Element}
       */
      return this.el.lastChild;
    },
    template: '{{iconTemplate}}<input class="{{inputClass}}" type="{{inputType}}" placeholder="{{placeholder}}">'
  }, exports.InputControl, exports.ChangeEvent, exports.FormControl, $definitions.element);


  $definitions.dropdown = def({
    __name__: "dropdown",
    $defaults: {
      mode: "click",
      pos: "bottom-center",
      padding: "none",
      justify: false,
      dropdownCSS: "uk-dropdown-small uk-dropdown-close",
      blank: false
    },
    $setters: {
      dropdown: function (value) {
        var self = this;
        var dropdown = createElement("DIV",
          {class: classString(self._dropdownCSS())});

        if (!value.listStyle) {
          value.listStyle = "dropdown";
        }

        var ui = exports.new(value);
        dropdown.appendChild(ui.el);
        self.el.appendChild(dropdown);
        self._inner = ui;
        self.$components.push(self._inner);
      }
    },
    __init__: function (config) {
      this._dropdown = UIkit.dropdown(this.el, {pos: config.pos, justify: config.justify, mode: config.mode});
    },
    _dropdownCSS: function () {
      var config = this.config;
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
      return this.el.firstChild.getBoundingClientRect();
    },
    isOpened: function () {
      /**
       * Returns if the dropdown is open.
       * @returns {boolean}
       */
      return hasClass(this.el, 'uk-open');
    },
    open: function (args) {
      /**
       * Opens the dropdown.
       * @dispatch onOpen, onOpened
       * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
       */
      var self = this;
      args = [self.config, self.el, args];
      self.dispatch("onOpen", args);
      self._inner.dispatch("onOpen", args);
      self._dropdown.show();
      self.dispatch("onOpened", args);
      self._inner.dispatch("onOpened", args);
    },
    close: function (args) {
      /**
       * Close the dropdown.
       * @dispatch onClose, onClosed
       * @param args Parameter to pass into the dispatch handlers. (3rd argument of the callback.)
       */
      var self = this;
      args = [self.config, self.el, args];
      self.dispatch("onClose", args);
      self._inner.dispatch("onClose", args);
      // Tricky: on mobile browsers HTML update/rendering timings are a bit wonky
      // Adding a delay helps close dropdowns properly on Chrome (mobile)
      setTimeout(function () {
        removeClass(self.el, 'uk-open');
        self.dispatch("onClosed", args);
        self._inner.dispatch("onClosed", args);
      }, 10);
    }
  }, $definitions.flexgrid, exports.AbsolutePositionMethods);


  exports.LinkedList = {
    __name__: "LinkedList",
    __check__: function (bases) {
      assertBasesCheck('LinkedList', 'LinkedList', bases);
      assertBasesCheck('Dispatcher', 'LinkedList', bases);
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
      return data.id || (data.id = uidForComponent("data"));
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
      assertPropertyValidator(update, 'update object for ' + item.id, isDefined);
      var refNode = item.$tailNode;
      this.remove(item);
      extend(item, update, true);
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
      var self = this;
      assertPropertyValidator(item, 'HTMLElement', isObject);
      assert(self._nodeList.indexOf(item) == -1, "Circular reference detected with node insert!");

      item.id = self.id(item);

      if (!node && self.tailNode) {
        // Insert as last node
        return self.insertAfter(item, self.tailNode);
      }
      else {
        self.dispatch("onAdd", [item]);

        if (self.headNode == null || self.tailNode == null) {
          self.headNode = item;
          self.tailNode = item;
          item.$headNode = item.$tailNode = null;
        }
        else {
          if (node.$headNode) {
            node.$headNode.$tailNode = item;
          }
          item.$headNode = node.$headNode;
          item.$tailNode = node;
          node.$headNode = item;

          if (node == self.headNode)
            self.headNode = item;
        }

        self._nodeList.push(item);

        self.dispatch("onAdded", [item, node]);

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
      var self = this;
      assertPropertyValidator(item, 'item object ' + item, isObject);
      assert(self._nodeList.indexOf(item) == -1, "Circular reference detected with node insert!");

      item.id = self.id(item);

      if (!node && self.headNode) {
        // Insert as first node
        return self.insertBefore(item, self.headNode);
      }
      else {
        self.dispatch("onAdd", [item]);

        if (self.headNode == null || self.tailNode == null) {
          self.headNode = item;
          self.tailNode = item;
          item.$headNode = item.$tailNode = null;
        }
        else {
          if (node.$tailNode) {
            node.$tailNode.$headNode = item;
          }
          item.$tailNode = node.$tailNode;
          item.$headNode = node;
          node.$tailNode = item;

          if (node == self.tailNode)
            self.tailNode = item;
        }

        self._nodeList.push(item);

        self.dispatch("onAdded", [item]);

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
      assertPropertyValidator(item, 'item', isObject);

      var self = this;
      self.dispatch("onDelete", [item]);

      if (item.$headNode) item.$headNode.$tailNode = item.$tailNode;
      if (item.$tailNode) item.$tailNode.$headNode = item.$headNode;
      if (item == self.headNode)
        self.headNode = item.$tailNode;
      if (item == self.tailNode)
        self.tailNode = item.$headNode;
      item.$tailNode = item.$headNode = null;

      if (self._nodeList.indexOf(item) != -1)
        exports.ListMethods.remove.call(self._nodeList, item);

      self.dispatch("onDeleted", [item]);
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

  $definitions.stack = def({
    __name__: "stack",
    $defaults: {
      filter: returnTrue,
      droppable: returnTrue
    },
    $setters: {
      filter: function (value) {
        assertPropertyValidator(value, 'filter', isFunction);
      },
      droppable: function (value) {
        assertPropertyValidator(value, 'value', isFunction);
      }
    },
    __after__: function (config) {
      var self = this;
      self.addListener("onAdded", self._onAdded);
      self.addListener("onDeleted", self._onDeleted);
      self.addListener("onRefresh", self._onRefresh);
      self.addListener("onClearAll", self._onClearAll);

      if (config.data) self.setData(config.data);
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
    _containerHTML: function () {
      return this.el;
    },
    _itemHTML: function () {
      return createElement("DIV");
    },
    _innerHTML: function () {
      return {id: uidForComponent("item")};
    },
    _createItem: function (obj) {
      var item = this._itemHTML(obj);
      setAttributes(item, {'data-id': obj.id});
      this._innerHTML(item, obj);
      this._itemNodes[obj.id] = item;
      return item;
    },
    _onAdded: function (obj) {
      var self = this;
      if (obj.$tailNode)
        self._containerHTML().insertBefore(self._createItem(obj), self.getItemNode(obj.$tailNode.id));
      else
        self._containerHTML().appendChild(self._createItem(obj));

      if (obj.$parent) {
        var parent = self.getItem(obj.$parent);
        var parentNode = self.getItemNode(parent.id);
        parentNode.parentNode.replaceChild(self._createItem(parent), parentNode);
      }

      self.dispatch("onDOMChanged", [obj, "added"]);
    },
    _onDeleted: function (obj) {
      var self = this;
      if (obj.$parent) {
        var parent = self.getItem(obj.$parent);
        parent.$children.remove(obj);
        var parentNode = self.getItemNode(parent.id);
        parentNode.parentNode.replaceChild(self._createItem(parent), parentNode);
      }
      self._containerHTML().removeChild(self.getItemNode(obj.id));
      delete self._itemNodes[obj.id];

      self.dispatch("onDOMChanged", [obj, "deleted"]);
    },
    _onRefresh: function () {
      var self = this;
      self._onClearAll();
      self._itemNodes = {};
      self.each(function (node) {
        var $this = this;
        $this._itemNodes[node.id] = $this._createItem(node);
        if ($this.filter(node))
          $this._containerHTML().appendChild($this._itemNodes[node.id]);
      }, self);

      self.dispatch("onDOMChanged", [null, "refresh"]);
    },
    _onClearAll: function () {
      var $this = this;
      
      forInLoop(function (key, node) {
        if (node.parentNode) $this._containerHTML().removeChild(node);
      }, $this._itemNodes);
      
      $this.dispatch("onDOMChanged", [null, "clear"]);
    },
    setData: function (value) {
      /**
       * Sets the data for the component.
       * @param value An array of component configuration objects. The default view object is 'link' if none is specified.
       */
      assertPropertyValidator(value, 'setData argument value', isArray);

      var $this = this;
      $this.clearAll();
      for (var i = 0; i < value.length; i++) {
        if ($this.config.filter(value[i]))
          $this.add(value[i]);
      }
      $this.data = value;
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
          removeClass(this._itemNodes[item.id], "uk-hidden");
        else
          addClass(this._itemNodes[item.id], "uk-hidden");
      }, this);
    }
  }, exports.LinkedList, $definitions.element);

  //[[?env.debug]]
  (function ($setters) {
    $setters.filter.description = 'A function to determine which child components to display. The function is passed the child component object.';
    $setters.droppable.description = 'A function to determine if a child component can be drag and dropped upon. The function is passed the child component object.';

    $setters._meta = extend({
      data: 'An array of component objects.'
    }, $setters._meta || {});
  }($definitions.stack.prototype.$setters));
  //[[?]]


  $definitions.list = def({
    __name__: "list",
    $defaults: {
      htmlTag: "UL",
      itemTag: "LI",
      selectable: false,
      closeButton: false,
      listStyle: "list",
      itemClass: "",
      dropdownEvent: "onItemClick"
    },
    $setters: extend(
      classSetters({
        listStyle: prefixClassOptions({
          "nav": "nav",
          "side": ["nav", "nav-side"],
          "offcanvas": ["nav", "nav-offcanvas"],
          "dropdown": ["nav", "nav-dropdown", "nav-side"],
          "stripped": ["nav", "list", "list-stripped"],
          "line": ["list", "list-line"],
          "subnav": "subnav",
          "navbar": "navbar-nav",
          "navbar-center": "navbar-center",
          "subnav-line": ["subnav", "subnav-line"],
          "subnav-pill": ["subnav", "subnav-pill"],
          "list": "list",
          "tab": "tab",
          "tab-flip": "tab-flip",
          "tab-bottom": "tab-bottom",
          "tab-center": "tab-center",
          "tab-left": "tab-left",
          "tab-right": "tab-right",
          "breadcrumb": "breadcrumb",
          "": ""
        }, 'uk-')
      }),
      {
        accordion: function (value) {
          if (value) setAttributes(this.el, {"data-uk-nav": ""});
        },
        tab: function (value) {
          if (value) {
            var self = this;
            self.addListener("onItemClick", self._onTabClick);

            if (value == "responsive") {
              // Create a list of linked data to the actual data
              // This avoids needing to duplicate the data
              var linkedData = exports.list(self.config.data).each(function (item) {
                return {label: item.label, $link: item, $close: item.$close};
              });

              self.set('dropdownEvent', "onTabMenuClick");
              self.set('dropdown', {
                view: "list",
                data: linkedData,
                on: {
                  onItemClick: function (item, node, e) {
                    self._onTabClick(item.$link, node, e);
                  },
                  onItemSelectionChanged: function (item, node, e) {
                    self._onTabClick(item.$link, node, e);
                  },
                  onItemClosed: function (item) {
                    self.closeItem(item.$link);
                  }
                }
              });
              self.dropdownList = self.dropdownPopup._inner;
            }
          }
        }
      }
    ),
    __after__: function (config) {
      if (config.tab) {
        var self = this;
        self.addListener("onAdded", self._onTabAdded);
        self.addListener("onDeleted", self._onTabDeleted);
        self.addListener("onItemSelectionChanged", self._onItemSelectionChanged);
        if (config.tab == 'responsive') {
          self.addListener("onDOMChanged", self._onDOMChanged);
          self.add({label: "<i class='uk-icon-bars'></i>", $tabmenu: true, batch: "$menu"}, self.headNode);
          $windowListeners.resize.push(bind(self.updateFit, self));
          self.dispatch("onDOMChanged", [null, "refresh"]);
        }
      }
    },
    _onDOMChanged: function () {
      delay(this.updateFit, this);
    },
    _onTabAdded: function (item, before) {
      var self = this;
      if (self.dropdownList && !item.$tabmenu) {
        var linked = {label: item.label, $link: item, $close: item.$close};
        self.dropdownList.add(linked, self.dropdownList.findOne("$link", before));
        // Select dropdown item if item is selected
        if (item.$selected) {
          self.dropdownList.deselectAll();
          self.dropdownList.select(linked);
        }
      }
      if (item.$selected) {
        self.deselectAll();
        self.select(item);
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
      var self = this;
      self.deselectAll();
      self.select(item);

      // Select dropdown item
      if (self.dropdownList) {
        var linked = self.dropdownList.findOne("$link", item);
        if (linked) {
          self.dropdownList.deselectAll();
          self.dropdownList.select(linked);
        }

        // Show active visible item
        self.updateFit();
      }
    },
    updateFit: function () {
      /**
       * Checks if the screen is wide enough to fit all components. Used with tab mode to allow for a responsive tab menu.
       */
      var self = this;
      self.each(function (item) {
        // Show everything for checking y-offset (keep invisible to avoid blink)
        addClass(this._itemNodes[item.id], "uk-invisible");
        // Update batch according to $selected state
        if (!item.$tabmenu) {
          item.batch = item.$selected ? "$selected" : undefined;
        }
      }, self);

      var offset, doResponsive;
      
      forInLoop(function (key, node) {
        if (offset && node.offsetTop != offset) {
          doResponsive = true;
          return false;
        }
        offset = node.offsetTop;
      }, self._itemNodes);

      self.each(function (item) {
        removeClass(this._itemNodes[item.id], "uk-invisible");
      }, self);

      if (doResponsive) {
        self.showBatch(["$menu", "$selected"]);
      }
      else {
        self.showBatch([undefined, "$selected"]);
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
      this.deselectAll();
      var item = this.findOne(key, value);
      if (item) this.select(item);
      return !!item;
    },
    isSelected: function (item) {
      /**
       * Checks if an item is selected.
       * @param item An item of the component.
       */
      if (isString(item))
        item = this.getItem(item);
      return item.$selected;
    },
    select: function (item) {
      /**
       * Selects an active item of the list. This method will not deselect previously selected items.
       * @param item The object to select in the list.
       */
      if (isString(item))
        item = this.getItem(item);
      item.$selected = true;
      addClass(this.getItemNode(item.id), "uk-active");
    },
    deselectAll: function () {
      /**
       * Deselects all items in the list, use this for single-selection lists.
       */
      this.each(function (item) {
        var node = this.getItemNode(item.id);
        item.$selected = false;
        assert(node, "Node with id " + item.id + " does not exist");
        removeClass(node, "uk-active");
      }, this);
    },
    closeItem: function (item) {
      /**
       * For tabs only, closes a tab item and removes it.
       * @param item The item to remove.
       * @dispatch onItemClose, onItemClosed, onItemSelectionChanged
       */
      var self = this;
      self.dispatch("onItemClose", [item]);

      if (self.isSelected(item)) {
        // Select the next tab that's not a tab menu.
        var nextItem = self.previous(item) || self.next(item);
        nextItem = nextItem && nextItem.$tabmenu ? self.next(item) : nextItem;

        if (nextItem && !nextItem.$tabmenu) {
          self.select(nextItem);
          self.dispatch("onItemSelectionChanged", [nextItem]);
        }
      }

      // Don't remove if is tab menu
      if (item && !item.$tabmenu) {
        self.remove(item);
      }

      self.dispatch("onItemClosed", [item]);
    },
    _itemHTML: function (itemConfig) {
      var itemClass = itemConfig.$css || this.config.itemClass;

      var li = createElement(this.config.itemTag,
        {
          class: classString(itemClass)
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
        parentNode.appendChild(ui.el);
      }
      else if (config.header) {
        parentNode.innerHTML = config.label;
      }
      else if (config.divider) {
      }
      else {
        var link = new $definitions.link(config);
        this.$components.push(link);

        parentNode.appendChild(link.el);

        if (config.closeButton) {
          this._addCloseHTML(link.el, config);
        }
      }
      return ui;
    },
    _addCloseHTML: function (node, item) {
      if (item.$close) {
        var $this = this;;
        $this._close = UI.new({
          view: "link",
          htmlTag: "SPAN",
          tagClass: "uk-close",
          on: {
            onClick: function () {
              $this.closeItem(item);
            }
          }
        }, node);
      }
    },
    _attachNodeEvents: function (node, itemConfig) {
      var self = this;
      addListener(node, "click", function (e) {
        if (!exports._dragged) {
          this.dispatch("onItemClick", [itemConfig, node, e]);
        }
      }, self);

      if (self.context && itemConfig.context !== false) {
        addListener(node, "contextmenu", function (e) {
          this.dispatch("onItemContext", [itemConfig, node, e]);
        }, self);
      }

      if (self.droppable && itemConfig.$droppable !== false) {
        node.config = itemConfig;
        node.master = self;
        node.$droppable = true;
      }

      if (self.draggable && itemConfig.$draggable !== false) {
        setAttributes(node, {draggable: 'false'});

        addListener(node, "dragstart", function (e) {
          preventEvent(e);
        }, self);

        function onMouseDown(e) {
          if (isFunction(this.draggable) && !this.draggable(e)) {
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

        if (UIkit.support.touch) addListener(node, "touchstart", onMouseDown, self);
        addListener(node, "mousedown", onMouseDown, self);
      }
    }
  }, $definitions.stack);

  //[[?env.debug]]
  (function ($setters) {
    $setters.listStyle.multipleAllowed = true;
    $setters.accordion.isBoolean = true;
    $setters.tab.description = 'When true, sets additional behaviors for tabs such as responsiveness and onTabMenuClick';
    $setters._meta = extend({
      selectable: {isBoolean: true},
      itemClass: {isText: true}
    }, $setters._meta || {});
  }($definitions.list.prototype.$setters));
  //[[?]]


  $definitions.tree = def({
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
      var self = this;
      self.addListener("onItemClick", self.toggle);
      self.addListener("onItemDragStart", self._dragStart);
      self.addListener("onItemDragOver", self._dragOver);
      self.addListener("onItemDragLeave", self._dragLeave);
      self.addListener("onItemDragEnd", self._dragEnd);
      self.addListener("onItemDrop", self._dragLeave);
    },
    _innerHTML: function (parentNode, config) {
      parentNode.innerHTML = this.template(config);
    },
    _dragStart: function (item) {
      var $this = this;
      if (item.$branch)
        $this._hideChildren(item);
    },
    _dragEnd: function (item) {
      if (item.$branch && !item.$closed)
        this._showChildren(item);
    },
    _dragOver: function (item) {
      if (this.config.droppable(item, exports._dragged.config, exports._dragged.node))
        addClass(this.getItemNode(item.id), "uk-active");
    },
    _dragLeave: function (item) {
      removeClass(this.getItemNode(item.id), "uk-active");
    },
    _showChildren: function (item) {
      item.$children.until(function (child, queue) {
        removeClass(this.getItemNode(child.id), "uk-hidden");

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
        addClass(this.getItemNode(child.id), "uk-hidden");

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
      return interpolate(
        '<a><i class="uk-icon-{{icon}}" style="margin-left: {{margin}}px">' +
        '</i><span class="uk-margin-small-left">{{label}}</span></a>',
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

      var self = this;
      self.dispatch("onOpen", [item.id]);

      item.$closed = false;
      var node = self.getItemNode(item.id);
      node.parentNode.replaceChild(self._createItem(item), node);

      self._showChildren(item);

      self.dispatch("onOpened", [item.id]);

      if (item.$parent)
        self.open(item.$parent);
    },
    close: function (item) {
      /**
       * Collapse a specific branch of the tree.
       * @param item A child branch of the tree.
       * @dispatch onClose, onClosed
       */
      if (!item.$branch || item.$closed) return;

      var self = this;
      self.dispatch("onClose", [item.id]);

      item.$closed = true;
      var node = self.getItemNode(item.id);
      node.parentNode.replaceChild(self._createItem(item), node);

      self._hideChildren(item);

      self.dispatch("onClosed", [item.id]);
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
  }, $definitions.list);

  //[[?env.debug]]
  (function ($setters) {
    $setters._meta = extend({
      indentWidth: {isNumber: true},
      dataTransfer: 'The data representation of an item, only for FireFox.',
      draggable: {isBoolean: true},
      orderAfter: 'Low level function that determines ordering of tree items.',
      droppable: 'Function that determines if an item can be dropped upon.'
    }, $setters._meta || {});
  }($definitions.tree.prototype.$setters));
  //[[?]]


  $definitions.table = def({
    __name__: "table",
    $defaults: {
      tagClass: "uk-table",
      htmlTag: "TABLE",
      flex: false,
      size: "",
      layout: "",
      listStyle: ""
    },
    __init__: function () {
      var self = this;
      self.header = self._header = createElement("THEAD");
      self.footer = self._footer = createElement("TFOOT");
      self.body = self._body = createElement("TBODY");

      // Make Chrome wrapping behavior same as firefox
      self._body.style.wordBreak = "break-word";

      self.el.appendChild(self._header);
      self.el.appendChild(self._footer);
      self.el.appendChild(self._body);
    },
    $setters: extend(classSetters({
        tableStyle: prefixClassOptions({
          hover: "",
          striped: "",
          condensed: "",
          "": ""
        }, 'uk-table-', true)
      }),
      {
        columns: function (value) {
          assertPropertyValidator(value, 'columns', isArray);
          value = exports.list(value);
          value.each(function (item) {
            if (isUndefined(item.template) && item.name) {
              item.template = exports.selectors.property(item.name);
            }
          });
        },
        header: function (value) {
          if (value) {
            if (isObject(value)) {
              var column = exports.ListMethods.findOne.call(this.config.columns, "name", value.name, true);
              column.header = value.header;
            }
            var columns = this.config.columns;
            var headersHTML = "";
            for (var c, i = 0; i < columns.length; i++) {
              c = columns[i];
              headersHTML += c.align ?
                interpolate("<th style='text-align: {{align}}'>{{text}}</th>", {
                  align: c.align,
                  text: c.header
                })
                : "<th>" + c.header + "</th>";
            }
            this._header.innerHTML = "<tr>" + headersHTML + "</tr>";
          }
        },
        footer: function (value) {
          if (value) {
            if (isObject(value)) {
              var column = exports.ListMethods.findOne.call(this.config.columns, "name", value.name);
              column.footer = value.footer;
            }
            var footers = pluck(this.config.columns, "footer");
            this._footer.innerHTML = "<tr><td>" + footers.join("</td><td>") + "</td></tr>";
          }
        },
        caption: function (value) {
          var self = this;
          self._caption = createElement("CAPTION");
          self._caption.innerHTML = value;
          self.el.appendChild(self._caption);
        }
      }
    ),
    _innerHTML: function (node, obj) {
      var td, column;
      var self = this;
      for (var i = 0; i < self.config.columns.length; i++) {
        column = self.config.columns[i];
        td = createElement("TD", {class: column.$css ? classString(column.$css) : ""});

        if (column.align)
          td.style.textAlign = column.align;

        template(column.template, obj, self, td);
        node.appendChild(td);
      }
      self._attachNodeEvents(node, obj);
    },
    _itemHTML: function () {
      return createElement("TR");
    },
    _containerHTML: function () {
      return this._body;
    }
  }, $definitions.list);

  //[[?env.debug]]
  (function ($setters) {
    $setters.tableStyle.multipleAllowed = true;
    $setters.columns.description = "A list of schema objects containing data display info. Example: [{name: 'property.nested'}, {template: '<input type=&quot;checkbox&quot;>'}]";
    $setters.header.description = "A list of header objects containing the header and alignment info. Example: [{header: 'Awesome', align: 'center'}]";
    $setters.footer.description = "A list of footer objects containing the footer title.";
  }($definitions.table.prototype.$setters));
  //[[?]]


  $definitions.select = def({
    __name__: "select",
    $defaults: {
      tagClass: "",
      htmlTag: "SELECT",
      flex: false,
      size: "",
      layout: "",
      listStyle: ""
    },
    select: function (item) {
      /**
       * Selects an item in the select component.
       * @param item Object to select.
       */
      if (isString(item))
        item = this.getItem(item);
      item.$selected = true;
      this.getFormControl().selectedIndex = this.indexOf(item);
    },
    deselectAll: function () {
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
      return createElement("OPTION", attrs);
    }
  }, exports.ChangeEvent, exports.FormControl, $definitions.list);


  $definitions.form = def({
    __name__: "form",
    $defaults: {
      htmlTag: "FORM",
      tagClass: "uk-form",
      layout: "stacked",
      fieldset: []
    },
    $events: {
      submit: {dispatch: 'onSubmit', callback: returnTrue}
    },
    $setters: extend(
      classSetters({
        formStyle: prefixClassOptions({
          stacked: "",
          horizontal: "",
          line: "",
          "": ""
        }, 'uk-form-', true)
      }),
      {
        fieldset: function (value) {
          this.set('fieldsets', [{
            view: "fieldset",
            layout: this.config.layout,
            data: value
          }]);
        },
        fieldsets: function (value) {
          assertPropertyValidator(value, 'fieldsets', isArray);

          for (var ui, i = 0; i < value.length; i++) {
            ui = exports.new(value[i]);
            this.$fieldsets.push(ui);
            this.$components.push(ui);
            this.el.appendChild(ui.el);
          }
        }
      }),
    __init__: function () {
      this.$fieldsets = UI.list();
    },
    clear: function () {
      /**
       * Clear all values from the form.
       */
      this.$fieldsets.each(function (fieldset) {
        fieldset.clear();
      });
    },
    enable: function () {
      /**
       * Enable the fieldset of the form.
       */
      this.$fieldsets.each(function (fieldset) {
        fieldset.enable();
      });
    },
    disable: function () {
      /**
       * Disable the fieldset of the form.
       */
      this.$fieldsets.each(function (fieldset) {
        fieldset.disable();
      });
    },
    getValues: function () {
      /**
       * Gets the values of the form's components.
       * @returns {object} Object of key values of the form.
       */
      var result = {};
      this.$fieldsets.each(function (fieldset) {
        UI.extend(result, fieldset.getValues());
      });
      return result;
    },
    setValues: function (values) {
      /**
       * Sets the values for the form components. The keys of the object correspond with the 'name' of child components.
       * @param values Object of names and values.
       */
      this.$fieldsets.each(function (fieldset) {
        fieldset.setValues(values);
      });
    },
    getFieldset: function (index) {
      /**
       * Retrieves the fieldset component of the form.
       * @param index The index of the fieldset in the form, default 0.
       * @returns {UI.definitions.fieldset}
       */
      return this.$fieldsets[index || 0];
    }
  }, $definitions.element);

  //[[?env.debug]]
  // Define setter options for auto-documentation
  (function ($setters) {
    $setters.formStyle.multipleAllowed = true;
    $setters.fieldset.description = 'Fieldset object';
    $setters.fieldsets.description = 'An array of Fieldset objects';
  }($definitions.form.prototype.$setters));
  //[[?]]


  $definitions.fieldset = def({
    __name__: "fieldset",
    $defaults: {
      htmlTag: "FIELDSET"
    },
    $setters: classSetters({
      layout: prefixClassOptions({
        stacked: "",
        horizontal: "",
        "": ""
      }, 'uk-form-', true)
    }),
    _itemHTML: function (itemConfig) {
      if (itemConfig.title) {
        return createElement("LEGEND",
          {class: itemConfig.$itemCSS ? classString(itemConfig.$itemCSS) : ""});
      }
      else {
        return createElement("DIV",
          {class: itemConfig.$itemCSS ? classString(itemConfig.$itemCSS) : "uk-form-row"});
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
          ui.label = createElement("LABEL", {class: "uk-form-label", for: config.id});
          ui.label.innerHTML = config.formLabel;
          if (config.inline) addClass(ui.label, "uk-display-inline");
          parentNode.appendChild(ui.label);
        }

        var controlContainer = parentNode;
        if (!config.inline) {
          controlContainer = createElement("DIV", {class: "uk-form-controls"});
          addClass(controlContainer, config.$css);
          parentNode.appendChild(controlContainer);
        }

        controlContainer.appendChild(ui.el);
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
      config = config || {};
      var unprocessed = this.$components.copy();

      var ui;
      while (unprocessed.length > 0) {
        ui = unprocessed.pop();
        if (ui && isDefined(config[ui.config.name])) {
          ui.setValue(config[ui.config.name]);
        }
        else if (ui.$components) {
          unprocessed = unprocessed.concat(ui.$components);
        }
      }
    }
  }, $definitions.stack);

  window.$$ = $$;

  return exports;
})({}, window, window.UIkit);

//[[?env.debug]]
UI.debug = true;
//[[?]]
