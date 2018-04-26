(function (exports) {
  var $definitions = exports.definitions;
  var extend = exports.extend;

  (function ($setters) {
    $setters.order.$$desc = 'Flex order of the component';
    $setters.screen.$$desc = 'Determines which screen size to show the component on';
    $setters.margin.$$desc = 'Add margins to the component';
    $setters.position.$$desc = 'Determines the CSS <code>position</code>';
    $setters.hidden.$$desc = 'Show or hide the component';
    $setters.animation.$$desc = 'Animation classes to use for the component';
  }(exports.CommonCSS.$setters));


  (function ($setters) {
    $setters.disabled.$$type = 'boolean';
    $setters.tooltip.$$type = 'string';
    $setters.css.$$type = 'string';
    $setters.dropdown.$$desc = 'Configuration object to show in a context menu';
    $setters.uploader.$$type = 'boolean';

    $setters.$$meta = extend({
      dropdownEvent: "The event type to trigger a dropdown",
      dropdownOptions: "Configuration passed to dropdown component",
      template: "A string or a function that returns a HTML template string for the component. For examples, see source code on Github.",
      style: "A object containing properties to feed into the style attribute of the element"
    }, $setters.$$meta || {});
  }($definitions.element.prototype.$setters));


  (function ($setters) {
    $setters.cells.$$desc = "A list of configuration objects.";
  }($definitions.flexgrid.prototype.$setters));


  (function ($setters) {
    $setters.help.$$type = 'string';
    $setters.formClass.options = {"": "", "danger": "danger", "success": "success"};
    $setters.type.$$desc = "Set the type of the HTML input element";
    $setters.value.$$desc = "Initial value of the HTML input element";
  }(exports.FormControl.$setters));


  (function ($setters) {
    $setters.light.$$type = 'boolean';
    $setters.bodyWidth.$$type = 'string';
    $setters.bodyHeight.$$type = 'string';
    $setters.closeButton.$$type = 'boolean';
    $setters.body.$$desc = "Configuration object to put in the modal body";
    $setters.header.$$desc = "Configuration object to put in the modal header";
    $setters.footer.$$desc = "Configuration object to put in the modal footer";
    $setters.caption.$$type = 'string';
    $setters.$$meta = extend({
      bgClose: {$$type: 'boolean'},
      keyboard: {$$type: 'boolean'},
      minScrollHeight: {$$type: 'number'},
      closeModals: {$$type: 'boolean'},
      center: {$$type: 'boolean'},
      dialogClass: {options: ['', 'uk-modal-dialog-blank', 'uk-modal-dialog-full']}
    }, $setters.$$meta || {});
  }($definitions.modal.prototype.$setters));


  (function ($setters) {
    $setters.$$meta = extend({
      iconClass: {$$type: 'string'},
      icon: {$$type: 'string'}
    }, $setters.$$meta || {});
  }($definitions.button.prototype.$setters));


  (function ($setters) {
    $setters.href.$$type = 'string';
    $setters.src.$$type = 'string';
    $setters.target.$$type = 'string';
  }($definitions.image.prototype.$setters));


  (function ($setters) {
    $setters.href.$$type = 'string';
    $setters.target.$$type = 'string';
  }($definitions.link.prototype.$setters));


  (function ($setters) {
    $setters.iconStyle.$$desc = 'Type of icon';
  }($definitions.icon.prototype.$setters));


  (function ($setters) {
    $setters.color.$$desc = "Set the style type of the progress element";
  }($definitions.progress.prototype.$setters));


  (function ($setters) {
    $setters.autocomplete.$$type = 'boolean';
    $setters.autocapitalize.$$type = 'boolean';
    $setters.autocorrect.$$type = 'boolean';
    $setters.placeholder.$$type = 'string';
  }(exports.InputControl.$setters));

  
  (function ($setters) {
    $setters.checked.$$type = 'boolean';
  }($definitions.input.prototype.$setters));


  (function ($setters) {
    $setters.$$meta = extend({
      caseSensitive: {$$type: 'boolean'},
      minLength: {$$type: 'number'},
      sources: 'An array of sources for the autocomplete.',
      autocomplete: "A matching function that is passed a release callback to determine the final displayed autocomplete results. Default uses the 'sources' property."
    }, $setters.$$meta || {});
  }($definitions.input.prototype.$setters));


  (function ($setters) {
    $setters.filter.$$desc = 'A function to determine which child components to display. The function is passed the child component object.';
    $setters.droppable.$$desc = 'A function to determine if a child component can be drag and dropped upon. The function is passed the child component object.';

    $setters.$$meta = extend({
      data: 'An array of component objects.'
    }, $setters.$$meta || {});
  }($definitions.stack.prototype.$setters));


  (function ($setters) {
    $setters.listStyle.$$desc = 'Predefined list style';
    $setters.accordion.$$type = 'boolean';
    $setters.tab.$$desc = 'When true, sets additional behaviors for tabs such as responsiveness and onTabMenuClick';
    $setters.$$meta = extend({
      selectable: {$$type: 'boolean'},
      itemTagClass: {$$type: 'string'}
    }, $setters.$$meta || {});
  }($definitions.list.prototype.$setters));


  (function ($setters) {
    $setters.$$meta = extend({
      indentWidth: {$$type: 'number'},
      dataTransfer: 'The data representation of an item, only for FireFox',
      draggable: {$$type: 'boolean'},
      orderAfter: {$$type: '(other: any) => boolean', $$desc: 'Low level function that determines ordering of tree items'},
      droppable: {
        $$type: '(target: any, src: any, srcElement: Element) => boolean',
        $$desc: 'Function that determines if an item can be dropped upon'
      }
    }, $setters.$$meta || {});
  }($definitions.tree.prototype.$setters));

  
  (function ($setters) {
    $setters.tableStyle.$$desc = 'Predefined table style';
    $setters.columns.$$desc = "List of schema objects containing data display info";
    $setters.columns.$$type = 'any[]';
    $setters.header.$$desc = "List of header objects containing the header and alignment info";
    $setters.header.$$type = 'boolean | any[]';
    $setters.footer.$$desc = "List of footer objects containing the footer title";
    $setters.footer.$$type = 'boolean | any[]';
    $setters.caption.$$desc = 'Table caption';
    $setters.caption.$$type = 'string';
  }($definitions.table.prototype.$setters));


  (function ($setters) {
    $setters.formStyle.$$desc = 'Predefined form style';
    $setters.fieldset.$$desc = 'Fieldset object';
    $setters.fieldsets.$$desc = 'An array of Fieldset objects';
    $setters.fieldset.$$type = 'any[]';
  }($definitions.form.prototype.$setters));

  
  exports.debug = true;
}(UI));
