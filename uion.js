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

	exports._events = {};
	exports.event = function (node, event, handler, thisArg) {
		exports.assert(node, exports.replaceString("Invalid node as target for {{event}} event", {event: event}));
		exports.assert(handler, exports.replaceString("Invalid handler as target for {{event}} event", {event: event}));
		node = exports.node(node);

		var id = exports.uid();

		if (thisArg)
			handler = exports.bind(handler, thisArg);

		exports._events[id] = [node, event, handler];	//store event info, for detaching

		// Not officially supporting, or going out of the way to support IE10-
		node.addEventListener(event, handler);

		return id;
	};

	exports.removeEvent = function (id) {
		if (!id) return;
		exports.assert(exports._events[id], exports.replaceString("Event with id {{id}} does not exist", {id: id}));

		var e = exports._events[id];
		e[0].removeEventListener(e[1], e[2]);

		delete exports._events[id];
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
			this._eventsByName = {};
			this._eventsById = {};

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
			var handlers = this._eventsByName[type];
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

			var handlers = this._eventsByName[type] || exports.list();
			handlers.push(func);
			this._eventsByName[type] = handlers;
			this._eventsById[id] = {_func: func, _name: type};

			return id;
		},
		removeEvent: function (id) {
			/**
			 * Removes a listener based on the event id.
			 * @param id Event id from adding the listener.
			 */
			if (!this._eventsById[id]) return;

			var name = this._eventsById[id]._name;
			var func = this._eventsById[id]._func;

			var handlers = this._eventsByName[name];
			handlers.remove(func);

			delete this._eventsById[id];
		},
		hasEvent: function (type) {
			/**
			 * Checks if an particular event handler exists.
			 * @param type Type of event.
			 * @example hasEvent('onInitialized')
			 * @returns {boolean}
			 */
			var handlers = this._eventsByName[type];
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

			exports.event(window, "mouseup", exports._globalMouseUp);
			exports.event(window, "mousemove", exports._globalMouseMove);

			if (UIkit.support.touch) {
				exports.event(window, "touchend", exports._globalMouseUp);
				exports.event(window, "touchmove", exports._globalMouseMove);
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
		else exports.event(window, "load", ready);
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
					exports.event(window, "resize", function (e) {
						this.dispatch("onResize", [e]);
					}, $this);
				}
				if (config.on.onDebounceResize) {
					exports.event(window, "resize", UIkit.Utils.debounce(function (e) {
						$this.dispatch("onDebounceResize", [e]);
					}, 1000));
				}
				if (config.on.onFocus) {
					exports.event(this.firstResponder(), "focus", function (e) {
						this.dispatch("onFocus", [e]);
					}, $this);
				}
				if (config.on.onBlur) {
					exports.event(this.firstResponder(), "blur", function (e) {
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
			exports.event(this.firstResponder(), "click", this._onClick, this);
			exports.event(this.firstResponder(), "contextmenu", this._onContext, this);

			// Optimization: these rarely get used.
			if (config.on.onMouseDown) {
				exports.event(this.firstResponder(), "mousedown", this._onMouseDown, this);
			}
			if (config.on.onMouseUp) {
				exports.event(this.firstResponder(), "mouseup", this._onMouseUp, this);
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
			exports.event(this.firstResponder(), "load", function (e) {
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
			exports.event(this.firstResponder(), "change", this._onChange, this);
		},
		_onChange: function () {
			this.dispatch("onChange");
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
			exports.event(this.firstResponder(), "change", this._onChange, this);
			exports.event(this.firstResponder(), "input", this._onInput, this);
			exports.event(this.firstResponder(), "keyup", function (e) {
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
			exports.event(this.firstResponder(), "change", this._onChange, this);
			exports.event(this.firstResponder(), "input", this._onInput, this);
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
			exports.event(this.firstResponder(), "change", this._onChange, this);
			exports.event(this.firstResponder(), "input", this._onInput, this);
			exports.event(this.firstResponder(), "keyup", function (e) {
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
					exports.event(window, "resize", this.updateFit, this);
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
			 * Sets the active item of the list based on the item's label property. This operates as a single-selection of an item.
			 * @param label The label value of an item.
			 */
			this.setActive("label", label);
		},
		setActive: function (key, value) {
			/**
			 * Set the active item of the list based on a property. This operates as a single-selection of an item.
			 */
			this.unselectAll();
			var item = this.findOne(key, value);
			exports.assert(item, exports.replaceString("Could not find {{key}} {{value}} in {{id}}.",
				{key: key, value: value, id: this._config.id}));
			this.select(item);
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

				exports.event(close, "click", function (e) {
					if (item.$preventDefault !== false) {
						exports.html.preventEvent(e);
					}
					this.closeItem(item);
				}, this);

				node.appendChild(close);
			}
		},
		_attachNodeEvents: function (node, itemConfig) {
			exports.event(node, "click", function (e) {
				if (itemConfig.$preventDefault !== false && this._config.$preventDefault !== false) {
					exports.html.preventEvent(e);
				}
				if (!exports._dragged) {
					this.dispatch("onItemClick", [itemConfig, node, e]);
				}
			}, this);

			if (this.context && itemConfig.context !== false) {
				exports.event(node, "contextmenu", function (e) {
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

				exports.event(node, "dragstart", function (e) {
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

				if (UIkit.support.touch) exports.event(node, "touchstart", onMouseDown, this);
				exports.event(node, "mousedown", onMouseDown, this);
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
			exports.event(this.firstResponder(), "change", this._onChange, this);
		},
		_onChange: function () {
			this.dispatch("onChange");
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
			exports.event(this.firstResponder(), "submit", this._onSubmit, this);
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
