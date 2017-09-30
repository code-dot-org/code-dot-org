# API Reference

### SimpleSelect props

|    Property                |   Type                              |   Description                  |
|----------------------------|-------------------------------------|--------------------------------|
|    autofocus               | Boolean                             | opens the dropdown menu on load if set to true (defaults to false) |
|    cancelKeyboardEventOnSelection | Boolean                      | defaults to true, set this to fale when using tab as a delimiter for example |
|    className               | String                              | class name for the outer element, in addition to "simple-select"|
|    createFromSearch        | [Item] -> String -> Item?           | implement this function to create new items on the fly, `(options, search){return {label: search, value: search}}`, return null to avoid option creation for the given parameters|
|    defaultValue            | Item                                | similar to the defaultValue prop of React.DOM.Select |
|    delimiters              | [KeyCode]                           | a collection of character keycodes that when pressed confirm selection of the highlighted item |
|    disabled                | Boolean                             | disables interaction with the Select control|
|    dropdownDirection       | Int                                 | defaults to 1, setting it to -1 opens the dropdown upward|
|    editable                | Item -> String                      | `(item){return item.label}`|
|    filterOptions           | [Item]-> String -> [Item]           | implement this function for custom synchronous filtering logic, `(options, search) {return options}`|
|    firstOptionIndexToHighlight | Int -> [Item] -> Item -> String | `(index, options, value, search){return index}` the default implementation simply returns the computed `index` passed in as the first argument, but you can use options, value & search to override this value or return -1 to select nothing by default|
|    groupId                 | Item -> b                           | `(item){return item.groupId}` this function is used to identify which group an option belongs to, it must return a value that matches the groupId property of an object in the groups collection|
|    groups                  | [Group]                             | collection of objects where each object must atleast have a groupId property|
|    groupsAsColumns         | Boolean                             | display option groups in columns|
|    hideResetButton         | Boolean                             | hides the reset button, even if the select element is not empty |
|    highlightedUid          | object                              | the uid (unique id) of the currently highlighted option, uid of an option is obtained from the `uid` prop defined below |
|    name                    | String                              | defaults to undefined, provide a name property to create an hidden input element for html form serialization |
|    open                    | Boolean                             | controls the visibility of the dropdown menu |
|    onBlur                  | Event -> Void                       | `({originalEvent :: e, value :: Item, open :: Boolean}){}` |
|    onFocus                 | Event -> Void                       | `({originalEvent :: e, value :: Item, open :: Boolean}){}` |
|    onHighlightedUidChange  | object -> Void                      | `(uid){}` invoked when the highlighted option changes |
|    onKeyboardSelectionFailed | Int -> Void                       | `(keyCode){}` fired when the user hits the return key on an empty list of options |
|    onOpenChange            | Boolean -> Void                     | `(open){}` open is true if the dropdown opened and false if it closed|
|    onPaste                 | Event -> Void                       | invoked when the user pastes text in the input field and `props.valueFromPaste` is not specified|
|    onSearchChange          | String -> Void                      | `(search){}` invoked when the search text in the input field changes|
|    onValueChange           | Item -> Void                        | `(selectedValue){}` invoked when the user selects an option (by click on enter)|
|    options                 | [Item]                              | list of items by default each option object MUST have label & value property, otherwise you must implement the render* & filterOptions methods|
|    placeholder             | String                              | displayed when there is no value|
|    renderGroupTitle        | Int -> Group -> ReactElement        | `(index, group){return React.DOM.div(null)}` returns a custom way for rendering the group title|
|    renderNoResultsFound    | Item -> String -> ReactElement      | `(item, search){return React.DOM.div(null);}` returns a custom way for rendering the "No results found" error|
|    renderOption            | Item -> ReactElement                | `(item){return React.DOM.div(null);}` returns a custom way for rendering each option|
|    renderResetButton       | () -> ReactElement                  | returns a custom way for rendering the reset button
|    renderToggleButton      | ({open, flipped}) -> ReactElement   | returns a custom way for rendering the toggle button
|    renderValue             | Item -> ReactElement                | `(item){return React.DOM.div(null);}` returns a custom way for rendering the selected value|
|    restoreOnBackspace      | Item -> String                      | `(item){return item.label;}` implement this method if you want to go back to editing the item when the user hits the [backspace] key instead of getting removed|
|    search                  | String                              | the text displayed in the search box|
|    serialize               | Item -> String                      | `(item){ return !!item ? item.value : undefined; }` the value of the hidden input element for form serialization |
|    style                   | Object                              | the CSS styles for the outer element|
|    tether                  | Boolean                             | defaults to false, set this prop to true to enable the tether library for the dropdown menu|
|    tether-props            | Object                              | extra props passed to ReactTether for example: `{ parentElement: () => document.body }`|
|    theme                   | String                              | `default` | `material` | `bootstrap3` | custom theme name |
|    transitionEnter         | Boolean                             | defaults to false, setting this to true animates the opening of the dropdown using the `slide-*` css classes|
|    transitionEnterTimeout  | Number                              | duration specified in milliseconds, it must match the transition duration specified under the CSS class `.slide-enter-active` |
|    transitionLeave         | Boolean                             | defaults to false, setting this to true animates the closing of the dropdown using the `slide-*` css classes|
|    transitionLeaveTimeout  | Number                              | duration specified in milliseconds, it must match the transition duration specified under the CSS class `.slide-leave-active` |
|    uid                     | (Eq e) => Item -> e                 | `(item){return item.value}` returns a unique id for a given option, defaults to the value property|
|    value                   | Item                                | the selected value, i.e. one of the objects in the options array|
|    valueFromPaste          | [Item] -> Item -> String -> Item    | `(options, value, pastedText){}` invoked when the user pastes text in the input field, here you can convert the pasted text into an item that will then show up as selected |

