# React Selectize

## 3.0.1 / 29th July 2017
* fix peer dependencies react-transition-group@1.1.2 instead of the latest version

## 3.0.0 / 29th July 2017
* support for React 16 & node 8.2.1 thanks @elisherer

## 2.1.0 / 1st December 2016
* added `on-blur-resets-input` thanks @dcalhoun

## 2.0.2 / 11th May 2016
* simple select accepts 0 as value (thanks @Nyalab)

## v2.0.1 / 11th April 2016
## v2.0.0 / 11th April 2016
* switched to major version semver
* added React@15.0 to peer deps
* abandoned git flow branching model

## v0.9.0 / 18th March 2016
* added `on-paste` and `value-from-paste` props to `SimpleSelect`
* added `highlighted-uid` and `on-highlighted-uid-change` props to track the current highlighted option
* fixed a bug in `dropdown-direction` prop

## v0.8.4 / 4th March 2016
* added `tether-props` prop to customize the parent element (defaults to body)
* expose `highlighted-ui` & `on-highlighted-uid-change` props for `MultiSelect`
* fixed `cancel-keyboard-event-on-selection` prop

## v0.8.3 / 2nd March 2016
* "double click bug" fix

## v0.8.2 / 2nd March 2016
* added a new prop `firstOptionIndexToHighlight` to both Simple & MultiSelect
* made the text in search field selectable

## v0.8.1 / 19th February 2016
* added `cancelKeyboardEventOnSelection` prop 

