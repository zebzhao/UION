var Model = {
  containers: {
    input: wrapInForm,
    autocomplete: wrapInForm,
    select: wrapInForm,
    fieldset: function (fieldset) {
      return {
        view: 'form',
        fieldsets: [fieldset]
      }
    },
    dropdown: function (dropdown) {
      return {
        view: 'button',
        label: 'Show dropdown',
        type: 'primary',
        dropdown: dropdown.dropdown
      }
    },
    modal: function (modal) {
      return {
        cells: [
          {
            view: 'button',
            label: 'Show modal',
            type: 'primary',
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
        view: 'autocomplete',
        placeholder: 'Type something...',
        sources: [
          {value: 'Curl'},
          {value: 'Look'},
          {value: 'Age'},
          {value: 'Walk'},
          {value: 'Elope'},
          {value: 'Dig'}
        ]
      }
    },
    button: function () {
      return {
        flex: false,
        cells: [
          {
            view: 'button',
            size: 'small',
            label: 'Small Primary',
            color: 'primary'
          },
          {
            view: 'button',
            label: 'Default',
            margin: 'x'
          },
          {
            view: 'button',
            size: 'large',
            label: 'Large Link',
            link: true,
            color: 'danger'
          }
        ]
      }
    },
    card: function () {
      return {
        layout: 'column',
        cells: [
          {
            spacing: 'between',
            margin: 'bottom-lg',
            cells: [
              {
                view: 'label',
                flexSize: 'flex',
                label: 'Default Card',
                card: true
              },
              {
                view: 'label',
                flexSize: 'flex',
                label: 'Primary Card',
                card: 'primary',
                margin: 'x-lg'
              },
              {
                view: 'label',
                flexSize: 'flex',
                label: 'Secondary Card',
                card: 'secondary'
              }
            ]
          },
          {
            layout: 'column',
            card: true,
            cells: [
              {
                view: 'label',
                card: 'badge',
                badge: 'danger',
                label: 'Awesome'
              },
              {
                view: 'label',
                htmlTag: 'h3',
                label: 'Card with Header',
                card: 'header title'
              },
              {
                view: 'label',
                label: 'Primary Card',
                card: 'body'
              }
            ]
          }
        ]
      }
    },
    dropdown: function () {
      return {
        dropdown: {
          view: 'list',
          data: [
            {$header: true, label: 'Random'},
            {view: 'link', label: 'Curl into a furry donut.'},
            {view: 'link', label: 'Look into a furry donut.'},
            {view: 'link', label: 'Age into a furry donut.'},
            {view: 'link', label: 'Walk into a furry donut.'},
            {view: 'link', label: 'Elope into a furry donut.'},
            {view: 'link', label: 'Dig into a furry donut.'}
          ]
        }
      }
    },
    element: function () {
      return {
        template: '<p>{{action}} into a furry donut.</p>',
        action: 'Curl'
      }
    },
    fieldset: function () {
      return {
        view: 'fieldset',
        data: [
          {formLabel: 'User', view: 'input', value: 'Hello'},
          {formLabel: 'Password', view: 'input', type: 'password', placeholder: 'Password'},
          {view: 'button', type: 'primary', label: 'Login', inputWidth: 'medium', margin: 'top'}
        ]
      }
    },
    form: function () {
      return {
        view: 'form',
        fieldset: [
          {formLabel: 'User', view: 'input', value: 'Hello'},
          {formLabel: 'Password', view: 'input', type: 'password', placeholder: 'Password'},
          {view: 'button', type: 'primary', label: 'Login', inputWidth: 'medium', margin: 'top'}
        ]
      }
    },
    flexgrid: function () {
      return {
        cells: [
          {
            view: 'list',
            listStyle: 'side',
            data: [
              {view: 'link', label: 'Curl into a furry donut.'},
              {view: 'link', label: 'Look into a furry donut.'},
              {view: 'link', label: 'Age into a furry donut.'},
              {view: 'link', label: 'Walk into a furry donut.'},
              {view: 'link', label: 'Elope into a furry donut.'},
              {view: 'link', label: 'Dig into a furry donut.'}
            ]
          },
          {
            view: 'form',
            margin: 'left-lg',
            fieldset: [
              {formLabel: 'User', view: 'input', value: 'Hello'},
              {formLabel: 'Password', view: 'input', type: 'password', placeholder: 'Password'},
              {view: 'button', type: 'primary', label: 'Login', inputWidth: 'medium', margin: 'top'}
            ]
          }
        ]
      }
    },
    icon: function () {
      return {
        view: 'icon',
        icon: 'uk-icon-information'
      }
    },
    image: function () {
      return {
        view: 'image',
        src: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'200'%20height%3D'100'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%2323b2ff'%2F%3E%3C%2Fsvg%3E"
      }
    },
    input: function () {
      return {
        layout: 'column',
        cells: [
          {
            view: 'input',
            placeholder: 'Default Size'
          },
          {
            view: 'input',
            size: 'small',
            placeholder: 'Small Size',
            margin: 'y'
          },
          {
            view: 'input',
            size: 'large',
            placeholder: 'Large Size'
          }
        ]
      }
    },
    label: function () {
      return {
        view: 'label',
        label: 'Curl into a furry donut.'
      }
    },
    link: function () {
      return {
        view: 'link',
        label: 'Curl into a furry donut.'
      }
    },
    list: function () {
      return {
        view: 'list',
        listStyle: ['side', 'line', 'striped'],
        style: {
          minWidth: '50%'
        },
        data: [
          {view: 'link', label: 'Curl into a furry donut.'},
          {view: 'link', label: 'Look into a furry donut.'},
          {view: 'link', label: 'Age into a furry donut.'},
          {view: 'link', label: 'Walk into a furry donut.'},
          {view: 'link', label: 'Elope into a furry donut.'},
          {view: 'link', label: 'Dig into a furry donut.'}
        ]
      }
    },
    modal: function () {
      return {
        view: 'modal',
        header: {
          view: 'label',
          htmlTag: 'H3',
          label: 'Stale coffee is exquisite!'
        },
        body: {
          view: 'label',
          label: 'Medium brewed, dripper to go filter iced kopi-luwak qui variety cortado acerbic. Plunger pot latte organic sweet single shot robust cappuccino. Plunger pot qui decaffeinated crema, variety cappuccino carajillo shop blue mountain milk. Dark single origin filter, fair trade at grounds aged caffeine froth. In pumpkin spice ristretto single shot chicory mocha kopi-luwak robusta trifecta french press dark.'
        },
        footer: {
          flexAlign: 'right',
          cells: [
            {view: 'button', label: 'No way!', margin: 'right'},
            {view: 'button', type: 'primary', label: 'Yup.'}
          ]
        }
      }
    },
    progress: function () {
      return {
        view: 'progress',
        on: {
          onInitialized: function () {
            this.setValue(80);
          }
        }
      }
    },
    search: function () {
      return {
        view: 'search'
      }
    },
    select: function () {
      return {
        view: 'select',
        data: [
          {label: 'Curl'},
          {label: 'Look'},
          {label: 'Age'},
          {label: 'Walk'},
          {label: 'Elope'},
          {label: 'Dig'}
        ]
      }
    },
    table: function () {
      return {
        view: 'table',
        tableStyle: ['hover', 'striped'],
        header: true,
        footer: true,
        columns: [
          {header: 'Action', name: 'action', footer: '1'},
          {header: 'Preposition', name: 'preposition', footer: '2'},
          {header: 'Article', name: 'directObject.article', footer: '3'},
          {header: 'Object', template: "<code>{{directObject.object}}</code>", footer: 'Y'}
        ],
        data: [
          {action: 'Curl', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}},
          {action: 'Look', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}},
          {action: 'Age', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}},
          {action: 'Walk', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}},
          {action: 'Elope', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}},
          {action: 'Dig', preposition: 'into', directObject: {article: 'a', object: 'furry donut'}}
        ]
      }
    },
    tab: function () {
      return {
        view: 'list',
        listStyle: 'tab',
        tab: true,
        data: [
          {view: 'link', label: 'A', $selected: true},
          {view: 'link', label: 'B'},
          {view: 'link', label: 'C'}
        ]
      }
    },
    toggle: function () {
      return {
        view: 'toggle',
        checked: true
      }
    },
    tree: function () {
      return {
        view: 'tree',
        data: [
          {label: 'Curl', id: 'root'},
          {label: 'into', id: 'into', $parent: 'root'},
          {label: 'a', id: 'a', $parent: 'root'},
          {label: 'furry', id: 'furry', $parent: 'a'},
          {label: 'donut', id: 'donut', $parent: 'a'}
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
    view: 'form',
    fieldset: [input]
  }
}

window.onload = function () {
  handleHashChange();
  UI.removeClass(document.body, "uk-hidden");
}
window.onhashchange = handleHashChange;

function handleHashChange() {
  var value = location.hash.substring(1);
  if (Model.components[value]) {
    var view = Model.aliases[value] || value;
    // If link is empty, assume it points to a component
    UI.addClass(document.getElementById('gettingStarted'), 'uk-hidden');
    $$('methodList').parseMethods(UI.definitions[view]);
    $$('inheritedTable').parseProperties(UI.definitions[view]);
    $$('propertiesTable').parseProperties(UI.definitions[view]);
    var config = $$('codeView').parseCode(value);
    $$('componentView').parseConfig(config, view);
    $$('mainTitle').setValue(UI.capitalize(value));
    $$('mainView').show();
  }
  else {
    $$('mainView').hide();
    UI.removeClass(document.getElementById('gettingStarted'), 'uk-hidden');
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
          view: 'link',
          label: 'Model UI'
        }
      ]
    },
    {
      view: 'list',
      listStyle: 'navbar',
      data: [
        {view: 'link', label: 'Github', href: 'https://github.com/zebzhao/UION', css: 'uk-text-contrast'}
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
      {$header: true, label: 'Components'}
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
        location.hash = value || "";
      }
    }
  };
}

