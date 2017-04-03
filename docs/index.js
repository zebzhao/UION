UI.new({
    view: 'list',
    listStyle: 'navbar offcanvas',
    css: 'uk-block-secondary',
    fill: 'width',
    margin: 'bottom-lg',
    data: [
        {label: "Github", css: "uk-text-contrast"}
    ]
}, document.getElementById('navbar'));

UI.new({
    view: 'list',
    listStyle: 'side',
    minWidth: '180px',
    margin: 'right-lg',
    data: [
        {label: "INTRODUCTION", $css: "uk-active", link: true},
        {label: "GETTING STARTED", link: true}
    ].concat(Object.keys(UI.components).sort().map(function (n) {
        return {label: n.toUpperCase(), value: n}
    })),
    on: {
        onItemClick: function (item) {
            if (!item.link) {
                // If link is empty, assume it points to a component
                this.setActiveLabel(item.label);
                $$('methodList').parseMethods(UI.components[item.value]);
                $$('cssForm').parseProperties(UI.components[item.value]);
            }
        }
    }
}, document.getElementById('sidebar'));

UI.new({
    id: 'mainView',
    layout: 'column',
    visibleBatches: UI.list(['properties', 'tab']), // Custom field
    cells: [
        {
            batch: 'tab',
            view: 'list',
            listStyle: 'tab',
            tab: true,
            data: [
                {label: "DEMO", $css: "uk-active"},
                {label: "CODE"}
            ]
        },
        {
            batch: 'tab',
            view: 'list',
            listStyle: 'tab',
            tab: true,
            data: [
                {label: "PROPERTIES", value: "properties", $css: "uk-active"},
                {label: "METHODS", value: "methods"}
            ],
            on: {
                onItemClick: function (item) {
                    this.setActiveLabel(item.label);
                    var mainView = $$('mainView');

                    switch (item.value) {
                        case 'properties':
                            mainView.visibleBatches.replace('methods', 'properties');
                            mainView.showBatch(mainView.visibleBatches);
                            break;

                        case 'methods':
                            mainView.visibleBatches.replace('properties', 'methods');
                            mainView.showBatch(mainView.visibleBatches);
                            break;
                    }
                }
            }
        },
        {
            batch: 'properties',
            layout: 'column',
            cells: [
                {
                    view: 'label', margin: "top-lg", css: 'uk-alert',
                    label:'<span class="uk-badge uk-badge-warning">NOTE</span>&nbsp;&nbsp;Changing these properties will affect the displayed component.'
                },
                {
                    view: 'label', margin: "top",
                    label: '<strong>CSS</strong>'
                },
                {
                    id: 'cssForm',
                    view: 'form',
                    margin: "top",
                    formStyle: 'line',
                    layout: 'horizontal',
                    parseProperties: function (component) {
                        var setters = component.prototype.$setters;
                        var defaults = component.prototype.$defaults;
                        var properties = Object.keys(setters);

                        this.getFieldset().setData(properties.sort().filter(function (n) {
                            return setters[n].options;
                        }).map(function(n) {
                            return {
                                formLabel: UI.replaceString('<code>{{name}}</code>', {name: n}),
                                view: 'button',
                                size: 'small',
                                label: UI.replaceString('{{label}}&nbsp;&nbsp;<i class="uk-icon-chevron-down"></i>', {label: defaults[n] || ''}),
                                minWidth: '100px',
                                dropdown: {
                                    view: 'list',
                                    data: Object.keys(setters[n].options).sort().map(function(n) {
                                        return {label: n || '&lt;empty&gt;'}
                                    })
                                }
                            }
                        }));
                    }
                },
                {view: 'label', margin: "top-lg", label: '<strong>MISC</strong>'}
            ]
        },
        {
            batch: 'methods',
            id: 'methodList',
            view: 'list',
            listStyle: 'line',
            selectable: true,
            parseMethods: function (component) {
                this.setData(getComponentMethods(component).map(function (method) {
                    return {
                        view: 'element',
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
                        parameters: method.params.map(function (n) {
                            return UI.replaceString(
                                '<dt class="uk-text-muted">{{name}}</dt><dd>{{description}}</dd>', n);
                        }).join('')
                    }
                }));
            }
        }
    ],
    on: {
        onInitialized: function () {
            this.showBatch(this.config.visibleBatches);
        }
    }
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
        .filter(function (n) {
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