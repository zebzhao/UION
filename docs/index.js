UI.new({
    view: "list",
    listStyle: "navbar offcanvas",
    css: "uk-block-secondary",
    fill: "width",
    margin: "bottom-lg",
    data: [
        {label: "Github", css: "uk-text-contrast"}
    ]
}, document.getElementById('navbar'));

UI.new({
    view: "list",
    listStyle: "side",
    minWidth: "180px",
    margin: "right-lg",
    data: [
        {label: "INTRODUCTION"}, {label: "GETTING STARTED"}
    ].concat(Object.keys(UI.components).sort().map(function (n) {
        return {label: n.toUpperCase(), value: n}
    })),
    on: {
        onInitialized: function () {
            this.setActiveLabel("INTRODUCTION");
        },
        onItemClick: function (item) {
            this.setActiveLabel(item.label);
            $$('methodList').parseMethods(UI.components[item.value]);
        }
    }
}, document.getElementById('sidebar'));

UI.new({
    layout: "column",
    cells: [
        {
            view: "list",
            listStyle: "tab",
            tab: true,
            data: [
                {label: "DEMO", $css: "uk-active"},
                {label: "CODE"}
            ]
        },
        {
            view: "list",
            listStyle: "tab",
            tab: true,
            data: [
                {label: "METHODS", $css: "uk-active"}
            ]
        },
        {
            id: "methodList",
            view: "list",
            listStyle: "line",
            selectable: true,
            parseMethods: function (component) {
                this.setData(getComponentMethods(component).map(function(method) {
                    return {
                        view: "element",
                        template: [
                            '<dl class="uk-description-list-horizontal">',
                            '<dt><code>{{name}}</code></dt><dd>{{summary}}</dd>',
                            (method.params && method.params.length ? '<dt>Parameters</dt><dd class="uk-hidden-small">&nbsp;</dd>{{parameters}}' : ''),
                            (method.dispatch ? '<dt>Dispatch</dt><dd>{{dispatch}}</dd>' : ''),
                            (method.returns ? '<dt>Returns</dt><dd>{{returns}}</dd>' : ''),
                            '</dl>',
                            (method.example ? '<strong>Example</strong><pre>{{example}}</pre>' : '')
                        ].join(''),
                        name: method.name,
                        summary: method.summary,
                        dispatch: method.dispatch,
                        returns: method.returns ? formatReturnsString(method.returns) : null,
                        example: method.example,
                        parameters: method.params.map(function(n) {
                            return UI.replaceString('<dt class="uk-text-muted">{{name}}</dt><dd>{{description}}</dd>', n);
                        }).join('')
                    }
                }));
            }
        }
    ]
}, document.getElementById('main'));


function formatReturnsString(str) {
    var regex = /\{[^\s}]*}/;
    var type = str.match(regex);
    type = type ? type[0].slice(1, -1) : '';
    return str.replace(regex, UI.replaceString(
        '<div class="uk-badge uk-badge-notification">{{type}}</div>', {type: type}))
}

function getComponentMethods(component) {
    return Object.keys(component.prototype)
        .sort()
        .filter(function (n) {
            return (n.charAt(0) != '$' && n.charAt(0) != '_');
        })
        .map(function (n) {
            return extractDocString(n, component.prototype[n]);
        })
        .filter(function(n) {
            return !!n;
        });
}

function extractDocString(name, fn) {
    var fnStr = fn.toString();
    var startIndex = fnStr.indexOf('/**'),
        endIndex = fnStr.indexOf('*/');
    if (endIndex != -1 && startIndex != -1) {
        var docString = fnStr.slice(startIndex, endIndex);
        var lines = docString.split('\n').map(function (n) {
            return n.slice(n.indexOf('* ') + 2);
        }).slice(1, -1);
        var summary = '';
        var params = [];
        var dispatch = null,
            returns = null,
            example = null;

        lines.forEach(function (l) {
            l = l.split(' ');
            switch (l[0]) {
                case "@param":
                    params.push({name: l[1], description: l.slice(2).join(' ')});
                    break;
                case "@returns":
                    returns = l.slice(1).join(' ');
                    break;
                case "@dispatch":
                    dispatch = l.slice(1).join(' ');
                    break;
                case "@example":
                    example = l.slice(1).join(' ');
                    break;
                default:
                    summary += l.join(' ');
            }
        });
        return {name: name, summary: summary, dispatch: dispatch, returns: returns, params: params, example: example};
    }
}