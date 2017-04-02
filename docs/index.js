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
            parseMethods: function (component) {
                this.setData(getComponentMethods(component).map(function(method) {
                    return {
                        template: [
                            method.name,
                            '<h4>{{name}}</h4><p>{{summary}}</p>',
                            (method.params ? '<h5>Parameters</h5>' : ''),
                            (method.dispatch ? '<h5>Dispatch</h5>' : ''),
                            (method.returns ? '<h5>Returns</h5>' : '')
                        ].join(''),
                        name: method.name,
                        summary: method.summary
                    }
                }));
            }
        }
    ]
}, document.getElementById('main'));


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
        var dispatch = null;
        var returns = null;
        lines.forEach(function (l) {
            l = l.split(' ');
            switch (l[0]) {
                case "@param":
                    params[l[1]] = l.slice(1).join(' ');
                    break;
                case "@returns":
                    returns = l.join(' ');
                    break;
                case "@dispatch":
                    dispatch = l.join(' ');
                    break;
                default:
                    summary += l.join(' ');
            }
        });
        return {name: name, summary: summary, dispatch: dispatch, returns: returns, params: params};
    }
}