## v0.8.0 / 15th February 2016
* added hideResetButton prop thanks [@marchbnr](https://github.com/marchbnr)
* added renderToggleButton prop
* added renderResetButton prop
* bug fixes for IE 11 (#37)
* renamed css classes (**Breaking Changes**)

| Before | Now |
|--------|-----|
| .control-wrapper | .root-node |
| .react-selectize-selected-values | .react-selectize-search-field-and-selected-values |
| .react-selectize-arrow-container | .react-selectize-toggle-button-container |
| .react-selectize-arrow | .react-selectize-toggle-button |
| .react-selectize-reset-container | .react-selectize-reset-button-container |
| .react-selectize-reset | .react-selectize-reset-button |

## v0.7.4 / 10th February 2016
## v0.7.3 / 10th February 2016
* css fixes for IE11

## v0.7.2 / 8th February 2016
* css improvements

## v0.7.1 / 7th February 2016
* bower support (using npmcdn)

## v0.7.0 / 7th February 2016
* umd build 
*  added `theme` prop, 3 built-in themes (default, bootstrap3 & material)
* **Breaking Change**: moved index.css from `src/` directory to `themes` & `dist` directory
* fixed issues with `search` & `open` props
* **Breaking Change**: removed `autosize` prop

## v0.6.2 / 2nd February 2016
* hide the reset button if the select is empty
* minor css improvements

## v0.6.1 / 1st February 2016
* disable keyboard selection when control or command keys are pressed
* minor css improvements

## v0.6.0 / 30th January 2016
* added `autofocus` prop, that will automatically toggle the dropdown on load
* removed the requirement for passing callback as the last argument to on-*-change props
* fixed many `focus` & `blur` related issues
* **Breaking Change** replaced `on-enter` prop with `on-keyboard-selection-failed` 

## v0.5.3 / 27th January 2016
* introduced `name` & `serialize` props for form serialization

## v0.5.2 / 26th January 2016
* fixed option groups related bug

## v0.5.1 / 25th January 2016
* fixed tabbing (broken in v0.5.0, caused by refactoring related to blur method) (#25)

## v0.5.0 / 25th January 2016
* added `tether` prop
* added `blur` method
* close dropdown when nothing is selected on pressing the return key
* namespaced css classes (*Breaking Change*) :

> `.dropdown-transition` div is only used if any one (or both) of `transition-enter`, `transition-leave` props is / are specified, 
before the `.dropdown` div was always being wrapped in `.dropdown-transition` even if animation was not required.

| Before | Now |
|--------|-----|
| .arrow | .react-selectize-arrow |
| .control | .react-selectize-control |
| .dropdown | .react-selectize-dropdown |
| .dropdown-transition | .react-selectize-dropdown-container |
| .placeholder | .react-selectize-placeholder |
| .reset | .react-selectize-reset |

## v0.4.1 / 22nd January 2016
* merged pull request (fixes an issue when unmounting with dropdown open) (#23), thanks [@yuters](https://github.com/yuters)

## v0.4.0 / 21st January 2016
* Added two new props `delimiters` & `valuesFromPaste` (#21)

## v0.3.11 / 20th January 2016
* fixed case sensitivity bug in MultiSelect. (#20)

## v0.3.10 / 19th January 2016
* fixed a bug where elements behind the dropdown were not clickable even though the dropdown was closed. (#18)

## v0.3.9 / 18th January 2016
* added `on-enter :: Item -> Void` prop, fired (with the `highlighted-option`) when the user hits the enter key (#19)

## v0.3.8 / 16th January 2016
* fixed a bug where passing `restore-on-backspace` prop wouldn't work in conjunction with `render-no-results-found` prop (#14)

## v0.3.7 / 2nd November 2015
* call `on-blur` only if the dropdown is open, thanks [@alurim](https://github.com/alurim)

## v0.3.6 / 30th October 2015
* updated package.json to include (React 0.14.0 and above) thanks [@HankMcCoy](https://github.com/HackMcCoy)

## v0.3.5 / 16th October 2015
* improved the default auto-size implementation

## v0.3.4 / 14th October 2015
* fixed a bug where the height of the ".dropdown-transition" element blocked the dom underneath (#6)

## v0.3.3 / 13th October 2015
* added missing dependency react-addons-css-transition-group to package.json

## v0.3.2 / 13th October 2015
* animated dropdown

## v0.3.1 / 10th October 2015
* added `defaultValue` prop for `SimpleSelect` & `defaultValues` prop for `MultiSelect`

## v0.3.0 / 9th October 2015
* upgraded to react 0.14.0
* you can now return an object from the uid prop, made uid prop optional (even for custom option object)
* added `editable` prop for `SimpleSelect`
* fixed a bug where changing the selectable property would not rerender the option
* wrap around when navigating options with arrow keys
* close multi-select when there are no more options left to select

## v0.2.6 / 8th October 2015
* fixed a bug where selecting an option did not update the highlighted-uid (multi select). Thanks [@edgarzakaryan](https://github.com/edgarzakaryan)

## v0.2.5 / 28th September 2015
* create index.css to fix style duplication when importing both SimpleSelect.css & MultiSelect.css
* clicking on the arrow button toggles the dropdown
* minor css tweaks

## v0.2.4 / 26th September 2015
* perf optimization, using result of props.uid method to compare items instead of deep equals
* added HighlightedText component to help with search highlighting

## v0.2.3 / 23rd September 2015
* fixed a bug where passing a single child element would not show up in the dropdown
* fixed other minor bugs identified by unit testing

## v0.2.2 / 21st September 2015
* fixed a bug where the input element would not autosize on entering search text
* avoid firing onValueChange with undefined value when the user enters new search text

## v0.2.1 / 20th September 2015
* fixed React Warnings caused by missing key property for ValueWrapper components
* allowing for wide range of react versions including 0.14.x-rc*
* uid property for MultiSelect components

## v0.2.0 / 19th September 2015
* drop in replacement for React.DOM.Select, accepts options as children
* added a new prop `dropdownDirection`, setting it to -1 forces the options menu to open upwards
* option group support (as rows and columns)
* updated the signature of refs.selectInstance.focus from `a -> Void` to `a -> (a -> Void) -> Void`, i.e. the focus function now accepts a callback as the first parameter which is fired when the options menu is visible
* improved performance by implementing shouldComponentUpdate lifecycle method for *Wrapper classes, added `uid :: (Eq e) => Item -> e` prop
* changed the signature of renderOption & renderValue props from `Int -> Item -> ReactElement` to `Item -> ReactElement`

## v0.1.6 / 19th September 2015
* introduced a new prop `autosize`, allows consumers to provide custom autosize logic for search input, the default implementation now supports nonmodern browsers

## v0.1.4 / 15th September 2015
* fixed option menu toggle on tap/click in mobile safari

## v0.1.3 / 12th September 2015
* fixed a bug where invoking the callback onValueChange synchronously would not close the options menu
* fixed a bug where the SimpleSelect onValueChange callback was invoked even when the user selected the same item
* minor tweaks & improvements to the default stylesheet

## v0.1.2 / 11th September 2015
* updated package.json added keywords & removed license property

## v0.1.1 / 11th September 2015
* added `highlightFirstSelectableOption` method to both the SimpleSelect & the MultiSelect components.
* changed filterOptions signature for SimpleSelect from `[Item] -> Item -> String -> [Item]` to `[Item]-> String -> [Item]`