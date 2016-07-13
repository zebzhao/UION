Pykit Changelog
===============

Here you can see the full list of changes between each Pykit release.

Version 0.3.8
-----------
- added: select multiple files with html5
- changed: uploader settings moved to `uploadOptions` config

Version 0.3.7
-----------
- added: `orderAfter` function for custom `tree` sort
- fixed: sorting order of `tree`
- tweaks: dark theme colors

Version 0.3.6
-----------
- added: new select component
- added: justify and mode configs based on UIkit dropdown options
- added: `indexOf()` to `list, select, table, tree`
- added: `onKeyUp` event to `input`
- added: new dark theme
- fixed: path to font-awesome was not correct
- fixed: dropdown master now refers to actual clicked ui
- fixed: moved old master to `grandparent` field

Version 0.3.4
-----------
- added: `type: 'form'` config to `label`
- added: `fill: 'screen'` config to `flexgrid`
- added: `setValue()` to `label`
- fixed: substr also matched by `showBatch`
- fixed: `dropdown.master` refers to UI object instead of config
- fixed: flexbox min-width bug with firefox
- changed: css changed to almost-flat theme

Version 0.3.3
-----------
- added `progress` component
- fixed bug with tabs

Version 0.3.2
-----------
- added `each()`, `getChildren()`, `getItems()` to `flexgrid` component
- added `bodyHeight` config to `modal` to control modal height
- added `autocomplete`, `autocorrect`, `autocapitalize` config to `input`
- added `onMouseDown`, `onMouseUp` events to `button`, `link`
- added `onTabMenuClick` event to list with `tab` config set to `responsive`
- added `contains()` to `list`, `fieldset`, `tree`, `table`
- fixed `getValues()`, `setValues()` work with nested components in `form`
- fixed responsiveness when `tab` config is set on `list`

Version 0.3.1
-----------
- added `clear()`, `enable()` and `disable()` to forms and fieldsets
- added `reset()` to input, password, search components

Version 0.3.0
-----------
- fixed updateItem(), should not swap list order

Version 0.2.9
-----------
- added args to open() on modal
- added JSON support for header, footer of modals
- added header, footer, body public attributes to modals and tables
- fixed onClick event arguments
- fixed set() working on not just setters, but all configs
- refactored closeItem() to its own function for tabs
- removed margins for fieldset component

Version 0.2.8
-----------
- fixed autocomplete not working on Chrome, but FF
- made autocomplete case-insensitive by default (changed by caseSensitive configuration)
- fix dropdown not closing on mobile (added 10ms delay)
- upgraded dependencies (uikit from 2.24.3 to 2.24.5)

Version 0.2.7
-----------
- fixed bug not able to set checkbox to unchecked in forms
- fixed setValue for checkbox component

Version 0.2.6
-----------
- fixed uploader config not being set
- fixed critical bug: removing tree branch with multiple items not removing all children

Version 0.2.3
-----------
- added $preventDefault option to all click events
- links and uploader components will have $preventDefault=false to start
- added top, left, bottom, right position attributes to all elements
- added select(), unselect(), isSelected() to buttons
- removed coloring on links/selections
- list items are unselectable by default now

Version 0.2.1
-----------
- packaged UIkit dependencies together
- fixed uk-icon-button ({view: icon, type: button}) configuration
- added more generic setActive() method to list
- changed build process
- added new spring theme

Version 0.1.0
-----------