UI.new(sidebarTemplate(), document.getElementById('sidebar'));
UI.new(
  UI.extend(sidebarTemplate(),
    {css: 'uk-offcanvas-bar', style: {paddingTop: '32px'}}
  ),
  document.getElementById('offcanvas')
);

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
            {view: 'link', label: 'Preview', value: 'component', $selected: true},
            {view: 'link', label: 'Code', value: 'code'}
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
      margin: 'y-lg',
      card: true,
      cells: [
        {
          batch: 'tab',
          view: 'list',
          listStyle: 'tab',
          tab: true,
          card: 'header',
          data: [
            {view: 'link', label: 'Properties', value: 'properties', $selected: true},
            {view: 'link', label: 'Methods', value: 'methods'}
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
          card: 'body',
          cells: [
            {
              id: 'propertiesTable',
              view: 'table',
              header: true,
              margin: 'top',
              columns: [
                {
                  header: 'Name',
                  template: '<code class="uk-text-nowrap">{{name}}</code>'
                },
                {
                  header: 'Type',
                  template: '<span class="uk-badge uk-badge-notification">{{type}}</code>'
                },
                {
                  header: 'Description',
                  name: 'desc'
                },
                {
                  header: 'Options',
                  template: function (item) {
                    return item.options ? {
                      view: 'button',
                      label: 'Show',
                      size: 'small',
                      dropdown: {
                        view: 'list',
                        data: Object.keys(item.options).sort()
                          .map(function (option) {
                            return {
                              view: 'link',
                              label: option,
                              value: option
                            }
                          })
                      }
                    } : '';
                  }
                }
              ],
              parseProperties: function (component) {
                var meta = UI.extend({}, component.prototype.$setters.$$meta);
                var setters = component.prototype.$setters;
                var name = component.prototype.__name__;
                var model = Model.properties[name];

                var properties = Object.keys(meta)
                  .filter(function (n) {
                    return n.charAt(0) != '$' && n.charAt(0) != '_';
                  })
                  .map(function (n) {
                    return {
                      name: n,
                      type: meta[n].$$type || 'string',
                      desc: UI.isString(meta[n]) ? meta[n] : meta[n].$$desc || ''
                    }
                  });

                properties = properties.concat(Object.keys(setters)
                  .filter(function (s) {
                    return setters[s].__class__ === name;
                  })
                  .map(function (s) {
                    return {
                      name: s,
                      type: setters[s].$$type || (setters[s].options ? 'string | string[]' : 'any'),
                      desc: setters[s].$$desc || '',
                      options: setters[s].options
                    }
                  })
                );

                this.setData(properties);
              }
            },
            {
              view: 'label', margin: 'top-lg bottom', htmlTag: 'h4',
              label: 'Inherited'
            },
            {
              id: 'inheritedTable',
              view: 'table',
              margin: 'top',
              columns: [
                {
                  header: 'Name',
                  template: function (item) {
                    return item.header ?
                      '<div style="margin: 16px 0 8px -8px"><b>{{name}}</b></div>' :
                      '<code class="uk-text-nowrap">{{name}}</code>';
                  }
                },
                {
                  header: 'Type',
                  template: function (item) {
                    return item.type ? '<span class="uk-badge uk-badge-notification">{{type}}</code>' : '';
                  }
                },
                {
                  header: 'Description',
                  name: 'desc'
                },
                {
                  header: 'Options',
                  template: function (item) {
                    return item.options ? {
                      view: 'button',
                      css: 'uk-text-nowrap',
                      label: 'Show',
                      size: 'small',
                      dropdownOptions: {
                        marginY: Object.keys(item.options).length > 12 ? -300 : 8
                      },
                      dropdown: {
                        view: 'list',
                        data: Object.keys(item.options).sort()
                          .map(function (option) {
                            return {
                              view: 'link',
                              label: option,
                              value: option
                            }
                          })
                      }
                    } : '';
                  }
                }
              ],
              parseProperties: function (component) {
                var setters = component.prototype.$setters;
                var name = component.prototype.__name__;
                var model = Model.properties[name];
                var bases = {};
                var baseOrder = {};

                component.prototype.__base__.forEach(function (name, i) {
                  baseOrder[name] = ('00' + i).substr(-3);
                });

                var properties = Object.keys(setters)
                  .filter(function (s) {
                    return setters[s].__class__ !== name;
                  })
                  .map(function (s) {
                    bases[setters[s].__class__] = true;
                    return {
                      name: s,
                      sortKey: baseOrder[setters[s].__class__] + '_' + s,
                      type: setters[s].$$type || (setters[s].options ? 'string | string[]' : 'any'),
                      desc: setters[s].$$desc || '',
                      options: setters[s].options
                    }
                  })
                  .concat(Object.keys(bases).map(function (b) {
                    return {
                      name: b,
                      sortKey: baseOrder[b],
                      header: true,
                      type: '',
                      desc: ''
                    }
                  }));

                this.setData(properties.sort(function (a, b) {
                  if (a.sortKey > b.sortKey) {
                    return 1;
                  } else if (a.sortKey < b.sortKey) {
                    return -1;
                  } else {
                    return 0;
                  }
                }));
              }
            }
          ]
        },
        {
          id: 'methodList',
          batch: 'methods',
          view: 'list',
          listStyle: 'line',
          card: 'body',
          selectable: true,
          parseMethods: function (component) {
            this.setData(getComponentMethods(component).map(function (method) {
              return {
                view: 'element',
                template: [
                  '<dl class="uk-description-list-horizontal">',
                  '<dt><code>{{name}}</code></dt><dd>{{summary}}</dd>',
                  '</dl>',
                  '<dl class="uk-description-list-horizontal uk-margin-left">',
                  (method.params && method.params.length ?
                    '<dt>Parameters</dt><dd>&nbsp;</dd>{{parameters}}' : ''),
                  (method.dispatch ? '<dt>Dispatch</dt><dd><code>{{dispatch}}</code></dd>' : ''),
                  (method.returns ? '<dt>Returns</dt><dd>{{returns}}</dd>' : ''),
                  (method.example ? '<dt>Example</dt><dd><code>{{example}}</code></dd>' : ''),
                  '</dl>'
                ].join(''),
                name: method.name,
                summary: method.summary,
                dispatch: method.dispatch,
                returns: method.returns ? formatReturnsString(method.returns) : null,
                example: method.example,
                parameters: method.params.map(function (n) {
                  return UI.interpolate(
                    '<dt class="uk-text-muted" style="margin-left: 8px">{{name}}</dt><dd>{{description}}</dd>', n);
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
  var regex = /\{[^}]*}/;
  var type = str.match(regex);
  type = type ? type[0].slice(1, -1) : '';
  return str.replace(regex, UI.interpolate(
    '<span class="uk-badge uk-badge-notification uk-margin-right">{{type}}</span>', {type: type}))
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
