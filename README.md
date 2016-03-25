# Pykit

[![Build Status](https://travis-ci.org/zebzhao/Pykit.svg?branch=master)](https://travis-ci.org/zebzhao/Pykit)

Pykit is a JSON user interface builder based on UIkit.

Getting started
---

You have following options to get Pykit:

- Download the [latest release](https://github.com/zebzhao/Pykit/releases/latest)
- Clone the repo, `git clone git://github.com/zebzhao/pykit.git`.
- Install with [Bower](http://bower.io): ```bower install pykit```

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
<script src="pykit.js" type="text/javascript"></script>
```

For production
```html
<link rel="stylesheet" href="css/spring.css">
<script src="jquery.min.js" type="text/javascript"></script>
<script src="pykit.min.js" type="text/javascript"></script>
```

## Initializing components

Initializing new components can be done like so:
```javascript
pykit.UI({view: "button"}, document.body);
```

More complex example:
```javascript
pykit.UI({
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
pykit.defUI({
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
		pykit.event(this._html, "change", this._onChange, this);
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
pykit.defUI({
    __name__: "toggleButton",
}, pykit.UI.button);
```
If multiple components are inherited, they will be extended in the order of _right_ to _left_.
Any methods with the same name will be overwritten by the _left-most_ component in the extension list.
```javascript
pykit.defUI({
    __name__: "toggleInput",
}, pykit.UI.input, pykit.UI.button);
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
        pykit.event(this._html, "click", this._onClick, this);
		pykit.event(this._html, "contextmenu", this._onContext, this);
	},
	_onClick: function(e){
        this.dispatch("onClick", [this, this._html, e]);
	},
	_onContext: function(e) {
        this.dispatch("onContext", [this, this._html, e]);
	}
};

// They can be used to extend components
pykit.defUI({
	__name__:"button",
	$defaults: {
		label: "",
        htmlTag: "BUTTON",
	},
    template: function(config) {
		return pykit.replaceString("<span>{label}</span>", {label: config.label});
    }
}, ClickEvents, pykit.UI.element);
```

## Defining required extensions
When defining abstract components, one can add required extensions using `__check__`.
An error will be thrown if components are not properly extended.
```javascript
AbstractButton = {
    __name__: "AbstractButton",
    __check__: function(bases) {
        pykit.assert(bases.indexOf('AbstractButton') != -1, "AbstractButton is an abstract class and must be extended.");
        pykit.assert(bases.indexOf('AbstractClickable') != -1, "AbstractButton must extend AbstractClickable.");
    }
}

// This will throw an error
pykit.defUI({
    __name__: "button",
}, AbstractButton);

// This will work
pykit.defUI({
    __name__: "button",
}, AbstractButton, AbstractClickable);
```

Note that inherited classes can be accessed through the `__bases__` attribute.

## Using setters and defaults
Any JSON configurations that requires setters can be defined on the `$setters` object.
To manually trigger the setter, use `this.set(propName, value)`.
```javascript
pykit.defUI({
    __name__: "button",
    $setters: {
        css: function(value) {
            pykit.html.addCSS(value);
        }
    }
});
```

Any default configurations should be defined on the `$defaults` object.
To access configurations, one should use `this.config.propName`.
```javascript
pykit.defUI({
    __name__: "button",
    $defaults: {
        css: "uk-button"
    },
    $setters: {
        css: function(value) {
            pykit.html.addCSS(value);
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
pykit.defUI({
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
        pykit.event(this._html, "change", callback, this);
        
        // Add listeners to this component
        this.addListener("onInitialized", callback);
        this.addListener("onClick", callback);
        
        // Dispatch events
        this.dispatch("onCustomEvent");
    }
}, pykit.UI.element);
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
First of all, install [Node](http://nodejs.org/). We use [Gulp](http://gulpjs.com) to build Pykit. If you haven't used Gulp before, you need to install the `gulp` package as a global install.

```
npm install --global gulp
```

If you haven't done so already, clone the Pykit git repo.

```
git clone git://github.com/zebzhao/pykit.git
```
Install the Node dependencies.

```
cd pykit
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

Pykit follows the [GitFlow branching model](http://nvie.com/posts/a-successful-git-branching-model). The ```master``` branch always reflects a production-ready state while the latest development is taking place in the ```develop``` branch.

Each time you want to work on a fix or a new feature, create a new branch based on the ```develop``` branch: ```git checkout -b BRANCH_NAME develop```. Only pull requests to the ```develop``` branch will be merged.

## Browser compatibility

Pykit's flexgrid component relies heavily on flex containers and will not support any browsers not supporting flex containers.
No effort has been made to support IE10-, as this would greatly complicate the current codebase.
