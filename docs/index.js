UI.new({
    view: "list",
    listStyle: "navbar offcanvas",
    css: "uk-block-secondary",
    fill: "width",
    margin: "bottom",
    data: [
        {label: "Github", css: "uk-text-contrast"}
    ]
}, document.getElementById('navbar'));

UI.new({
    view: "list",
    listStyle: "side",
    minWidth: "150px",
    data: [
        {label: "INTRODUCTION"}, {label: "GETTING STARTED"}
    ].concat(Object.keys(UI.components).sort().map(function (item) {
        return {label: item.toUpperCase()}
    }))
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
            parseComponentMethods: function(component) {
                var data = Object.keys(component.prototype).sort();
                this.setData(data);
            }
        }
    ]
}, document.getElementById('main'));