### SimpleSelect methods

|    Method                       |    Type                  |    Description                 |
|---------------------------------|--------------------------|--------------------------------|
| focus                           | (a -> Void) -> Void      | `this.refs.selectInstance.focus(callback)` opens the list of options and positions the cursor in the input control, the callback is fired when the dropdown becomes visible|
| blur                            | a -> Void                | `this.refs.selectInstance.blur()` blurs focus from the input control and closes the dropdown|
| highlightFirstSelectableOption  | a -> Void                | `this.refs.selectInstance.highlightFirstSelectableOption()`|
| value                           | a -> Item                | `this.refs.selectInstance.value()` returns the current selected item|

### MultiSelect props
In addition to the props above

|    Property                |   Type                               |   Description|
|--------------------------- |--------------------------------------|---------------------------------|
|    anchor                  | Item                                 | positions the cursor ahead of the anchor item, set this property to undefined to lock the cursor at the start|
|    createFromSearch        | [Item] -> [Item] -> String -> Item?  | `(options, values, search){return {label: search, value: search}}`|
|    defaultValues           | [Item]                               | similar to the defaultValue prop of React.DOM.Select but instead takes an array of items|
|    filterOptions           | [Item] -> [Item] -> String -> [Item] | `(options, values, search){return options}`|
|    onAnchorChange          | Item -> Void                         | `(anchor){}` implement this method if you want to override the default behaviour of the cursor|
|    onBlur                  | object -> Void                       | `({values :: [Item], open :: Boolean, originalEvent :: DOMEvent}){}`|
|    onFocus                 | object -> Void                       | `({values :: [Item], open :: Boolean, originalEvent :: DOMEvent}){}`|
|    onValuesChange          | [Item] -> Void                       | `(values){}`|
|    maxValues               | Int                                  | the maximum values that can be selected, after which the control is disabled|
|    closeOnSelect           | Boolean                              | as the name implies, closes the options list on selecting an option|
|    valuesFromPaste         | [Item] -> [Item] -> String ->[Item]  | `(options, values, pastedText){}` invoked when the user pastes text in the input field, here you can convert the pasted text into a list of items that will then show up as selected |

### MultiSelect methods
same as SimpleSelect but use `this.refs.multiSelectInstance.values()` to get the selected values instead of the `value` method.

### HighlightedText props
used for [search highlighting](http://furqanzafar.github.io/react-selectize/#/?category=simple&example=search-highlighting)

|    Property                |   Type                               |   Description|
|--------------------------- |--------------------------------------|---------------------------------|
|    partitions              | [[Int, Int, Boolean]]                | collection of ranges which should or should not be highlighted, its the result of the partitionString method of the [prelude-extension](https://www.npmjs.com/package/prelude-extension) library|
|    text                    | String                               | the string that is partitioned, the partitions collection above only has the ranges & so we need to pass the original text as well|
|    style                   | inline CSS styles object             | inline styles applied to the root node|
|    highlightStyle          | inline CSS styles object             | inline styles applied to the highlighted spans|
