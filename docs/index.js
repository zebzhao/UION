var Model = {
  containers: {
    input: wrapInForm,
    autocomplete: wrapInForm,
    select: wrapInForm,
    fieldset: function (fieldset) {
      return {
        view: "form",
        fieldsets: [fieldset]
      }
    },
    dropdown: function (dropdown) {
      return {
        view: "button",
        label: "Show dropdown",
        type: "primary",
        dropdown: dropdown.dropdown
      }
    },
    modal: function (modal) {
      return {
        cells: [
          {
            view: "button",
            label: "Show modal",
            type: "primary",
            on: {
              onClick: function () {
                $$(modal.id).open();
              }
            }
          },
          modal
        ]
      }
    }
  },
  aliases: {
    tab: 'list',
    card: 'flexgrid'
  },
  components: {
    autocomplete: function () {
      return {
        view: "autocomplete",
        placeholder: "Type something...",
        sources: [
          {value: "Curl"},
          {value: "Look"},
          {value: "Age"},
          {value: "Walk"},
          {value: "Elope"},
          {value: "Dig"}
        ]
      }
    },
    button: function () {
      return {
        view: "button",
        label: "Curl"
      }
    },
    card: function () {
      return {
        layout: 'column',
        cells: [
          {
            spacing: "between",
            margin: "bottom-lg",
            cells: [
              {
                view: "label",
                label: "Default Card",
                card: true
              },
              {
                view: "label",
                label: "Primary Card",
                card: "primary"
              },
              {
                view: "label",
                label: "Secondary Card",
                card: "secondary"
              }
            ]
          },
          {
            layout: 'column',
            card: true,
            cells: [
              {
                view: "label",
                card: "badge",
                badge: "danger",
                label: "Awesome"
              },
              {
                view: "label",
                htmlTag: "h3",
                label: "Card with Header",
                card: "header title"
              },
              {
                view: "label",
                label: "Primary Card",
                card: "body"
              }
            ]
          }
        ]
      }
    },
    dropdown: function () {
      return {
        dropdown: {
          view: "list",
          data: [
            {$header: true, label: "Random"},
            {view: "link", label: "Curl into a furry donut."},
            {view: "link", label: "Look into a furry donut."},
            {view: "link", label: "Age into a furry donut."},
            {view: "link", label: "Walk into a furry donut."},
            {view: "link", label: "Elope into a furry donut."},
            {view: "link", label: "Dig into a furry donut."}
          ]
        }
      }
    },
    element: function () {
      return {
        template: "<p>{{action}} into a furry donut.</p>",
        action: "Curl"
      }
    },
    fieldset: function () {
      return {
        view: "fieldset",
        data: [
          {formLabel: "User", view: "input", value: "Hello"},
          {formLabel: "Password", view: "input", type: "password", placeholder: "Password"},
          {view: "button", type: "primary", label: "Login", inputWidth: "medium"}
        ]
      }
    },
    form: function () {
      return {
        view: "form",
        fieldset: [
          {formLabel: "User", view: "input", value: "Hello"},
          {formLabel: "Password", view: "input", type: "password", placeholder: "Password"},
          {view: "button", type: "primary", label: "Login", inputWidth: "medium"}
        ]
      }
    },
    flexgrid: function () {
      return {
        cells: [
          {
            view: "list",
            listStyle: "side",
            data: [
              {view: "link", label: "Curl into a furry donut."},
              {view: "link", label: "Look into a furry donut."},
              {view: "link", label: "Age into a furry donut."},
              {view: "link", label: "Walk into a furry donut."},
              {view: "link", label: "Elope into a furry donut."},
              {view: "link", label: "Dig into a furry donut."}
            ]
          },
          {
            view: "form",
            margin: "left-lg",
            fieldset: [
              {formLabel: "User", view: "input", value: "Hello"},
              {formLabel: "Password", view: "input", type: "password", placeholder: "Password"},
              {view: "button", type: "primary", label: "Login", inputWidth: "medium"}
            ]
          }
        ]
      }
    },
    icon: function () {
      return {
        view: "icon",
        icon: "uk-icon-information"
      }
    },
    image: function () {
      return {
        view: "image",
        src: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'200'%20height%3D'100'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%2323b2ff'%2F%3E%3C%2Fsvg%3E"
      }
    },
    input: function () {
      return {
        view: "input"
      }
    },
    label: function () {
      return {
        view: "label",
        label: "Curl into a furry donut."
      }
    },
    link: function () {
      return {
        view: "link",
        label: "Curl into a furry donut."
      }
    },
    list: function () {
      return {
        view: "list",
        data: [
          {view: "link", label: "Curl into a furry donut."},
          {view: "link", label: "Look into a furry donut."},
          {view: "link", label: "Age into a furry donut."},
          {view: "link", label: "Walk into a furry donut."},
          {view: "link", label: "Elope into a furry donut."},
          {view: "link", label: "Dig into a furry donut."}
        ]
      }
    },
    modal: function () {
      return {
        view: "modal",
        header: {
          view: "label",
          htmlTag: "H3",
          label: "Stale coffee is exquisite!"
        },
        body: {
          view: "label",
          label: "Medium brewed, dripper to go filter iced kopi-luwak qui variety cortado acerbic. Plunger pot latte organic sweet single shot robust cappuccino. Plunger pot qui decaffeinated crema, variety cappuccino carajillo shop blue mountain milk. Dark single origin filter, fair trade at grounds aged caffeine froth. In pumpkin spice ristretto single shot chicory mocha kopi-luwak robusta trifecta french press dark."
        },
        footer: {
          flexAlign: "right",
          cells: [
            {view: "button", label: "No way!", margin: "right"},
            {view: "button", type: "primary", label: "Yup."}
          ]
        }
      }
    },
    progress: function () {
      return {
        view: "progress",
        on: {
          onInitialized: function () {
            this.setValue(80);
          }
        }
      }
    },
    search: function () {
      return {
        view: "search"
      }
    },
    select: function () {
      return {
        view: "select",
        data: [
          {label: "Curl"},
          {label: "Look"},
          {label: "Age"},
          {label: "Walk"},
          {label: "Elope"},
          {label: "Dig"}
        ]
      }
    },
    table: function () {
      return {
        view: "table",
        header: true,
        footer: true,
        columns: [
          {header: "Action", name: "action", footer: "1"},
          {header: "Preposition", name: "preposition", footer: "2"},
          {header: "Article", name: "directObject.article", footer: "3"},
          {header: "Object", template: "<code>{{directObject.object}}</code>", footer: "Y"}
        ],
        data: [
          {action: "Curl", preposition: "into", directObject: {article: "a", object: "furry donut"}},
          {action: "Look", preposition: "into", directObject: {article: "a", object: "furry donut"}},
          {action: "Age", preposition: "into", directObject: {article: "a", object: "furry donut"}},
          {action: "Walk", preposition: "into", directObject: {article: "a", object: "furry donut"}},
          {action: "Elope", preposition: "into", directObject: {article: "a", object: "furry donut"}},
          {action: "Dig", preposition: "into", directObject: {article: "a", object: "furry donut"}}
        ]
      }
    },
    tab: function () {
      return {
        view: 'list',
        listStyle: 'tab',
        tab: true,
        data: [
          {view: "link", label: "A", $selected: true},
          {view: "link", label: "B"},
          {view: "link", label: "C"}
        ]
      }
    },
    toggle: function () {
      return {
        view: "toggle",
        checked: true
      }
    },
    tree: function () {
      return {
        view: "tree",
        data: [
          {label: "Curl", id: "root"},
          {label: "into", id: "into", $parent: "root"},
          {label: "a", id: "a", $parent: "root"},
          {label: "furry", id: "furry", $parent: "a"},
          {label: "donut", id: "donut", $parent: "a"}
        ]
      }
    }
  },
  properties: UI.forIn(function (name, value) {
    return UI.extend({}, value.prototype.$defaults)
  }, UI.definitions)
};

