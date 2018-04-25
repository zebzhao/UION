(function (exports) {
  var $definitions = exports.definitions;
  var extend = exports.extend;

  (function ($setters) {
    $setters.order.multipleAllowed = true;
    $setters.screen.multipleAllowed = true;
    $setters.margin.multipleAllowed = true;
    $setters.position.multipleAllowed = true;
    $setters.hidden.multipleAllowed = true;
    $setters.animation.multipleAllowed = true;
  }(exports.CommonCSS.$setters));


  (function ($setters) {
    $setters.disabled.isBoolean = true;
    $setters.tooltip.isText = true;
    $setters.css.isText = true;
    $setters.dropdown.description = "Configuration object to show in a context menu.";
    $setters.uploader.isBoolean = true;

    $setters._meta = extend({
      dropdownEvent: "The event type to trigger a dropdown. Examples: onClick (default), onContext.",
      dropdownOptions: "Configuration passed to dropdown component.",
      template: "A string or a function that returns a HTML template string for the component. For examples, see source code on Github.",
      style: "A object containing properties to feed into the style attribute of the element"
    }, $setters._meta || {});
  }($definitions.element.prototype.$setters));


  (function ($setters) {
    $setters.cells.description = "A list of configuration objects.";
  }($definitions.flexgrid.prototype.$setters));


  (function ($setters) {
    $setters.help.isText = true;
    $setters.formClass.options = {"": "", "danger": "danger", "success": "success"};
    $setters.type.description = "Set the type of the HTML input element.";
    $setters.value.description = "Initial value of the HTML input element.";
  }(exports.FormControl.$setters));


  (function ($setters) {
    $setters.light.isBoolean = true;
    $setters.bodyWidth.isText = true;
    $setters.bodyHeight.isText = true;
    $setters.closeButton.isBoolean = true;
    $setters.body.description = "Configuration object to put in the modal body.";
    $setters.header.description = "Configuration object to put in the modal header.";
    $setters.footer.description = "Configuration object to put in the modal footer.";
    $setters.caption.isText = true;
    $setters._meta = extend({
      bgClose: {isBoolean: true},
      keyboard: {isBoolean: true},
      minScrollHeight: {isNumber: true},
      closeModals: {isBoolean: true},
      center: {isBoolean: true},
      dialogClass: {options: ['', 'uk-modal-dialog-blank', 'uk-modal-dialog-full']}
    }, $setters._meta || {});
  }($definitions.modal.prototype.$setters));


  (function ($setters) {
    $setters._meta = extend({
      iconClass: {isText: true},
      icon: {isText: true}
    }, $setters._meta || {});
  }($definitions.button.prototype.$setters));


  (function ($setters) {
    $setters._meta = extend({
      href: {isText: true, placeholder: 'Href attribute'},
      src: {isText: true, placeholder: 'Src attribute'},
      target: {isText: true, placeholder: 'Target attribute'}
    }, $setters._meta || {});
  }($definitions.image.prototype.$setters));


  (function ($setters) {
    $setters._meta = extend({
      href: {isText: true, placeholder: 'Href attribute'},
      target: {isText: true, placeholder: 'Target attribute'}
    }, $setters._meta || {});
  }($definitions.link.prototype.$setters));


  (function ($setters) {
    $setters.iconStyle.multipleAllowed = true;
  }($definitions.icon.prototype.$setters));


  (function ($setters) {
    $setters.color.multipleAllowed = true;
    $setters.color.description = "Set the style type of the progress element.";
  }($definitions.progress.prototype.$setters));


  (function ($setters) {
    $setters.autocomplete.isBoolean = true;
    $setters.autocapitalize.isBoolean = true;
    $setters.autocorrect.isBoolean = true;
    $setters.placeholder.isText = true;
  }(exports.InputControl.$setters));

  
  (function ($setters) {
    $setters.checked.isBoolean = true;
  }($definitions.input.prototype.$setters));


  (function ($setters) {
    $setters._meta = extend({
      caseSensitive: {isBoolean: true},
      minLength: {isNumber: true},
      sources: 'An array of sources for the autocomplete.',
      autocomplete: "A matching function that is passed a release callback to determine the final displayed autocomplete results. Default uses the 'sources' property."
    }, $setters._meta || {});
  }($definitions.input.prototype.$setters));


  (function ($setters) {
    $setters.filter.description = 'A function to determine which child components to display. The function is passed the child component object.';
    $setters.droppable.description = 'A function to determine if a child component can be drag and dropped upon. The function is passed the child component object.';

    $setters._meta = extend({
      data: 'An array of component objects.'
    }, $setters._meta || {});
  }($definitions.stack.prototype.$setters));


  (function ($setters) {
    $setters.listStyle.multipleAllowed = true;
    $setters.accordion.isBoolean = true;
    $setters.tab.description = 'When true, sets additional behaviors for tabs such as responsiveness and onTabMenuClick';
    $setters._meta = extend({
      selectable: {isBoolean: true},
      itemTagClass: {isText: true}
    }, $setters._meta || {});
  }($definitions.list.prototype.$setters));


  (function ($setters) {
    $setters._meta = extend({
      indentWidth: {isNumber: true},
      dataTransfer: 'The data representation of an item, only for FireFox.',
      draggable: {isBoolean: true},
      orderAfter: 'Low level function that determines ordering of tree items.',
      droppable: 'Function that determines if an item can be dropped upon.'
    }, $setters._meta || {});
  }($definitions.tree.prototype.$setters));

  
  (function ($setters) {
    $setters.tableStyle.multipleAllowed = true;
    $setters.columns.description = "A list of schema objects containing data display info. Example: [{name: 'property.nested'}, {template: '<input type=&quot;checkbox&quot;>'}]";
    $setters.header.description = "A list of header objects containing the header and alignment info. Example: [{header: 'Awesome', align: 'center'}]";
    $setters.footer.description = "A list of footer objects containing the footer title.";
  }($definitions.table.prototype.$setters));


  (function ($setters) {
    $setters.formStyle.multipleAllowed = true;
    $setters.fieldset.description = 'Fieldset object';
    $setters.fieldsets.description = 'An array of Fieldset objects';
  }($definitions.form.prototype.$setters));

  
  exports.debug = true;
}(UI));
