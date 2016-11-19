window.pykit = {debug: true};

pykit.isArray = function(obj) {
	return Array.isArray ? Array.isArray(obj) : (Object.prototype.toString.call(obj) == '[object Array]');
};

pykit.isString = function(obj) {
	return Object.prototype.toString.call(obj) == '[object String]';
};

pykit.isObject = function(obj) {
	return Object.prototype.toString.call(obj) == '[object Object]';
};

pykit.isDefined = function(obj) {
	return obj !== undefined;
};

pykit.isUndefined = function(obj){
	return obj === undefined;
};

pykit.isNumber = function(obj) {
	return Object.prototype.toString.call(obj) == '[object Number]';
};

pykit.isBoolean = function(obj) {
	return Object.prototype.toString.call(obj) == '[object Boolean]';
};

pykit.isFunction = function(obj) {
	return Object.prototype.toString.call(obj) == '[object Function]';
};

pykit.assert = function(cond, msg, details){
	if (!cond) {
		if (details) pykit.log("debug", details);
		pykit.fail(msg);
	}
};

pykit.fail = function(message){
	pykit.log("error", message);
	if (pykit.debug !== false) {
		debugger;
		throw new Error(message);
	}
};

pykit.replaceString = function(str, obj) {
	var regex = /\{[^}]*}/gi;
	return str.replace(regex, function(match) {
		return pykit.selectors.property(match.substring(1, match.length-1))(obj);
	});
};

pykit.extend = function(target, src) {
	for (var i in src) {
		if (src.hasOwnProperty(i) && pykit.isDefined(src[i])) {
			target[i] = src[i];
		}
	}
	return target;
};

pykit.defaults = function(target, defaults) {
	for (var i in defaults) {
		if (defaults.hasOwnProperty(i) && !pykit.isDefined(target[i])) {
			target[i] = defaults[i];
		}
	}
	return target;
};

pykit.pluck = function(array, property) {
    var result = [];
    for (var i = 0; i < array.length; i ++) {
        result.push(array[i][property])
    }
    return result;
};

pykit.defUI = function(config) {
	var bases = Array.prototype.slice.call(arguments, 1);
	var cls = pykit.class(config, bases);
	pykit.UI[config.__name__] = cls;
	return cls;
};

pykit.stringTemplate = function(string, scope) {
	return pykit.replaceString(string, scope);
};

pykit.template = function(template, config, thisArg) {
	if (pykit.isFunction(template)) {
		return template.call(thisArg, config);
	}
	else if (pykit.isString(template)) {
		return pykit.stringTemplate(template, config);
	}
	else if (pykit.isObject(template)) {
		var ui = pykit.UI(template);
		template.$ui = ui;
		return ui._html.outerHTML;
	}
	else {
		pykit.assert(false, 'Unrecognized template!', config);
	}
};

pykit.class = function(config, bases) {
	pykit.assert(config.__name__, "__name__ not defined.", config);
	var compiled = pykit.extend({}, config);
	var init = config.__init__ ? [config.__init__] : [];
	var after = config.__after__ ? [config.__after__] : [];
	var $defaults = config.$defaults || {};
	var $setters = config.$setters || {};
	var $types = config.$types || {};

	var baseNames = [];
	for (var j=0; j < bases.length; j++) {
		pykit.assert(pykit.isDefined(bases[j]),
			pykit.replaceString("Invalid extension source from {name}", {name: config.__name__}));

		if (bases[j].__name__) {
			baseNames.push(bases[j].__name__);
		}
		else if (pykit.isFunction(bases[j])) {
			baseNames.push(bases[j].prototype.__name__);
			baseNames = baseNames.concat(bases[j].prototype.__base__);
		}
	}

	for (var base, i=0; i < bases.length; i++) {
		base = bases[i];
		if (pykit.isFunction(base)) {
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
			pykit.defaults($defaults, base.$defaults);
		}
		if (base.$types) {
			pykit.defaults($types, base.$types);
		}
        if (base.$setters) {
            pykit.defaults($setters, base.$setters);
        }
		pykit.defaults(compiled, base);
	}

	// Override special properties that are carried through the inheritance structure.
	compiled.__init__ = function() {
		// Initialize ancestor bases first.
		for (var k=init.length-1; k >= 0; k--) {
			init[k].apply(this, arguments);
		}
	};
    compiled.__after__ = function() {
		// Initialize ancestor bases first.
        for (var h=after.length-1; h >= 0; h--)
            after[h].apply(this, arguments);
    };
    compiled.__name__ = config.__name__;
    compiled.__base__ = baseNames;
	compiled.$defaults = $defaults;
	compiled.$types = $types;
	compiled.$setters = $setters;
	var constructor = function(config){
		pykit.defaults(config, this.$defaults);
		pykit.defaults(this, config);
		this.template = config.template || this.template;
		if (this.__init__) this.__init__(config);
		if (this.__after__) this.__after__(config);
		if (this.dispatch) this.dispatch("onInitialized");
	};
	constructor.prototype = compiled;

	return constructor;
};

pykit.echo = function(input) {
	return function() {
		return input;
	}
};

pykit.bind = function(func, object){
	return function() {
		return func.apply(object,arguments);
	};
};

pykit.delay = function(func, obj, params, delay){
	return window.setTimeout(function(){
		func.apply(obj, params);
	}, delay || 1);
};

pykit.uid = function(){
	if (!this._counter) this._counter = 0;
	this._counter++;
	return this._counter;
};

pykit.node = function(node) {
    return typeof node == "string" ? document.getElementById(node) : node;
};

pykit._events = {};
pykit.event = function(node, event, handler, master) {
	pykit.assert(node, pykit.replaceString("Invalid node as target for {event} event", {event: event}));
	pykit.assert(handler, pykit.replaceString("Invalid handler as target for {event} event", {event: event}));
	node = pykit.node(node);

	var id = pykit.uid();

	if (master)
		handler = pykit.bind(handler,master);
		
	pykit._events[id] = [node,event,handler];	//store event info, for detaching

	// Not officially supporting, or going out of the way to support IE10-
	node.addEventListener(event, handler);

	return id;
};

pykit.removeEvent = function(id){
	if (!id) return;
	pykit.assert(pykit._events[id], pykit.replaceString("Event with id {id} does not exist", {id: id}));

	var e = pykit._events[id];
	e[0].removeEventListener(e[1], e[2]);
		
	delete pykit._events[id];
};


pykit.log = function(type, message, explanation){
	if (message === undefined){
		message = type; type = "log";
	}
	if (window.console){
		if (window.console[type]) window.console[type](message || "");
		else window.console.log(type + ": " + message);
		if (explanation) window.console.log(explanation);
	}	
};


pykit.Dispatcher = {
    __name__: "Dispatcher",
	__init__: function(config) {
        this._eventsByName = {};
        this._eventsById = {};

		var listeners = config.on;
		if (listeners) {
			for(var i in listeners){
				if (listeners.hasOwnProperty(i)) {
					this.addListener(i, listeners[i]);
				}
			}
		}
	},
	dispatch: function(type, params){
		var handlers = this._eventsByName[type];
		if (handlers) {
            for(var i = 0; i < handlers.length; i++){
                handlers[i].apply(this, params);
            }
        }
	},
	addListener: function(name, func, id){
		pykit.assert(func, "Invalid event handler for " + name);

        id = id || pykit.uid();

		var handlers = this._eventsByName[name] || pykit.list();
		handlers.push(func);
		this._eventsByName[name] = handlers;
		this._eventsById[id]={ _func:func, _name:name };
		
		return id;
	},
	removeEvent: function(id){
		if(!this._eventsById[id]) return;
		
		var name = this._eventsById[id]._name;
		var func = this._eventsById[id]._func;
		
		var handlers = this._eventsByName[name];
        handlers.remove(func);

		delete this._eventsById[id];
	},
	hasEvent:function(type){
		var handlers = this._eventsByName[type];
		return handlers && handlers.length;
	}
};