function wrapInForm(input) {
  return {
    view: "form",
    fieldset: [input]
  }
}

UI.new({
  css: 'uk-block-secondary',
  flexSize: 'none',
  margin: 'bottom-lg',
  spacing: 'between',
  cells: [
    {
      view: 'list',
      listStyle: 'navbar',
      data: [
        {
          view: 'icon', icon: 'uk-icon-menu',
          css: 'uk-text-muted', screen: 'small',
          on: {
            onClick: function () {
              UIkit.offcanvas.show('#offcanvas', {mode: 'slide'});
            }
          }
        },
        {
          view: "link",
          label: "Model UI"
        }
      ]
    },
    {
      view: 'list',
      listStyle: 'navbar',
      data: [
        {view: 'link', label: "Github", href: "https://github.com/zebzhao/UION", css: "uk-text-contrast"}
      ]
    }
  ]
}, document.getElementById('navbar'));

function sidebarTemplate() {
  return {
    view: 'list',
    listStyle: 'side',
    style: {
      minWidth: '180px',
      marginRight: '64px'
    },
    data: [
      {view: 'link', label: 'Getting Started', $selected: true},
      {$divider: true},
      {$header: true, label: "Components"}
    ].concat(Object.keys(Model.components).sort().map(function (n) {
      return {
        view: 'link',
        label: UI.capitalize(n),
        margin: 'left',
        value: n
      }
    })),
    on: {
      onItemClick: function (item) {
        var value = item.value;
        this.setActiveLabel(item.label);

        if (value) {
          var view = Model.aliases[value] || value;
          // If link is empty, assume it points to a component
          UI.addClass(document.getElementById('gettingStarted'), 'uk-hidden');
          $$('methodList').parseMethods(UI.definitions[view]);
          $$('cssForm').parseProperties(UI.definitions[view]);
          $$('miscForm').parseProperties(UI.definitions[view]);
          var config = $$('codeView').parseCode(value);
          $$('componentView').parseConfig(config, view);
          $$('mainTitle').setValue(item.label);
          $$('mainView').show();
        }
        else {
          $$('mainView').hide();
          UI.removeClass(document.getElementById('gettingStarted'), 'uk-hidden');
        }
      }
    }
  };
}

