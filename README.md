# JIKit

[![Build Status](https://travis-ci.org/zebzhao/JIKit.svg?branch=master)](https://travis-ci.org/zebzhao/JIKit)

JIKit is a JSON user interface builder based on UIkit. (Renamed from Pykit.)

Getting started
---

You have following options to get JIKit:

- Download the [latest release](https://github.com/zebzhao/JIKit/releases/latest)
- Clone the repo, `git clone git://github.com/zebzhao/JIKit.git`.
- Install with [Bower](http://bower.io): ```bower install JIKit```

Table of Contents
---

1. [Initializing components](#initializing-components)
1. [Defining new components](#defining-new-components)
1. [Extending components](#extending-components)
1. [Defining abstract extensions](#defining-abstract-extensions)
1. [Defining required extensions](#defining-required-extensions)
1. [Initialization handling](#initialization-handling)
1. [Standard components](#standard-components)
1. [Demos](#demos)

Usage
---

Start by including the file in your main HTML file.

For debugging
```html
<link rel="stylesheet" href="css/spring.css">
<script src="jquery.js" type="text/javascript"></script>
<script src="JIKit.js" type="text/javascript"></script>
```

For production
```html
<link rel="stylesheet" href="css/spring.css">
<script src="jquery.min.js" type="text/javascript"></script>
<script src="JIKit.min.js" type="text/javascript"></script>
```

## Initializing components

Initializing new components can be done like so:
```javascript
JIKit.UI({view: "button"}, document.body);
```

More complex example:
```javascript
JIKit.UI({
    view: "modal",
    id: "imageViewer",
    light: "true",
    center: false,
    body: {
        view: "image"
    },
    loadImage: function(url, name) {
        this.set("caption", name);
        this.bodyContent.set("src", url);
        this.open();
    }
}, document.body);
```

__When initializing UIkit components add `data-uk-observe` to the main `<body>` tag.__

A list of UIkit components include:

* autocomplete
* dropdown
* modal

Additionally, the `upload` attribute of any component also uses a UIkit component.

## Defining new components

New UI components can be defined as so:
```javascript
JIKit.defUI({
	__name__: "canvas",
	$defaults: {
		htmlTag: "CANVAS"
	},
	$setters: {
	    width: function(value) {
	        this._html.width = value;
	        return value;
	    },
	    height: function(value) {
            this._html.height = value;
            return value;
        }
	},
	__after__: function() {
	    // Attach events or post-initialization stuff here
	    // ...
		JIKit.event(this._html, "change", this._onChange, this);
	},
	_onChange: function () {
		this.dispatch("onChange");
	},
	getSize: function() {
		return {width: this._html.width, height: this._html.height};
	},
	setWidth: function(value) {
		this.set('width', value);
	},
	setHeight: function(value) {
        this.set('height', value);
    }
});
```

## Extending components
Any created components can inherit other components or be used to extend new components.
```javascript
JIKit.defUI({
    __name__: "toggleButton",
}, JIKit.UI.button);
```
If multiple components are inherited, they will be extended in the order of _right_ to _left_.
Any methods with the same name will be overwritten by the _left-most_ component in the extension list.
```javascript
JIKit.defUI({
    __name__: "toggleInput",
}, JIKit.UI.input, JIKit.UI.button);
```

## Defining abstract extensions
For generic extensions, similar to Mixins, one can just define them as regular objects.
```javascript
ClickEvents = {
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
		if (config.click) {
            config.on = config.on || {};
            config.on.onItemClick = config.click;
        }
        JIKit.event(this._html, "click", this._onClick, this);
		JIKit.event(this._html, "contextmenu", this._onContext, this);
	},
	_onClick: function(e){
        this.dispatch("onClick", [this, this._html, e]);
	},
	_onContext: function(e) {
        this.dispatch("onContext", [this, this._html, e]);
	}
};

// They can be used to extend components
JIKit.defUI({
	__name__:"button",
	$defaults: {
		label: "",
        htmlTag: "BUTTON",
	},
    template: function(config) {
		return JIKit.replaceString("<span>{label}</span>", {label: config.label});
    }
}, ClickEvents, JIKit.UI.element);
```

## Defining required extensions
When defining abstract components, one can add required extensions using `__check__`.
An error will be thrown if components are not properly extended.
```javascript
AbstractButton = {
    __name__: "AbstractButton",
    __check__: function(bases) {
        JIKit.assert(bases.indexOf('AbstractButton') != -1, "AbstractButton is an abstract class and must be extended.");
        JIKit.assert(bases.indexOf('AbstractClickable') != -1, "AbstractButton must extend AbstractClickable.");
    }
}

// This will throw an error
JIKit.defUI({
    __name__: "button",
}, AbstractButton);

// This will work
JIKit.defUI({
    __name__: "button",
}, AbstractButton, AbstractClickable);
```

Note that inherited classes can be accessed through the `__bases__` attribute.

## Using setters and defaults
Any JSON configurations that requires setters can be defined on the `$setters` object.
To manually trigger the setter, use `this.set(propName, value)`.
```javascript
JIKit.defUI({
    __name__: "button",
    $setters: {
        css: function(value) {
            JIKit.html.addCSS(value);
        }
    }
});
```

Any default configurations should be defined on the `$defaults` object.
To access configurations, one should use `this.config.propName`.
```javascript
JIKit.defUI({
    __name__: "button",
    $defaults: {
        css: "uk-button"
    },
    $setters: {
        css: function(value) {
            JIKit.html.addCSS(value);
        }
    },
    __after__() {
        console.log(this.config.css);
    }
});
```

## Initialization handling
Initialization of components takes place in `__init__` and `__after__`.
```javascript
JIKit.defUI({
    __name__: "button",
    __init__: function() {
        // Should initialize variables used by this component here
        this._toggled = false;
        
        // HTML is not initialized
        console.log(this._html); // undefined
        
        // Dispatcher is not initialized
        console.log(this.dispatch); // undefined
    },
    __after__: function() {
        // Can register events, dispatch events, etc.
        
        // Add listeners to HTML tag
        JIKit.event(this._html, "change", callback, this);
        
        // Add listeners to this component
        this.addListener("onInitialized", callback);
        this.addListener("onClick", callback);
        
        // Dispatch events
        this.dispatch("onCustomEvent");
    }
}, JIKit.UI.element);
```

Standard components
---

A list of standard components can be found below.

* autocomplete
* button
* dropdown
* element
* fieldset
* flexgrid
* form
* icon
* image
* input
* label
* link
* list
* modal
* password
* search
* table
* tree

## Standard attributes

Currently undocumented.

Demos
---

For a list of demos, see the `layout_tests` folder.

Developers
---
First of all, install [Node](http://nodejs.org/). We use [Gulp](http://gulpjs.com) to build JIKit. If you haven't used Gulp before, you need to install the `gulp` package as a global install.

```
npm install --global gulp
```

If you haven't done so already, clone the JIKit git repo.

```
git clone git://github.com/zebzhao/JIKit.git
```
Install the Node dependencies.

```
cd JIKit
npm install
```

Run `gulp` to build and minify the release.

```
gulp
gulp build
gulp build-debug
```

## Tests

All tests are contained in the `tests` folder. Tests can be run using `npm test`.

## Contributing

JIKit follows the [GitFlow branching model](http://nvie.com/posts/a-successful-git-branching-model). The ```master``` branch always reflects a production-ready state while the latest development is taking place in the ```develop``` branch.

Each time you want to work on a fix or a new feature, create a new branch based on the ```develop``` branch: ```git checkout -b BRANCH_NAME develop```. Only pull requests to the ```develop``` branch will be merged.

## Browser compatibility

JIKit's flexgrid component relies heavily on flex containers and will not support any browsers not supporting flex containers.
No effort has been made to support IE10-, as this would greatly complicate the current codebase.