pykit.ListMethods = {
	removeAt:function(index){
		if (index >= 0 && index < this.length) {
			return this.splice(index, 1)[0];
		}
		return false;
	},
	remove:function(value, thisArg){
		var index = (thisArg || this).indexOf(value);
		if (index >= 0) {
			this.splice(index, 1);
			return index;
		}
		return false;
	},
	contains: function(value) {
		return this.indexOf(value) != -1;
	},
	replace: function(oldValue, newValue) {
		this[this.indexOf(oldValue)] = newValue;
	},
	insertAt:function(index, item){
		index = index || 0;
		this.splice(index, 0, item);
	},
	removeWhere: function(key, value) {
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
	removeOne: function(key, value) {
		var i = 0;
		while (i < this.length) {
			if (value == this[i][key]) {
				return this.splice(i, 1);
			}
			else {i += 1;}
		}
		pykit.fail(pykit.replaceString("{key}: {value} cannot be removed in {array}",
			{key: key, value: value, array: this}));
	},
	indexWhere: function(key, value) {
		var results = [];
		for (var i=0; i < this.length; i++) {
			if (this[i][key] == value)
				results.push(i);
		}
		return results;
	},
	findWhere: function(key, value) {
		var results = [];
		for (var i=0; i < this.length; i++) {
			if (this[i][key] == value)
				results.push(this[i]);
		}
		return results;
	},
	findOne: function(key, value, error) {
		for (var i=0; i < this.length; i++) {
			// Apparently 1 == "1" in JS
			if (this[i][key] === value)
				return this[i];
		}
		if (error)
			pykit.fail(pykit.replaceString("{key}: {value} not found in {array}",
				{key: key, value: value, array: this}));
	},
	copy: function() {
		return this.slice();
	},
	first: function() {
		return this[0];
	},
	last: function() {
		return this[this.length-1];
	},
	until: function(operator, thisArg) {
		var copy = this.slice();
		var value, i=0;
		while (copy.length) {
			value = copy.shift();
			if (!operator.call(thisArg, value, copy)) {
				copy.push(value);
				i++;
			}
			else {
				i = 0;
			}
			if (copy.length == 0){
				break;
			}
			else if (i > copy.length) {
				pykit.fail("Infinite loop detected.");
				break;  // Infinite loop detected.
			}
		}
	},
	any: function(operator, thisArg) {
		for (var i=0; i < this.length; i++) {
			if (operator.call(thisArg || this, this[i], i)) {
				return true;
			}
		}
		return false;
	},
	all: function(operator, thisArg) {
		for (var i=0; i < this.length; i++) {
			if (!operator.call(thisArg || this, this[i], i)) {
				return false;
			}
		}
		return true;
	},
	each: function(operator, thisArg) {
		var result = [];
		for (var i=0; i < this.length; i++) {
			result[i] = operator.call(thisArg || this, this[i], i);
		}
		return result;
	},
	remap: function(operator, thisArg) {
		for (var i=0; i < this.length; i++) {
			this[i] = operator.call(thisArg || this, this[i]);
		}
	},
	filter:function(operator, thisArg) {
		var results = [];
		for (var i=0; i < this.length; i++) {
			if (operator.call(thisArg || this, this[i])){
				results.push(this[i]);
			}
		}
		return results;
	},
	insertSorted: function(item, cmp, thisArg) {
		for (var sort,i=this.length-1; i >= 0; i--) {
			sort = cmp.call(thisArg || this, item, this[i]);
			if (sort >= 0){
				this.insertAt(i, item);
				return i;
			}
		}
		this.push(item);
		return i;
	}
};


pykit.list = function(array){
	return pykit.extend((array || []), pykit.ListMethods);
};


pykit.selectors = {
	property: function(name) {
		var nested = name.split(".");
		return function(obj) {
			var result = obj;
			for (var i=0; i < nested.length; i++)
				result = result[nested[i]]
			return result;
		}
	}
};


pykit.css = {
	flex: {
		true: "uk-flex",
		false: "",
		inline: "uk-flex-inline"
	},
	selectable: {
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
		"last-xlg": "uk-flex-order-last-xlarge"
	},
	wrap: {
		break: "uk-text-break",
		nowrap: "uk-text-nowrap",
		truncate: "uk-text-truncate"
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
	layout: {
		"": "",
		column: "uk-flex-column",
		row: "uk-flex-row",
		"row-reverse": "uk-flex-row-reverse",
		"column-reverse": "uk-flex-column-reverse"
	},
	align: {
		center: "uk-flex-center",
		right: "uk-flex-right",
		top: "uk-flex-top",
		middle: "uk-flex-middle",
		bottom: "uk-flex-bottom",
		"navbar-center": "uk-navbar-center"
	},
	spacing: {
		between: "uk-flex-space-between",
		around: "uk-flex-space-around"
	},
	display: {
		block: "uk-display-block",
		inline: "uk-display-inline",
		"inline-block": "uk-display-inline-block"
	},
	halign: {
		center: "uk-align-center",
		left: "uk-align-left",
		right: "uk-align-right",
		"left-md": "uk-align-medium-left",
		"right-md": "uk-align-medium-right"
	},
	valign: {
		middle: "uk-vertical-align-middle",
		parent: "uk-vertical-align",
		bottom: "uk-vertical-align-bottom"
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
		"": ""
	},
	fill: {
		height: "uk-height-1-1",
		width: "uk-width-100",
		screen: ["uk-height-1-1", "uk-width-100"]
	},
	float: {
		left: "uk-float-left",
		right: "uk-float-right",
		clearfix: "uk-clearfix"
	},
	scroll: {
		xy: "uk-overflow-container",
		y: "uk-scrollable-text"
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
	margin: {
		"0": "uk-margin-remove",
		"none": "uk-margin-remove",
		"top-rm": "uk-margin-top-remove",
		"bottom-rm": "uk-margin-bottom-remove",
		"": "",
		"all-sm": ["uk-margin-small-left", "uk-margin-small-right", "uk-margin-small-top", "uk-margin-small-bottom"],
		"all": ["uk-margin-left", "uk-margin-right", "uk-margin-top", "uk-margin-bottom"],
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
		"right-sm": "uk-margin-small-right"
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
		"except-large": "uk-hidden-large"
	},
	device: {
		touch: "uk-hidden-notouch",
		notouch: "uk-hidden-touch"
	}
};


pykit.html = {
	createElement:function(name,attrs,html){
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
			node.innerHTML=html;
		return node;
	},
	preventEvent: function(e) {
		if (e && e.preventDefault) e.preventDefault();
		e.defaultPrevented = true;
        e.cancelBubble=true;
	},
	addCSS: function(node, name) {
		if (name && name.length > 0)
			node.classList.add(name);
	},
	hasCSS: function(node, name) {
		return node.classList.contains(name);
	},
	removeCSS: function(node, name) {
		if (name && name.length > 0)
			node.classList.remove(name);
	}
};


pykit.ready = function(code){
	if (pykit._ready) code.call();
	else pykit._onload.push(code);
};
pykit._ready = false;
pykit._onload = [];


(function() {
	var ready = function(){
		pykit._ready = true;
		document.body.setAttribute("data-uk-observe", "");
		for (var i=0; i < pykit._onload.length; i++) {
			pykit._onload[i]();
		}

		pykit._globalMouseUp = function(e) {
			var dragged = pykit._dragged;
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
				pykit.html.removeCSS(dragged.node, 'uk-active-drag');
                dragged.node.style.top = dragged.originalPos.top;
				dragged.node.style.left = dragged.originalPos.left;
				dragged.node.style.display= display;
				pykit._dragged = null;


			}
			pykit._selectedForDrag = null;
		};

		pykit._globalMouseMove = function(e) {
			var selectedForDrag = pykit._selectedForDrag;
			var src = e.touches ? e.touches[0] : e;
			if (selectedForDrag) {
				if (Math.abs(src.clientX - selectedForDrag.pos.x) > pykit._dragThreshold ||
					Math.abs(src.clientY - selectedForDrag.pos.y) > pykit._dragThreshold) {
					// Begin drag event
					pykit._dragged = selectedForDrag;
					pykit._selectedForDrag = null;
					pykit.html.addCSS(selectedForDrag.node, 'uk-active-drag');

					// Fire drag listener event
					selectedForDrag.target.dispatch("onItemDragStart",
						[selectedForDrag.config, selectedForDrag.node, selectedForDrag.event]);
				}
			}
			else if (pykit._dragged) {
				var dragged = pykit._dragged;
                dragged.node.style.top = (src.clientY + dragged.mouseOffset.top) + 'px';
                dragged.node.style.left = (src.clientX + dragged.mouseOffset.left) + 'px';

                var dropTarget = findDroppableParent(document.elementFromPoint(src.clientX, src.clientY));
                if (dropTarget && dropTarget.master._droppable(dropTarget.config, dragged.config, dragged.node)) {
                    var oldDropTarget = pykit._dropTarget;
                    if (oldDropTarget != dropTarget) {
                        if (oldDropTarget) {
                            oldDropTarget.master.dispatch('onItemDragLeave', [oldDropTarget.config, oldDropTarget, e]);
                        }
                        dropTarget.master.dispatch('onItemDragEnter', [dropTarget.config, dropTarget, e]);
                        pykit._dropTarget = dropTarget;
                    }
                    else if (oldDropTarget) {
                        oldDropTarget.master.dispatch('onItemDragOver', [oldDropTarget.config, oldDropTarget, e]);
                    }
                }
            }
		};

		pykit._dragThreshold = 10;

		pykit.event(window, "mouseup", pykit._globalMouseUp);
		pykit.event(window, "mousemove", pykit._globalMouseMove);

		if (UIkit.support.touch) {
			pykit.event(window, "touchend", pykit._globalMouseUp);
			pykit.event(window, "touchmove", pykit._globalMouseMove);
		}

        function findDroppableParent(node) {
            // Exit after 100 tries, otherwise assume circular reference
            for(var i=0; i<100; i++) {
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
	else pykit.event(window, "load", ready);
}());


pykit.PropertySetter = {
    __name__: "PropertySetter",
    __check__: function(bases) {
        pykit.assert(bases.indexOf("PropertySetter") == bases.length - 1,
			pykit.replaceString("PropertySetter should be the last extension in {name}", {name: this.__name__}));
    },
	__init__: function(config){
		this.config = config;
        this._config = config;
    },
    __after__: function(config) {
        if (this.$setters) {
			var names = Object.keys(config);
            for (var name,i=0; i < names.length; i++) {
				name = names[i];
				this.set(name, config[name]);
            }
        }
    },
	set: function(name, value){
        if (this.$setters.hasOwnProperty(name)) {
            pykit.assert(pykit.isFunction(this.$setters[name]),
                pykit.replaceString("Property setter for {name} is not a function.", {name: name}));
            this[name] = this.$setters[name].call(this, value);
			this._config[name] = value;
		}
		else {
			this._config[name] = value;
		}
	}
};



pykit.ComplexDataSetter = {
    __name__: "ComplexDataSetter",
    __check__: function(bases) {
        var iComplexDataSetter = bases.indexOf("ComplexDataSetter");
        pykit.assert(iComplexDataSetter != -1, "ComplexDataSetter is an abstract class, it cannot stand alone");
        pykit.assert(bases.indexOf("LinkedList") != -1, "ComplexDataSetter must extend LinkedList");
    },
    parse: function(value) {
		pykit.assert(pykit.isArray(value), "ComplexDataSetter parse() expected array, got: " + value, this);
		this.clearAll();
		for (var i=0; i<value.length; i++) {
			this.add(value[i]);
		}
    }
};



pykit.AbsolutePositionMethods = {
	positionNextTo: function(node, position, marginX, marginY) {
		var origin = node.getBoundingClientRect();
		var rect = this.getBoundingClientRect();
		var width = rect.width,
			height = rect.height;

		marginX = marginX || 0;
		marginY = marginY || 0;

		var variants =  {
			"bottom-left"   : {top: origin.height + marginY, left: marginX},
			"bottom-right"  : {top: origin.height + marginY, left: origin.width - width + marginX},
			"bottom-center" : {top: origin.height + marginY, left: origin.width / 2 - width / 2 + marginX},
			"top-left"      : {top: -marginY - height, left: 0},
			"top-right"     : {top: -marginY - height, left: origin.width - width},
			"top-center"    : {top: -marginY - height, left: origin.width / 2 - width / 2},
			"left-top"      : {top: marginY, left: -marginX - width},
			"left-bottom"   : {top: origin.height - height, left: - marginX - width},
			"left-center"   : {top: origin.height / 2 - height / 2, left: - marginX - width},
			"right-top"     : {top: marginY, left: origin.width + marginX},
			"right-bottom"  : {top: origin.height - height, left: origin.width + marginX},
			"right-center"  : {top: origin.height / 2 - height / 2, left: origin.width + marginX}
		};

		this._html.style.top = (origin.top + variants[position].top) + "px";
		this._html.style.left = (origin.left + variants[position].left) + "px";
		this._html.style.position = "absolute";
	},
	getBoundingClientRect: function() {
		return this._html.getBoundingClientRect();
	},
	position: function(pos) {
		this._html.style.top = (pos.top || 0) + "px";
		this._html.style.left = (pos.left || 0) + "px";
		this._html.style.position = "absolute";
	},
	moveWithinBoundary: function(boundary, pivot, padding, offset) {
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
			this._html.style.top = (pivotTop + offsetTop) + "px";
		}
		else if (hiddenBottom) {
			this._html.style.top = (pivotBottom - rect.height + offsetBottom) + "px";
		}
	}
};



pykit.UI = function (config, parent) {
    var node = makeView(config);
	pykit.assert(node, pykit.replaceString("Unknown node view {view}.", {view: config.view}), config);
	if (parent)
		parent.appendChild(node.element);
    pykit.UI.views[config.id] = node;
    return node;

	function makeView(config) {
		if (config.view){
			var view = config.view;
			pykit.assert(pykit.UI[view], "unknown view:"+view);
			return new pykit.UI[view](config);
		}
		else if (config.cells)
			return new pykit.UI.flexgrid(config);
		else if (config.template)
			return new pykit.UI.element(config);
	}
};



pykit.UI.uid = function(name){
	this._names = this._names || {};
	this._names[name] = this._names[name] || 0;
	this._names[name]++;
	return "$" + name + this._names[name];
};



pykit.UI.views = {};
window.$$= pykit.$$ = function(id){
	if (!id)
		return null;
	else if (pykit.UI.views[id])
		return pykit.UI.views[id];
};

pykit.forIn = function(func, obj, thisArg) {
	var result = {};
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			result[i] = func.call(thisArg, obj[i], i);
		}
	}
	return result;
};



pykit.setCSS = function(cssOptions) {
	return pykit.forIn(function(options, property) {
		return function(value) {
			var oldValue = this._config[property];
			if (options[oldValue])
				pykit.html.removeCSS(this._html, options[oldValue]);

			var values = String(value).split(" ");

			for (var v, i=0; i < values.length; i++) {
				v = values[i];
				pykit.assert(options.hasOwnProperty(v),
					pykit.replaceString("Invalid value for '{property}': '{value}'!",
						{property: property, value: v}));

				var classes = options[v];
				if (pykit.isArray(classes))
					for (var c=0; c < classes.length; c++)
						pykit.html.addCSS(this._html, classes[c]);
				else
					pykit.html.addCSS(this._html, classes);
			}

			return value;
		}
	}, cssOptions);
};


pykit.CommonCSS = {
	__name__: "CommonCSS",
	__check__: function(bases) {
		pykit.assert(bases.indexOf("CommonCSS") != -1, "CommonCSS is an abstract class.");
		pykit.assert(bases.indexOf("PropertySetter") != -1, "CommonCSS must extend PropertySetter.");
	},
	$setters: pykit.setCSS(pykit.css)
};



pykit.CommonEvents = {
	__name__: "CommonEvents",
	__after__: function(config) {
		var $this = this;
		if (config.on) {
			if (config.on.onResize) {
				pykit.event(window, "resize", function(e) {
					this.dispatch("onResize", [e]);
				}, $this);
			}
			if (config.on.onDebounceResize) {
				pykit.event(window, "resize", UIkit.Utils.debounce(function(e) {
					$this.dispatch("onDebounceResize", [e]);
				}, 1000));
			}
			if (config.on.onFocus) {
				pykit.event(this._html, "focus", function(e) {
					this.dispatch("onFocus", [e]);
				}, $this);
			}
			if (config.on.onBlur) {
				pykit.event(this._html, "blur", function(e) {
					this.dispatch("onBlur", [e]);
				}, $this);
			}
		}
	}
};



pykit.UI.element = pykit.defUI({
	__name__: "element",
	$defaults: {
		tooltipPos: 'bottom',
		dropdownEvent: "onClick",
		dropdownPos: 'bottom-center',
		dropdownId: undefined,
		dropdownMarginX: 5,
		dropdownMarginY: 5,
		margin: "all-sm",
		uploadOptions: {},
		$preventDefault: true
	},
	$setters: {
		disabled: function(value) {
			if (value)
				this.disable();
			else
				this.enable();
			return value;
		},
		css: function(value){
			if (pykit.isArray(value)) {
				for (var i=0; i<value.length; i++)
					pykit.html.addCSS(this._html, value[i]);
			}
			else pykit.html.addCSS(this._html, value);
			return value;
		},
		tooltip: function(value) {
			if (value) {
				this._html.setAttribute("data-uk-tooltip", "");
				this._html.setAttribute("title", value);
				this._html.setAttribute("data-uk-tooltip", '{' + pykit.replaceString("pos: '{pos}'" + '}',
					{pos: this._config.tooltipPos}));
			}
			else
				pykit.html.removeCSS(this._html, "data-uk-tooltip");

			return value;
		},
		dropdown: function(value) {
			var $this = this;
			var masterConfig = $this._config;

			var dropdown = {
				id: masterConfig.dropdownId,
				view: "dropdown",
				pos: masterConfig.dropdownPos,
				dropdown: value
			};

			var ui = pykit.UI(dropdown, document.body);

			this._config.on = masterConfig.on || {};
			this.addListener(masterConfig.dropdownEvent, function(config, node, e) {
				ui.open(config, node, $this, e);
				ui.positionNextTo(node, dropdown.pos, masterConfig.dropdownMarginX, masterConfig.dropdownMarginY);
				ui.moveWithinBoundary();
			});
			$this.dropdownPopup = ui;
			return value;
		},
		inline: function(value) {
			if (value)
				pykit.html.addCSS(this._html, "uk-display-inline");
		},
		uploader: function(value) {
			if (value) {
				// Must allow default events to open uploader
				this._config.$preventDefault = false;
				// Add css to mock a file input
				pykit.html.addCSS(this._html, "uk-form-file");
				this._html.appendChild(this._uploadFileHTML());
			}
			return value;
		}
	},
	__init__: function(config){
		if (!config.id) config.id = pykit.UI.uid(this.__name__);
		var node = pykit.node(config.id);
		pykit.assert(!node, pykit.replaceString("Node with id '{id}' already exists", {id: config.id}), config);

		this.element = this._html = pykit.html.createElement(config.htmlTag || "DIV", {id: config.id});
		if (config.tagClass)
			this.element.setAttribute("class", config.tagClass);

		pykit.extend(this._html.style, {
			top: config.top, bottom: config.bottom, left: config.left, right: config.right,
			width: config.width, height: config.height, minHeight: config.minHeight, maxHeight: config.maxHeight,
			minWidth: config.minWidth, maxWidth: config.maxWidth,
			marginBottom: config.marginBottom, marginTop: config.marginTop,
			marginLeft: config.marginLeft, marginRight: config.marginRight});

		this.render();
	},
    render: function() {
        this._html.innerHTML = pykit.template(this.template, this._config, this);
    },
    template: function() {
        return ""
    },
	getNode:function(){
		return this._html;
	},
	isVisible: function(){
		return !pykit.html.hasCSS(this._html, "uk-hidden");
	},
	show:function(){
		pykit.html.removeCSS(this._html, "uk-hidden");
	},
	hide:function(){
		pykit.html.addCSS(this._html, "uk-hidden");
	},
	conceal: function() {
		pykit.html.addCSS(this._html, "uk-invisible");
	},
	reveal: function() {
		pykit.html.removeCSS(this._html, "uk-invisible");
	},
	isEnabled:function(){
		return !this._html.getAttribute('disabled');
	},
	disable:function(){
		this._html.setAttribute('disabled', "");
	},
	enable:function() {
		this._html.removeAttribute('disabled');
	},
	_uploadFileHTML: function() {
		var config = this._config;
		var self = this;
		
		var settings = pykit.extend({
			type: 'json',
			before: function(settings, files) {
				self.dispatch("onFilesAdded", [settings, files]);
				return false;
			}
		}, config.uploadOptions);

		var attrs = settings.filelimit > 1 ? {type: "file", multiple: "multiple"} : {type: "file"};
		var input = pykit.html.createElement("INPUT", attrs);
		UIkit.uploadSelect(input, settings);

		return input;
	}
}, pykit.Dispatcher, pykit.CommonEvents, pykit.CommonCSS, pykit.PropertySetter);



pykit.UI.flexgrid = pykit.defUI({
	__name__: "flexgrid",
	$defaults: {
		layout: "row",
		flex: true,
		size: "flex",
		singleView: false
	},
	$setters: {
		cells: function(value) {
			pykit.assert(pykit.isArray(value), "The cells property must be an array for shell ui object.", this);

			for (var config,i=0; i<value.length; i++) {
				config = value[i];
				config.margin = config.margin || "";

				var ui = pykit.UI(config);
				if (!this._config.singleView)
					this._html.appendChild(ui._html);
				this._cells.push(ui);
			}

			if(this._config.singleView && this._config.defaultView)
				this.setChild(this._config.defaultView);

			return value;
		}
	},
	__init__: function() {
		this._cells = pykit.list();
	},
	render: function() {
		// Do nothing, overwrites render function.
	},
	each: function(func, thisArg) {
		return this._cells.each(func, thisArg);
	},
	insertChild: function(index, config) {
		var ui = config.element ? config : pykit.UI(config);
		this._cells.splice(index, 0, ui);
		return ui;
	},
	addChild: function(config) {
		var ui = config.element ? config : pykit.UI(config);
		this._cells.push(ui);
		return ui;
	},
	removeChild: function(id) {
		if (id.element) {
			this._html.removeChild(id._html);
			this._cells.remove(id);
		}
		else if (pykit.isString(id)) {
			this._html.removeChild(this.getChild(id)._html);
			this._cells.removeWhere('id', id);
		}
		else {
			pykit.fail("flexgrid: unknown argument id " + id + " received in removeChild().");
		}
	},
	getChild: function(id) {
		return this._cells.findOne('id', id);
	},
	getChildren: function() {
		return this._cells;
	},
	getItems: function() {
		return this._cells.each(function(item) {
			return item.config;
		});
	},
	activeChild: function() {
		return this._activeChild;
	},
	setChild: function(id) {
		this._setVisible('id', [id]);
		var newChild = this.getChild(id);
		this.dispatch("onChildChange",[this._activeChild, newChild]);
		this._activeChild = newChild;
	},
	showBatch:function(name, preserveOrder){
		/**
		 * Tricky: Rendering input fields will cause problems with on-screen keyboards.
		 * However, to preserve the order of elements, will need to rerender.
		 */
		this._setVisible('batch', pykit.isArray(name) ? name : [name], preserveOrder);
		this.batch = name;
	},
	_setVisible: function(key, value, rerender) {
		this._cells.each(function(item) {
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
}, pykit.UI.element);



pykit.ClickEvents = {
	$setters: {
		target: function(value) {
			this._html.setAttribute("target", value);
			return value;
		},
		href: function(value) {
			this._html.setAttribute("href", value);
			return value;
		}
	},
	__after__: function(config){
		config.on = config.on || {};
		pykit.event(this._html, "click", this._onClick, this);
		pykit.event(this._html, "contextmenu", this._onContext, this);

		// Optimization: these rarely get used.
		if (config.on.onMouseDown) {
			pykit.event(this._html, "mousedown", this._onMouseDown, this);
		}
		if (config.on.onMouseUp) {
			pykit.event(this._html, "mouseup", this._onMouseUp, this);
		}
	},
	_onClick: function(e){
		if (this._config.$preventDefault !== false) {
			pykit.html.preventEvent(e);
		}
        this.dispatch("onClick", [this._config, this._html, e]);
	},
	_onMouseDown: function(e){
		if (this._config.$preventDefault !== false) {
			pykit.html.preventEvent(e);
		}
		this.dispatch("onMouseDown", [this._config, this._html, e]);
	},
	_onMouseUp: function(e){
		this.dispatch("onMouseUp", [this._config, this._html, e]);
		if (this._config.$preventDefault !== false) {
			pykit._globalMouseUp(e);
			pykit.html.preventEvent(e);
		}
	},
	_onContext: function(e) {
		if (this._config.$preventDefault !== false) {
			pykit.html.preventEvent(e);
		}
        this.dispatch("onContext", [this._config, this._html, e]);
	}
};



pykit.UI.modal = pykit.defUI({
	__name__: "modal",
    $defaults: {
        tagClass: "uk-modal",
        light: false,
		closeButton: true,
		flex: false,
		center: true,
		margin : "",
		size: "",
		layout: ""
    },
	__init__: function(config) {
		this.header = this._header = pykit.html.createElement("DIV", {class: "uk-modal-header"});
		this.footer = this._footer = pykit.html.createElement("DIV", {class: "uk-modal-footer"});
		this.body = this._body = pykit.html.createElement("DIV", {class: "uk-modal-dialog"});
		this._html.appendChild(this._body);
		if (config.header) this._body.appendChild(this._header);
		if (config.footer) this._body.appendChild(this._footer);
	},
	$setters: {
        light: function(value) {
            if (value)
                pykit.html.addCSS(this._html, "uk-modal-dialog-lightbox");
			return value;
        },
		bodyWidth: function(value) {
			value = pykit.isNumber(value) ? value + "px": value;
			this._body.style.width = value;
			return value;
		},
		bodyHeight: function(value) {
			value = pykit.isNumber(value) ? value + "px": value;
			this._body.style.height = value;
			return value;
		},
        closeButton: function(value) {
			if (value) {
				this._close = pykit.html.createElement("A",
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
        body: function(value) {
			value.margin = value.margin || "";
			value.halign = value.halign || "center";
            var innerBody = pykit.UI(value);
			this.bodyContent = innerBody;

			if (this._footer.parentNode) {
				this._body.insertBefore(innerBody._html, this._footer);
			}
			else {
				this._body.appendChild(innerBody._html);
			}
			return value;
        },
        header: function(value) {
			value.margin = value.margin || "";
			var innerHeader = pykit.UI(value);
			this._header.appendChild(innerHeader._html);
			this.headerContent = innerHeader;
			return value;
        },
        footer: function(value) {
			value.margin = value.margin || "";
			var innerFooter = pykit.UI(value);
			this._footer.appendChild(innerFooter._html);
			this.footerContent = innerFooter;
			return value;
        },
		caption: function(value) {
			if (!this._caption)
				this._caption = pykit.html.createElement("DIV", {class: "uk-modal-caption"});
			this._caption.innerHTML = value;
			this._body.appendChild(this._caption);
			return value;
		}
	},
	open: function(args) {
		this.dispatch("onOpen", [this._config, this._html, args]);
		UIkit.modal('#' + this._config.id, {center: this._config.center}).show();
		this.dispatch("onOpened", [this._config, this._html, args]);
	},
	close: function() {
		UIkit.modal('#' + this._config.id).hide();
	}
}, pykit.UI.flexgrid);



pykit.UI.button = pykit.defUI({
	__name__:"button",
	$defaults: {
		label: "",
        htmlTag: "BUTTON",
        tagClass: "uk-button",
		iconSize: "small"
	},
	$setters: pykit.setCSS({
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
    template: function(config) {
		if (config.type  == "icon")
			return pykit.replaceString("<i class='{icon} uk-icon-{iconSize}'></i><span>{label}</span>",
				{icon: config.icon, label: config.label, iconSize: config.iconSize});
        else
			return pykit.replaceString("<span>{label}</span>", {label: config.label});
    },
	select: function() {
		this._config.$selected = true;
		pykit.html.addCSS(this._html, "uk-active");
	},
	isSelected: function() {
		return !!this._config.$selected;
	},
	unselect: function() {
		this._config.$selected = false;
		pykit.html.removeCSS(this._html, "uk-active");
	}
}, pykit.ClickEvents, pykit.UI.element);



pykit.UI.icon = pykit.defUI({
	__name__:"icon",
	$defaults:{
		htmlTag: "A",
		tagClass: "uk-icon-hover",
		iconSize: "small",
		selectable: false,
		content: ""
	},
	__init__: function(config) {
		if (config.type == "button")
			config.tagClass = "uk-icon-button";
	},
	template:function(config){
		return pykit.replaceString("<i class='{icon} uk-icon-{iconSize}'>{content}</i>",
			{icon: config.icon, iconSize: config.iconSize, content: config.content});
	}
}, pykit.ClickEvents, pykit.UI.element);



pykit.UI.label = pykit.defUI({
	__name__:"label",
	$defaults: {
		label: "",
		htmlTag: "SPAN"
	},
	$setters: pykit.setCSS({
		type: {
			form: "uk-form-label",
			"": ""
		}
	}),
	template: function(config){
		return config.label;
	},
	getValue: function() {
		return this._config.label;
	},
	setValue: function(value) {
		this._config.label = value;
		this.render();
	}
}, pykit.UI.element);



pykit.UI.link = pykit.defUI({
	__name__:"link",
	$defaults: {
		label: "",
		htmlTag: "A",
		margin: "",
		$preventDefault: false
	},
	template:function(config){
		return config.label;
	}
}, pykit.ClickEvents, pykit.UI.element);



pykit.UI.progress = pykit.defUI({
	__name__:"progress",
	$defaults: {
		htmlTag: "DIV",
		tagClass: "uk-progress",
		margin: "none",
		position: "top z-index"
	},
	$setters: pykit.setCSS({
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
			"": ""
		}
	}),
	render: function() {},
	__init__: function() {
		this._bar = pykit.html.createElement("DIV", {class: "uk-progress-bar"});
		this._html.appendChild(this._bar);
	},
	getValue: function() {
		return this._progress;
	},
	setValue: function(value) {
		pykit.assert(pykit.isNumber(value), "Progress value should be a number.");

		var $this = this;
		$this._bar.style.width = value + '%';
		$this._progress = value;
	}
}, pykit.UI.element);



pykit.UI.image = pykit.defUI({
	__name__:"image",
	$defaults: {
		htmlTag: "IMG",
		margin: "",
		src: ""
	},
	$setters: {
		src: function(value) {
			this._html.setAttribute("src", value);
			return value;
		}
	},
	__after__: function() {
		pykit.event(this._html, "load", function(e) {
			this.dispatch("onLoad", [e])
		}, this);
	}
}, pykit.ClickEvents, pykit.UI.element);



pykit.FormControl = {
	$setters: pykit.extend(pykit.setCSS(
		{
			class: {
				success: "uk-form-success",
				danger: "uk-form-danger",
				"": ""
			}
		}),
		{
			help: function(value) {
				if (value) {
					if (this.help && this.help.parentNode) {
						this.help.parentNode.removeChild(this.help);
					}
					if (this._config.inline) {
						this.help = pykit.html.createElement("SPAN", {class: "uk-form-help-inline"});
					}
					else {
						this.help = pykit.html.createElement("P", {class: "uk-form-help-block"});
					}
					this.help.innerHTML = value;
					this._html.parentNode.appendChild(this.help);
				}
				return this.help;
			}
		}
	),
	getFormControl: function() {
		return this._html;
	},
	setClass: function(value) {
		var formControl = this.getFormControl();
		switch(value) {
			case "success":
				pykit.html.removeCSS(formControl, "uk-form-danger");
				pykit.html.addCSS(formControl, "uk-form-success");
				break;
			case "danger":
				pykit.html.addCSS(formControl, "uk-form-danger");
				pykit.html.removeCSS(formControl, "uk-form-success");
				break;
			default:
				pykit.html.removeCSS(formControl, "uk-form-danger");
				pykit.html.removeCSS(formControl, "uk-form-success");
		}
		var helpControl = this.help;
		if (helpControl) {
			switch(value) {
				case "success":
					pykit.html.removeCSS(helpControl, "uk-text-danger");
					pykit.html.addCSS(helpControl, "uk-text-success");
					break;
				case "danger":
					pykit.html.addCSS(helpControl, "uk-text-danger");
					pykit.html.removeCSS(helpControl, "uk-text-success");
					break;
				default:
					pykit.html.removeCSS(helpControl, "uk-text-danger");
					pykit.html.removeCSS(helpControl, "uk-text-success");
			}
		}
	}
};


pykit.UI.toggle = pykit.defUI({
	__name__: "toggle",
	$defaults: {
		htmlTag: "LABEL",
		tagClass: "uk-toggle"
	},
	__after__: function() {
		pykit.event(this._html, "change", this._onChange, this);
	},
	_onChange: function () {
		this.dispatch("onChange");
	},
	template: function(config) {
		return pykit.replaceString('<input type="checkbox"{checked}><div class="uk-toggle-slider"></div>',
			{checked: config.checked ? " checked" : ""});
	},
	checked: function(value) {
		if (value)
			this._html.firstChild.checked = value;
		return value;
	},
	reset: function() {
		this._html.firstChild.checked = false;
	},
	enable: function() {
		this._html.firstChild.removeAttribute('disabled');
	},
	disable: function() {
		this._html.firstChild.setAttribute('disabled', "");
	},
	getValue: function() {
		return this._html.firstChild.checked;
	},
	setValue: function(value) {
		this._html.firstChild.checked = value;
	}
}, pykit.UI.element);


pykit.UI.input = pykit.defUI({
	__name__: "input",
	$defaults: {
		htmlTag: "INPUT",
		inputWidth: "medium",
		autocomplete: "on",
		autocapitalize: "on",
		autocorrect: "on",
		inline: false
	},
	$setters: pykit.extend(pykit.setCSS(
		{
			class: {
				success: "uk-form-success",
				danger: "uk-form-danger",
				"": ""
			},
			size: {
				large: "uk-form-large",
				small: "uk-form-small",
				"": ""
			}
		}),
		{
			autocomplete: function(value) {
				if (value == "off" || !value)
					this._html.setAttribute("autocomplete", "off");
				return value;
			},
			autocapitalize: function(value) {
				if (value == "off" || !value)
					this._html.setAttribute("autocapitalize", "off");
				return value;
			},
			autocorrect: function(value) {
				if (value == "off" || !value)
					this._html.setAttribute("autocorrect", "off");
				return value;
			},
			type: function(value) {
				this._html.setAttribute("type", value);
				pykit.html.addCSS(this._html, "uk-vertical-align-middle");
				return value;
			},
			checked: function(value) {
				if (value)
					this._html.checked = value;
				return value;
			},
			placeholder: function(value) {
				this._html.setAttribute("placeholder", value);
				return value;
			}
		}
	),
	__after__: function() {
		pykit.event(this._html, "change", this._onChange, this);
		pykit.event(this._html, "keyup", function (e) {
			this.dispatch("onKeyUp", [e, this._html, this]);
		}, this);
	},
	_onChange: function() {
		this.dispatch("onChange");
	},
	reset: function() {
		switch(this._config.type) {
			case "checkbox":
				this._html.checked = this._config.checked;
				break;
			case "number":
				this._html.value = 0;
				break;
			default:
				this._html.value = "";
				break;
		}
	},
	getValue: function() {
		if (this._config.type == "checkbox") {
			return this._html.checked;
		}
		else return this._html.value;
	},
	setValue: function(value) {
		if (this._config.type == "checkbox") {
			this._html.checked = value;
		}
		else this._html.value = value;
	}
}, pykit.FormControl, pykit.UI.element);



pykit.UI.password = pykit.defUI({
	__name__: "password",
	$defaults: {
		tagClass: "uk-form-password",
		inputWidth: "medium",
		$setters: {
			placeholder: function(value) {
				this._html.setAttribute("placeholder", value);
				return value;
			}
		}
	},
	__after__: function() {
		pykit.html.addCSS(this._html, "uk-form");
		pykit.event(this._html, "change", this._onChange, this);
	},
	_onChange: function() {
		this.dispatch("onChange", [this.getValue()]);
	},
	getFormControl: function() {
		return this._html.firstChild;
	},
	template: function() {
		return "<input type='password' style='width:100%'><a class='uk-form-password-toggle' data-uk-form-password>Show</a>";
	},
	reset: function() {
		this._html.firstChild.value = "";
	},
	enable: function() {
		this._html.firstChild.removeAttribute('disabled');
	},
	disable: function() {
		this._html.firstChild.setAttribute('disabled', "");
	},
	getValue: function() {
		return this._html.firstChild.value;
	},
	setValue: function(value) {
		this._html.firstChild.value = value;
	}
}, pykit.FormControl, pykit.UI.element);



pykit.defUI({
	__name__: "autocomplete",
	$defaults: {
		tagClass: "uk-autocomplete",
		placeholder: "",
		minLength: 0,
		caseSensitive: false,
		sources: [],
		autocomplete: function(release) {
			var searchValue = this.getValue();
			var config = this._config;
			if (!config.caseSensitive) searchValue = searchValue.toLowerCase();

			release(pykit.ListMethods.filter.call(this._getSource(),
				function(item) {
					var value = config.caseSensitive ? item.value : item.value.toLowerCase();
					return value.indexOf(searchValue) != -1;
				}));
		}
	},
	$setters: {
		sources: function(value) {
			if (pykit.isFunction(value))
				this._getSource = value;
			else
				this._getSource = pykit.echo(value);
			return value;
		},
		autocomplete: function(value) {
			var self = this;
			this._html.style.wordBreak = "break-word";
			self._autocomplete = UIkit.autocomplete(self._html,
				{source: pykit.bind(value, self), minLength: self._config.minLength});
			self._autocomplete.dropdown.attr("style", "width:100%");
			self._autocomplete.on("selectitem.uk.autocomplete", function(e, obj) {
				self.dispatch("onChange", [obj.value]);
				self.dispatch("onAutocomplete", [obj]);
			});
		}
	},
	template: function(config) {
		return pykit.replaceString(
			'<input type="text" placeholder="{placeholder}" style="width:100%">',
			{placeholder: config.placeholder});
	}
}, pykit.UI.password);



pykit.UI.search = pykit.defUI({
	__name__:"search",
	$defaults: {
		tagClass: "uk-search",
		placeholder: "search..."
	},
	__after__: function() {
		pykit.event(this._html, "change", this._onChange, this);
		pykit.event(this._html, "keyup", function (e) {
			this.dispatch("onKeyUp", [e, this._html, this]);
		}, this);
	},
	_onChange: function () {
		this.dispatch("onChange");
	},
	template: function(obj) {
		return pykit.replaceString('<input class="uk-search-field" type="search" placeholder="{placeholder}">',
			{placeholder: obj.placeholder})
	},
	reset: function() {
		this._html.firstChild.value = "";
	},
	enable: function() {
		this._html.firstChild.removeAttribute('disabled');
	},
	disable: function() {
		this._html.firstChild.setAttribute('disabled', "");
	},
	getValue: function() {
		return this._html.firstChild.value;
	},
	setValue: function(value) {
		this._html.firstChild.value = value;
	}
}, pykit.UI.element);



pykit.UI.dropdown = pykit.defUI({
	__name__: "dropdown",
	$defaults: {
		mode: "click",
		pos: "bottom-center",
		margin: "",
		padding: "none",
		justify: false,
		dropdownCSS: "uk-dropdown-small uk-dropdown-close",
		dropdownStyle: "close",
		blank: false
	},
	$setters: {
		dropdown: function (value) {
			var dropdown = pykit.html.createElement("DIV",
				{class: this._dropdownCSS()});

			if (!value.listStyle) {
				value.listStyle = "dropdown";
			}

			var ui = pykit.UI(value);
			dropdown.appendChild(ui._html);
			this._html.appendChild(dropdown);
			this._inner = ui;
			return value;
		}
	},
	__init__: function(config) {
		this._dropdown = UIkit.dropdown(this._html, {pos: config.pos, justify: config.justify, mode: config.mode});
	},
	_dropdownCSS: function() {
		var config = this._config;
		var result = config.dropdownCSS;
		result += config.blank ? " uk-dropdown-blank" : " uk-dropdown";
		result += config.scrollable ? "uk-dropdown-scrollable" : "";
		return result;
	},
	getBoundingClientRect: function() {
		return this._html.firstChild.getBoundingClientRect();
	},
	isOpened: function() {
		return pykit.html.hasCSS(this._html, 'uk-open');
	},
	open: function(config, node, parent, e) {
		this.dispatch("onOpen", [config, node, this]);
		this._inner.dispatch("onOpen", [config, node, this]);

		this._inner.master = node;
		this._inner.masterConfig = config;
		this._inner.parent = this;
		this._inner.grandparent = parent;
		this._dropdown.show();

		this.dispatch("onOpened", [config, node, this]);
		this._inner.dispatch("onOpened", [config, node, this]);
	},
	close: function(node, master) {
		var $this = this;
		$this.dispatch("onClose", [master, node, $this]);
		$this._inner.dispatch("onClose", [master, node, $this]);
		// Tricky: on mobile browsers HTML update/rendering timings are a bit wonky
		// Adding a delay helps close dropdowns properly on Chrome (mobile)
		setTimeout(function() {
			pykit.html.removeCSS($this._html, 'uk-open');
			$this.dispatch("onClosed", [master, node, $this]);
			$this._inner.dispatch("onClosed", [master, node, $this]);
		}, 10);
	}
}, pykit.UI.flexgrid, pykit.AbsolutePositionMethods);



pykit.LinkedList = {
    __name__: "LinkedList",
    __check__: function(bases) {
        pykit.assert(bases.indexOf('LinkedList') != -1, "LinkedList is an abstract class and must be extended.");
        pykit.assert(bases.indexOf('Dispatcher') != -1, "LinkedList must extend Dispatcher.");
    },
    __init__: function() {
        this.headNode = null;
		this.tailNode = null;
		this._nodeList = [];
    },
	id:function(data) {
		return data.id || (data.id=pykit.UI.uid("data"));
	},
	getItem: function(id){
		return this.findOne('id', id);
	},
	count: function() {
		return this._nodeList.length;
	},
	updateItem: function(item, update){
        pykit.assert(update, pykit.replaceString("Invalid update object for Id {id}", {id:item.id}));
		var refNode = item.$tailNode;
		this.remove(item);
		pykit.extend(item, update, true);
		this.add(item, refNode);
	},
	refresh:function(){
		this.dispatch("onRefresh");
	},
	pluck: function(name) {
		return this.each(function(item) {
			return item[name]
		});
	},
    each: function(func, thisArg) {
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
	add: function(obj, node) {
		return this.insertBefore(obj, node);
	},
	insertBefore:function(obj, node){
        pykit.assert(pykit.isObject(obj), pykit.replaceString("Expected object, got {obj}", {obj: obj}));
        pykit.assert(this._nodeList.indexOf(obj) == -1, "Circular reference detected with node insert!");

		obj.id = this.id(obj);

		if (!node && this.tailNode) {
			// Insert as last node
			return this.insertAfter(obj, this.tailNode);
		}
		else {
			this.dispatch("onAdd", [obj]);

			if (this.headNode == null || this.tailNode == null) {
				this.headNode = obj;
				this.tailNode = obj;
				obj.$headNode = obj.$tailNode = null;
			}
			else {
				if (node.$headNode) {
					node.$headNode.$tailNode = obj;
				}
				obj.$headNode = node.$headNode;
				obj.$tailNode = node;
				node.$headNode = obj;

				if (node == this.headNode)
					this.headNode = obj;
			}

			this._nodeList.push(obj);

			this.dispatch("onAdded",[obj, node]);

			return obj.id;
		}
	},
	insertAfter:function(obj, node){
		pykit.assert(pykit.isObject(obj), pykit.replaceString("Expected object, got {obj}", {obj: obj}));
		pykit.assert(this._nodeList.indexOf(obj) == -1, "Circular reference detected with node insert!");

		obj.id = this.id(obj);

		if (!node && this.headNode) {
			// Insert as first node
			return this.insertBefore(obj, this.headNode);
		}
		else {
			this.dispatch("onAdd", [obj]);

			if (this.headNode == null || this.tailNode == null) {
				this.headNode = obj;
				this.tailNode = obj;
				obj.$headNode = obj.$tailNode = null;
			}
			else {
				if (node.$tailNode) {
					node.$tailNode.$headNode = obj;
				}
				obj.$tailNode = node.$tailNode;
				obj.$headNode = node;
				node.$tailNode = obj;

				if (node == this.tailNode)
					this.tailNode = obj;
			}

			this._nodeList.push(obj);

			this.dispatch("onAdded", [obj]);

			return obj.id;
		}
	},
	remove: function(obj) {
		pykit.assert(pykit.isObject(obj), pykit.replaceString("Expected object, got {obj}", {obj: obj}));

        this.dispatch("onDelete",[obj]);

		if (obj.$headNode) obj.$headNode.$tailNode = obj.$tailNode;
		if (obj.$tailNode) obj.$tailNode.$headNode = obj.$headNode;
		if (obj == this.headNode)
			this.headNode = obj.$tailNode;
		if (obj == this.tailNode)
			this.tailNode = obj.$headNode;
		obj.$tailNode = obj.$headNode = null;

		if (this._nodeList.indexOf(obj) != -1)
			pykit.ListMethods.remove.call(this._nodeList, obj);

		this.dispatch("onDeleted",[obj]);
		return obj;
	},
	clearAll:function() {
		this.headNode = null;
		this.tailNode = null;
		this._nodeList = [];
		this.dispatch("onClearAll",[]);
	},
	previous: function(node) {
		return node.$headNode;
	},
	next: function(node) {
		return node.$tailNode;
	},
	contains: function(node) {
		return this._nodeList.indexOf(node) != -1;
	},
	indexOf: function(matchNode, beginNode) {
		var i = 0;
		var node = beginNode || this.headNode;
		while (node) {
			// Apparently 1 == "1" in JS
			if (node === matchNode)
				return i;
			node = node.$tailNode;
			i++;
		}
	},
	findOne: function(key, value, beginNode) {
		var node = beginNode || this.headNode;
		while (node) {
			// Apparently 1 == "1" in JS
			if (node[key] === value)
				return node;
			node = node.$tailNode;
		}
	},
	findFirst: function (cond, beginNode, thisArg) {
		var node = beginNode || this.headNode;
		while(node) {
			if (cond.call(thisArg || this, node)) {
				return node;
			}
			node = node.$tailNode;
		}
	},
	findLast: function (cond, beginNode, thisArg) {
		var node = beginNode || this.headNode;
		var lastNode = null;
		while(node) {
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




pykit.UI.stack = pykit.defUI({
    __name__: "stack",
	$setters: {
		filter: function(value) {
			pykit.assert(pykit.isFunction(value), "Expected function for 'filter', got: " + value);
			this._filter = value;
			return value;
		},
		droppable: function(value) {
			if (pykit.isFunction(value))
				this._droppable = value;
			return value;
		}
	},
    __after__: function(config){
        this.addListener("onAdded", this._onAdded);
        this.addListener("onDeleted", this._onDeleted);
        this.addListener("onRefresh", this._onRefresh);
        this.addListener("onClearAll", this._onClearAll);
		if (config.data) {
			this.parse(config.data);
		}
    },
    __init__: function() {
        this._itemNodes = {};
    },
    getItemNode: function(id) {
		return this._itemNodes[id];
    },
	render: function() {
		// Do nothing, overwrites render function.
	},
	_droppable: function() {
		return true;
	},
	_filter: function() {
		return true;
	},
	_containerHTML: function() {
        return this._html;
    },
    _itemHTML: function() {
        return pykit.html.createElement("DIV");
    },
    _innerHTML: function() {
        return {id: pykit.UI.uid("item")};
    },
    _createItem: function(obj) {
        var item = this._itemHTML(obj);
        item.setAttribute('data-id', obj.id);
        this._innerHTML(item, obj);
		this._itemNodes[obj.id] = item;
		return item;
    },
	_onAdded: function(obj) {
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
	_onDeleted: function(obj) {
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
	_onRefresh: function() {
		this._onClearAll();
		this._itemNodes = {};
		this.each(function(node) {
			this._itemNodes[node.id] = this._createItem(node);
			if (this._filter(node))
				this._containerHTML().appendChild(this._itemNodes[node.id]);
		}, this);

		this.dispatch("onDOMChanged", [null, "refresh"]);
	},
	_onClearAll: function() {
		for (var j in this._itemNodes) {
			if (this._itemNodes.hasOwnProperty(j) && this._itemNodes[j].parentNode)
				this._containerHTML().removeChild(this._itemNodes[j]);
		}

		this.dispatch("onDOMChanged", [null, "clear"]);
	},
	showBatch:function(name) {
		this.batch = name;
		this.each(function(item) {
			if (name.indexOf(item.batch) != -1)
				pykit.html.removeCSS(this._itemNodes[item.id], "uk-hidden");
			else
				pykit.html.addCSS(this._itemNodes[item.id], "uk-hidden");
		}, this);
	}
}, pykit.LinkedList, pykit.ComplexDataSetter, pykit.UI.element);



pykit.UI.list = pykit.defUI({
	__name__:"list",
	$defaults: {
		htmlTag: "UL",
		selectable: false,
		listStyle: "list",
		itemStyle: "",
		margin: "",
		dropdownEvent: "onItemClick"
	},
	$setters: pykit.extend(
		pykit.setCSS({
			listStyle: {
				"nav": "uk-nav",
				"side": ["uk-nav", "uk-nav-side"],
				"offcanvas": ["uk-nav", "uk-nav-offcanvas"],
				"dropdown": ["uk-nav", "uk-nav-dropdown", "uk-nav-side"],
				"stripped": ["uk-nav", "uk-list", "uk-list-stripped"],
				"line": ["uk-list", "uk-list-line"],
				"subnav": "uk-subnav",
				"navbar": "uk-navbar-nav",
				"subnav-line": ["uk-subnav", "uk-subnav-line"],
				"subnav-pill": ["uk-subnav", "uk-subnav-pill"],
				"list": "uk-list",
				"tab": "uk-tab",
				"tab-flip": "uk-tab-flip",
				"tab-bottom": "uk-tab-bottom",
				"tab-center": "uk-tab-center",
				"tab-left": "uk-tab-left",
				"tab-right": "uk-tab-right",
				"": ""
			}
		}),
		{
			accordion: function(value) {
				if (value)
					this._html.setAttribute("data-uk-nav", "");
				return value;
			},
			tab: function(value) {
				if (value) {
					var $this = this;
					$this.addListener("onItemClick", $this._onTabClick);

					if (value == "responsive") {
						// Create a list of linked data to the actual data
						// This avoids needing to duplicate the data
						var linkedData = pykit.list($this.config.data).each(function(item) {
							return {label: item.label, $link: item, $close: item.$close};
						});

						$this.set('dropdownEvent', "onTabMenuClick");
						$this.set('dropdown', {
							view: "list",
							data: linkedData,
							on: {
								onItemClick: function(item, node, e) {
									$this._onTabClick(item.$link, node, e);
								},
								onItemSelectionChanged: function(item, node, e) {
									$this._onTabClick(item.$link, node, e);
								},
								onItemClosed: function(item) {
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
	__after__: function(config) {
		if (config.tab) {
			this.addListener("onAdded", this._onTabAdded);
			this.addListener("onDeleted", this._onTabDeleted);
			this.addListener("onItemSelectionChanged", this._onItemSelectionChanged);
			if (config.tab == 'responsive') {
				this.addListener("onDOMChanged", this._onDOMChanged);
				this.add({label: "<i class='uk-icon-bars'></i>", $tabmenu: true, batch: "$menu"}, this.headNode);
				pykit.event(window, "resize", this.updateFit, this);
				this.dispatch("onDOMChanged", [null, "refresh"]);
			}
		}
	},
	_onDOMChanged: function() {
		pykit.delay(this.updateFit, this);
	} ,
	_onTabAdded: function(item, before) {
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
	_onTabDeleted: function(item) {
		if (this.dropdownList) {
			var linked = this.dropdownList.findOne("$link", item);
			if (linked) this.dropdownList.remove(linked);
		}
	},
	_onTabClick: function(item, node, e) {
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
	_onItemSelectionChanged: function(item) {
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
	updateFit: function() {
		this.each(function(item) {
			// Show everything for checking y-offset (keep invisible to avoid blink)
			pykit.html.removeCSS(this._itemNodes[item.id], "uk-hidden");
			pykit.html.addCSS(this._itemNodes[item.id], "uk-invisible");
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

		this.each(function(item) {
			pykit.html.removeCSS(this._itemNodes[item.id], "uk-invisible");
		}, this);

		if (doResponsive) {
			this.showBatch(["$menu", "$selected"]);
		}
		else {
			this.showBatch([undefined, "$selected"]);
		}
	},
	setActiveLabel: function(label) {
		this.setActive("label", label);
	},
	setActive: function(key, value) {
		this.unselectAll();
		var item = this.findOne(key, value);
		pykit.assert(item, pykit.replaceString("Could not find {key} {value} in {id}.",
			{key: key, value: value, id: this._config.id}));
		this.select(item);
	},
	isSelected: function(target) {
		if (pykit.isString(target))
			target = this.getItem(target);
		return target.$selected;
	},
	select: function(target) {
		if (pykit.isString(target))
			target = this.getItem(target);
		target.$selected = true;
		pykit.html.addCSS(this.getItemNode(target.id), "uk-active");
	},
	unselectAll: function() {
		this.each(function(item) {
			var node = this.getItemNode(item.id);
			item.$selected = false;
			pykit.assert(node, "Node with id " + item.id + " does not exist");
			pykit.html.removeCSS(node, "uk-active");
		}, this);
	},
	closeItem: function(item) {
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
    _itemHTML: function(itemConfig) {
        var itemStyle = itemConfig.$css || this._config.itemStyle;

        var li = pykit.html.createElement("LI",
            {class: itemStyle
            + (itemConfig.header ? "uk-nav-header" : "")
            + (itemConfig.divider ? "uk-nav-divider" : "")});

        if (!itemConfig.header && !itemConfig.divider) {
            this._attachNodeEvents(li, itemConfig);
        }
        return li;
    },
	_innerHTML: function(parentNode, config) {
		if (config.view) {
			var ui = pykit.UI(config);
			parentNode.appendChild(ui._html);
		}
		else if (config.header) {
			parentNode.innerHTML = config.label;
		}
		else if (config.divider) {
		}
		else {
			var link = new pykit.UI.link(config);
			parentNode.appendChild(link._html);
			this._addCloseHTML(link._html, config);
		}
		return ui;
	},
	_addCloseHTML: function(node, item) {
		if (item.$close) {
			var close = pykit.html.createElement("SPAN", {class: "uk-close"});

			pykit.event(close, "click", function(e) {
				if (item.$preventDefault !== false) {
					pykit.html.preventEvent(e);
				}
				this.closeItem(item);
			}, this);

			node.appendChild(close);
		}
	},
	_attachNodeEvents: function(node, itemConfig) {
		pykit.event(node, "click", function(e) {
			if (itemConfig.$preventDefault !== false && this._config.$preventDefault !== false) {
				pykit.html.preventEvent(e);
			}
            if (!pykit._dragged) {
                this.dispatch("onItemClick", [itemConfig, node, e]);
            }
		}, this);

		if (this.context && itemConfig.context !== false) {
			pykit.event(node, "contextmenu", function (e) {
				if (itemConfig.$preventDefault !== false) {
					pykit.html.preventEvent(e);
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

            pykit.event(node, "dragstart", function(e) {
                pykit.html.preventEvent(e);
            }, this);

			function onMouseDown(e) {
				if (pykit.isFunction(this.draggable) && !this.draggable(e)) {
					return;
				}
				var ev = e.touches && e.touches[0] || e;
				var offset = node.getBoundingClientRect();
				pykit._selectedForDrag = {
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

			if (UIkit.support.touch) pykit.event(node, "touchstart", onMouseDown, this);
			pykit.event(node, "mousedown", onMouseDown, this);
		}
	}
}, pykit.UI.stack);



pykit.UI.tree = pykit.defUI({
	__name__: "tree",
	$defaults:{
		listStyle: "side",
		selectable: false,
		indentWidth: 15,
		dataTransfer: 'id',
		draggable: true,
		orderAfter: function(other) {
			var isParent = this.$parent == other.id;
			var isNestedDeeper = this.$depth < other.$depth;
			var sameParent = this.$parent == other.$parent;
			return (isParent || isNestedDeeper || (sameParent && (
				this.label > other.label && this.$branch == other.$branch || this.$branch < other.$branch)));
		},
		droppable: function(item) {
			return item.$branch;
		}
	},
	__after__: function() {
		this.addListener("onItemClick", this.toggle);
		this.addListener("onItemDragStart", this._dragStart);
		this.addListener("onItemDragOver", this._dragOver);
		this.addListener("onItemDragLeave", this._dragLeave);
		this.addListener("onItemDragEnd", this._dragEnd);
		this.addListener("onItemDrop", this._dragLeave);
	},
	_innerHTML: function(parentNode, config) {
		parentNode.innerHTML = this.template(config);
	},
	_dragStart: function(item, node, e) {
		var $this = this;
		if (item.$branch)
			$this._hideChildren(item);
	},
	_dragEnd: function(item) {
		if (item.$branch && !item.$closed)
			this._showChildren(item);
	},
	_dragOver: function(item) {
		if (this._droppable(item, pykit._dragged.config, pykit._dragged.node))
			pykit.html.addCSS(this.getItemNode(item.id), "uk-active");
	},
	_dragLeave: function(item) {
		pykit.html.removeCSS(this.getItemNode(item.id), "uk-active");
	},
	_showChildren: function(item) {
		item.$children.until(function(child, queue) {
			pykit.html.removeCSS(this.getItemNode(child.id), "uk-hidden");

			if (item.$branch && !child.$closed) {
				for (var i=0; i<child.$children.length; i++) {
					queue.push(child.$children[i]);
				}
			}
			return true;
		}, this);
	},
	_hideChildren: function(item) {
		item.$children.until(function(child, queue) {
			pykit.html.addCSS(this.getItemNode(child.id), "uk-hidden");

			if (item.$branch) {
				for (var i=0; i<child.$children.length; i++) {
					queue.push(child.$children[i]);
				}
			}
			return true;
		}, this);
	},
	add: function(obj) {
		var parent = null;
		obj.$children = pykit.list();
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
	remove: function(obj) {
		if (obj.$branch) {
			while (obj.$children.length > 0) {
				this.remove(obj.$children[0]);
			}
		}
		pykit.LinkedList.remove.call(this, obj);
	},
	template: function(config) {
		return pykit.replaceString(
			'<a><i class="uk-icon-{icon}" style="margin-left: {margin}px"></i><span class="uk-margin-small-left">{label}</span></a>',
			{
				icon: config.$branch ?
					(config.$children.length ?
						"folder" :
						"folder-o"):
					"file-o", label: config.label,
				margin: config.$depth*this.indentWidth
			})
	},
	open: function(item) {
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
	close: function(item) {
		if (!item.$branch || item.$closed) return;

		this.dispatch("onClose",[item.id]);

		item.$closed = true;
		var node = this.getItemNode(item.id);
		node.parentNode.replaceChild(this._createItem(item), node);

		this._hideChildren(item);

		this.dispatch("onClosed",[item.id]);
	},
	openAll: function(){
		this.each(function(obj){
			if (obj.$branch)
				this.open(obj.id);
		});
	},
	closeAll: function(){
		this.each(function(obj){
			if (obj.$branch)
				this.close(obj.id);
		});
	},
	isBranchOpen:function(item){
		if (item.$branch && !item.$closed)
			return this.isBranchOpen(item.$parent);
		return false;
	},
	toggle: function(item) {
		if (item.$branch) {
			if (item.$closed)
				this.open(item);
			else
				this.close(item);
		}
	}
}, pykit.UI.list);



pykit.UI.table = pykit.defUI({
	__name__: "table",
	$defaults: {
		tagClass: "uk-table",
		htmlTag: "TABLE",
		flex: false,
		margin : "",
		size: "",
		layout: "",
		listStyle: ""
	},
	__init__: function() {
		this.header = this._header = pykit.html.createElement("THEAD");
		this.footer = this._footer = pykit.html.createElement("TFOOT");
		this.body = this._body = pykit.html.createElement("TBODY");

		// Make Chrome wrapping behavior same as firefox
		this._body.style.wordBreak = "break-word";

		this._html.appendChild(this._header);
		this._html.appendChild(this._footer);
		this._html.appendChild(this._body);
	},
	$setters: pykit.extend(pykit.setCSS({
			tableStyle: {
				hover: "uk-table-hover",
				striped: "uk-table-striped",
				condensed: "uk-table-condensed"
			}
		}),
		{
			columns: function (value) {
				pykit.assert(pykit.isArray(value), "Table 'columns' expected Array, got: " + value);
				value = pykit.list(value);
				value.each(function(item) {
					if (pykit.isUndefined(item.template) && item.name) {
						item.template = pykit.selectors.property(item.name);
					}
				});
				return value;
			},
			header: function (value) {
				if (value) {
					if (pykit.isObject(value)) {
						var column = pykit.ListMethods.findOne.call(this._config.columns, "name", value.name, true);
						column.header = value.header;
					}
					var columns = this._config.columns;
					var headersHTML = "";
					for (var c,i=0; i < columns.length; i++) {
						c = columns[i];
						headersHTML += c.align ?
							pykit.replaceString("<th style='text-align: {align}'>{text}</th>", {align:c.align, text: c.header})
							: "<th>" + c.header + "</th>";
					}
					this._header.innerHTML = "<tr>" + headersHTML + "</tr>";
				}
				return value;
			},
			footer: function (value) {
				if (value) {
					if (pykit.isObject(value)) {
						var column = pykit.ListMethods.findOne.call(this._config.columns, "name", value.name);
						column.footer = value.footer;
					}
					var footers = pykit.pluck(this._config.columns, "footer");
					this._footer.innerHTML = "<tr><td>" + footers.join("</td><td>") + "</td></tr>";
				}
				return value;
			},
			caption: function (value) {
				this._caption = pykit.html.createElement("CAPTION");
				this._caption.innerHTML = value;
				this._html.appendChild(this._caption);
				return value;
			}
		}
	),
	_innerHTML: function(node, obj) {
		var td, column;
		for (var i=0; i<this._config.columns.length; i++) {
			column = this._config.columns[i];
			td = pykit.html.createElement("TD", {class: column.$css ? column.$css : ""});

			if (column.align)
				td.style.textAlign = column.align;

			td.innerHTML = pykit.template(column.template, obj, this);
			node.appendChild(td);
		}
		this._attachNodeEvents(node, obj);
	},
	_itemHTML: function() {
		return pykit.html.createElement("TR");
	},
	_containerHTML: function() {
		return this._body;
	}
}, pykit.UI.list);



pykit.UI.select = pykit.defUI({
	__name__: "select",
	$defaults: {
		tagClass: "",
		htmlTag: "SELECT",
		flex: false,
		margin : "",
		size: "",
		layout: "",
		listStyle: ""
	},
	__after__: function() {
		pykit.event(this._html, "change", this._onChange, this);
	},
	_onChange: function() {
		this.dispatch("onChange");
	},
	select: function(target) {
		if (pykit.isString(target))
			target = this.getItem(target);
		target.$selected = true;
		this._html.selectedIndex = this.indexOf(target);
	},
	unselectAll: function() {
		// Do nothing
	},
	getValue: function() {
		return this._html.value;
	},
	setValue: function(value) {
		return this.setActive('value', value);
	},
	template: function(itemConfig) {
		return itemConfig.label;
	},
	_innerHTML: function(parentNode, config) {
		parentNode.innerHTML = this.template(config);
	},
	_itemHTML: function(itemConfig) {
		var attrs = {value: itemConfig.value};
		if (itemConfig.selected) {
			attrs.selected = itemConfig.selected;
		}
		return pykit.html.createElement("OPTION", attrs);
	}
}, pykit.UI.list);



pykit.UI.form = pykit.defUI({
	__name__: "form",
	$defaults:{
		htmlTag: "FORM",
		tagClass: "uk-form",
		layout: "stacked"
	},
	$setters: pykit.extend(
		pykit.setCSS({
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
			fieldset: function(value) {
				var ui = pykit.UI({
					view: "fieldset",
					margin: "",
					layout: this._config.layout,
					data: value
				});
				this._fieldset = ui;
				this._html.appendChild(ui._html);
				return value;
			}
		}),
	__after__: function() {
		pykit.event(this._html, "submit", this._onSubmit, this);
	},
	_onSubmit: function(e) {
		pykit.html.preventEvent(e);
		this.dispatch("onSubmit", [this.getValues(), this]);
		return true;
	},
	clear: function() {
		this._fieldset.clear();
	},
	enable: function() {
		this._fieldset.enable();
	},
	disable: function() {
		this._fieldset.disable();
	},
	getValues: function() {
		return this._fieldset.getValues();
	},
	setValues: function(values) {
		return this._fieldset.setValues(values);
	}
}, pykit.UI.element);



pykit.UI.fieldset = pykit.defUI({
	__name__: "fieldset",
	$defaults: {
		htmlTag: "FIELDSET"
	},
	$setters: pykit.setCSS({
		layout: {
			stacked: "uk-form-stacked",
			horizontal: "uk-form-horizontal"
		}
	}),
	_itemHTML: function(itemConfig) {
		if (itemConfig.title) {
			return pykit.html.createElement("LEGEND", {class: itemConfig.$itemCSS ? itemConfig.$itemCSS : ""});
		}
		else {
			return pykit.html.createElement("DIV", {class: itemConfig.$itemCSS ? itemConfig.$itemCSS : "uk-form-row"});
		}
	},
	_innerHTML: function(parentNode, config) {
		if (config.title) {
			parentNode.innerHTML = config.label;
		}
		else if (config.view) {
			config.margin = config.margin || "";
			var ui = pykit.UI(config);

			if (config.formLabel) {
				ui.label = pykit.html.createElement("LABEL", {class: "uk-form-label", for: config.id});
				ui.label.innerHTML = config.formLabel;
				if (config.inline) pykit.html.addCSS(ui.label, "uk-display-inline");
				parentNode.appendChild(ui.label);
			}

			var controlContainer = parentNode;
			if (!config.inline) {
				controlContainer = pykit.html.createElement("DIV", {class: "uk-form-controls"});
				parentNode.appendChild(controlContainer);
			}

			controlContainer.appendChild(ui._html);
		}
	},
	clear: function() {
		this.each(function(item) {
			if (item.name) {
				$$(item.id).reset();
			}
		});
	},
	enable: function() {
		this.each(function(item) {
			if (item.name || item.view == "button") {
				$$(item.id).enable();
			}
		});
	},
	disable: function() {
		this.each(function(item) {
			if (item.name || item.view == "button") {
				$$(item.id).disable();
			}
		});
	},
	getValues: function() {
		var results = {};

		var unprocessed = this.each(function(item) {
			return item;
		});

		// Extract all children with `name` attributes, including nested flexgrid children.
		var item;
		while (unprocessed.length > 0) {
			item = unprocessed.pop();
			if (item.name) {
				results[item.name] = $$(item.id).getValue();
			}
			else if (item.view == "flexgrid") {
				unprocessed = unprocessed.concat($$(item.id).getItems());
			}
		}

		return results;
	},
	setValues: function(config) {
		pykit.assert(config, "fieldset setValues has recieved an invalid value.");

		var unprocessed = this.each(function(item) {
			return item;
		});

		var item;
		while (unprocessed.length > 0) {
			item = unprocessed.pop();
			if (pykit.isDefined(config[item.name])) {
				$$(item.id).setValue(config[item.name]);
			}
			else if (item.view == "flexgrid") {
				unprocessed = unprocessed.concat($$(item.id).getItems());
			}
		}
	}
}, pykit.UI.stack);



if (window.UIkit) {
	pykit.message = UIkit.notify;
	pykit.confirm = UIkit.modal.confirm;
	pykit.prompt = UIkit.modal.prompt;
	pykit.alert = UIkit.modal.alert;
}