UI.new(sidebarTemplate(), document.getElementById('sidebar'));
UI.new(UI.extend(sidebarTemplate(), {css: ['uk-offcanvas-bar']}), document.getElementById('offcanvas'));

UI.new({
  id: 'mainView',
  layout: 'column',
  hidden: true,
  cells: [
    {
      id: 'mainTitle',
      view: 'label',
      htmlTag: 'h2',
      margin: 'bottom-lg'
    },
    {
      id: 'exampleView',
      card: true,
      flexSize: 'none',
      layout: 'column',
      cells: [
        {
          batch: 'tab',
          view: 'list',
          listStyle: 'tab',
          tab: true,
          card: 'header',
          margin: 'bottom-lg',
          data: [
            {view: "link", label: "Preview", value: "component", $selected: true},
            {view: "link", label: "Code", value: "code"}
          ],
          on: {
            onItemClick: function (item) {
              this.setActiveLabel(item.label);
              var view = $$('exampleView');
              switch (item.value) {
                case 'component':
                  view.showBatch(['tab', 'component']);
                  break;
    
                case 'code':
                view.showBatch(['tab', 'code']);
                  // Apply syntax highlighting
                  highlightBlocks();
                  break;
              }
            }
          }
        },
        {
          id: 'componentView',
          batch: 'component',
          flexSize: 'none',
          card: 'body',
          cells: [],
          parseConfig: function (config, componentName) {
            if (this.childComponent) {
              this.removeChild(this.childComponent);
            }
            if (Model.containers[componentName]) {
              config = Model.containers[componentName](config);
            }
            this.childComponent = this.addChild(config);
          }
        },
        {
          id: 'codeView',
          batch: 'code',
          template: "<pre><code>UI.new({{code}}, document.body);</code></pre>",
          card: 'body',
          code: '',
          parseCode: function (name) {
            var view = Model.aliases[name] || name;
            var objectModel = UI.extend(UI.extend({}, Model.properties[name]), Model.components[name]());
            var defaults = UI.definitions[view].prototype.$defaults;
            for (var k in objectModel) {
              if (objectModel.hasOwnProperty(k)) {
                if (objectModel[k] == defaults[k]) {
                  delete objectModel[k];
                }
              }
            }
    
            this.config.code = JSON.stringify(objectModel, null, "  ")
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
    
            this.render();
    
            return objectModel;
          }
        }
      ]
    },
    {
      id: 'apiView',
      flexSize: 'none',
      layout: 'column',
      cells: [
        {
          batch: 'tab',
          view: 'list',
          listStyle: 'tab',
          tab: true,
          margin: "top-lg",
          data: [
            {view: "link", label: "Properties", value: "properties", $selected: true},
            {view: "link", label: "Methods", value: "methods"}
          ],
          on: {
            onItemClick: function (item) {
              this.setActiveLabel(item.label);
              var view = $$('apiView');

              switch (item.value) {
                case 'properties':
                  view.showBatch(['tab', 'props']);
                  break;
    
                case 'methods':
                view.showBatch(['tab', 'methods']);
                  break;
              }
            }
          }
        },
        {
          batch: 'props',
          layout: 'column',
          cells: [
            {
              view: 'label', margin: "top-lg", css: 'uk-alert',
              label: '<span class="uk-badge uk-badge-warning">TIP</span>&nbsp;&nbsp;Changing these properties will affect the displayed component.'
            },
            {
              view: 'label', margin: "top",
              label: '<strong>CSS</strong>'
            },
            {
              id: 'cssForm',
              view: 'form',
              margin: "top",
              formStyle: 'horizontal',
              parseProperties: function (component) {
                var setters = component.prototype.$setters;
                var name = component.prototype.__name__;
                var model = Model.properties[name];
                var properties = Object.keys(setters);
    
                this.getFieldset().setData(properties.sort().filter(function (cssName) {
                  return setters[cssName].options;
                }).map(function (cssName) {
                  var cssValue = model[cssName] || '';
                  var setter = setters[cssName];
                  var labelTemplate = '{{label}}&nbsp<i class="uk-icon-chevron-down"></i>';
                  return {
                    formLabel: UI.interpolate('<code>{{name}}</code>', {name: cssName}),
                    view: 'button',
                    label: UI.interpolate(labelTemplate, {label: model[cssName] || ''}),
                    style: {
                      minWidth: '120px',
                    },
                    dropdown: {
                      view: 'list',
                      data: Object.keys(setter.options).sort().map(function (option) {
                        return {
                          view: "link",
                          label: option || '[empty]',
                          value: option,
                          $selected: option ? cssValue.toString().indexOf(option) != -1 : model[cssName] == ''
                        }
                      }),
                      on: {
                        onOpen: function (config, node, masterConfig) {
                          this.masterComponent = $$(masterConfig.id);
                        },
                        onClosed: function () {
                          this.masterComponent = null;
                        },
                        onItemClick: function (item) {
                          if (this.isSelected(item)) {
                            this.deselect(item);
                          }
                          else {
                            if (item.value == '' || !setter.multipleAllowed) {
                              this.deselectAll();
                            }
                            this.select(item);
                          }
    
                          if (item.value) {
                            var empty = this.findOne('value', '');
                            empty.selected = false;
                            this.getComponent('id', empty.id).render();
                          }
    
                          model[cssName] = UI.pluck(this.getSelected(), 'value').join(' ');
                          this.getComponent('id', item.id).render();
                          this.masterComponent.setLabel(
                            UI.interpolate(labelTemplate, {label: model[cssName].split(' ').join(', ')})
                          );
                          var config = $$('codeView').parseCode(name);
                          $$('componentView').parseConfig(config, name);
                        }
                      }
                    }
                  }
                }));
              }
            },
            {view: 'label', margin: "top-lg", label: '<strong>MISC</strong>'},
            {
              id: 'miscForm',
              view: 'form',
              margin: "top",
              formStyle: 'horizontal',
              parseProperties: function (component) {
                var meta = UI.extend({}, component.prototype.$setters._meta);
                var name = component.prototype.__name__;
                var model = Model.properties[name];
                UI.extend(meta, component.prototype.$setters);
    
                var properties = Object.keys(meta).filter(function (n) {
                  return n.charAt(0) != '$' && n.charAt(0) != '_';
                });
    
                this.getFieldset().setData(properties.sort().filter(function (n) {
                  return !UI.isFunction(meta[n]) || !meta[n].options;
                }).map(function (n) {
                  return UI.extend(getViewConfig(meta[n], n), {
                    formLabel: UI.interpolate('<code>{{name}}</code>', {name: n})
                  })
                }));
    
                function getViewConfig(property, propName) {
                  if (UI.isString(property)) {
                    return {view: 'label', label: property};
                  }
                  else if (property.description) {
                    return {view: 'label', label: property.description};
                  }
                  else if (property.isText) {
                    return {
                      view: 'input', size: 'small',
                      value: model[propName],
                      placeholder: property.placeholder || '',
                      on: {
                        onChange: function () {
                          model[propName] = this.getValue();
                          var config = $$('codeView').parseCode(name);
                          $$('componentView').parseConfig(config, name);
                        }
                      }
                    };
                  }
                  else if (property.isBoolean) {
                    return {
                      view: 'toggle',
                      checked: model[propName],
                      on: {
                        onClick: function () {
                          model[propName] = this.getValue();
                          var config = $$('codeView').parseCode(name);
                          $$('componentView').parseConfig(config, name);
                        }
                      }
                    };
                  }
                  else if (property.options) {
                    return {
                      view: 'select', size: 'small',
                      data: property.options.map(function (n) {
                        return {label: n, value: n}
                      }),
                      on: {
                        onChange: function () {
                          model[propName] = this.getValue();
                          var config = $$('codeView').parseCode(name);
                          $$('componentView').parseConfig(config, name);
                        }
                      }
                    };
                  }
                  else {
                    return {}
                  }
                }
              }
            }
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
                  (method.params && method.params.length ?
                    '<dt>Parameters</dt><dd class="uk-hidden-small">&nbsp;</dd>{{parameters}}' : ''),
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
                  return UI.interpolate(
                    '<dt class="uk-text-muted">{{name}}</dt><dd>{{description}}</dd>', n);
                }).join('')
              }
            }));
          }
        }
      ]
    }
  ],
  on: {
    onInitialized: function () {
      $$('exampleView').showBatch(['tab', 'component']);
      $$('apiView').showBatch(['tab', 'props']);
    }
  }
}, document.getElementById('main'));


function formatReturnsString(str) {
  var regex = /\{[^\s}]*}/;
  var type = str.match(regex);
  type = type ? type[0].slice(1, -1) : '';
  return str.replace(regex, UI.interpolate(
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

function highlightBlocks() {
  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block);
  });
}

$(document).ready(function () {
  highlightBlocks();
});
