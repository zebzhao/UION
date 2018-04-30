# Lumi

Lumi UI is a lightweight, complete, declarative UI library eliminating the need for using
HTML, CSS for creating SPAs (Single Page Applications).

Lumi is purely the **View** part of **MVC**, and works using vanilla JavaScript, **jQuery**, and the popular components library **UIkit**.

Lumi aims to eliminate the use HTML and CSS for general JavaScript web applications. Lumi takes the approach of using simple JavaScript objects instead of HTML as it is more flexible, integrates better with code and eliminates the need of using JSX or other templating markup.

Lumi is against redefining the way JavaScript interacts with the template by using additional transpilers or compilers. This all aims for the simplification of debugging, testing, and deploying.

To simplify the learning curve, Lumi tries to resemble traditional HTML tags and CSS as much as possible, while also using modern things like `flexbox` to simplify layouts.

Lumi supports IE 10+ and all modern browsers.

## Getting Started

Lumi can be installed using npm or bower:

```bash
bower install lumi
```

```bash
npm install lumi
```

To add styling, add this tag to your HTML file:

```html
<link rel="stylesheet" href="css/uikit/uikit.css">
```

To use include the icon files, also add:
```html
<link rel="stylesheet" href="css/uikit/icon.css">
```

For development, add the following script files:

```html
<script src="jquery.min.js" type="text/javascript"></script>
<script src="lumi.min.js" type="text/javascript"></script>
```

For release, use:

```html
<code class="html"><script src="jquery.js" type="text/javascript"></script>
<script src="lumi.debug.js" type="text/javascript"></script>
```

## Example Usage

```javascript
var modal = UI.new({
  "view": "modal",
  "header": {
    "view": "label",
    "htmlTag": "H3",
    "label": "Stale coffee is exquisite!"
  },
  "body": {
    "view": "label",
    "label": "Medium brewed, dripper to go filter iced..."
  },
  "footer": {
    "flexAlign": "right",
    "cells": [
      {
        "view": "button",
        "label": "No way!",
        "margin": "right"
      },
      {
        "view": "button",
        "type": "primary",
        "label": "Yup."
      }
    ]
  }
}, document.body);

// Opens the modal
modal.open();
```