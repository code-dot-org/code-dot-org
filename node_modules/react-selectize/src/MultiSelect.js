(function(){
  var ref$, all, any, camelize, difference, drop, filter, find, findIndex, id, last, map, reject, isEqualToObject, React, createFactory, div, img, span, ReactSelectize, cancelEvent, MultiSelect, toString$ = {}.toString;
  ref$ = require('prelude-ls'), all = ref$.all, any = ref$.any, camelize = ref$.camelize, difference = ref$.difference, drop = ref$.drop, filter = ref$.filter, find = ref$.find, findIndex = ref$.findIndex, id = ref$.id, last = ref$.last, map = ref$.map, reject = ref$.reject;
  isEqualToObject = require('prelude-extension').isEqualToObject;
  React = require('react'), createFactory = React.createFactory;
  ref$ = require('react-dom-factories'), div = ref$.div, img = ref$.img, span = ref$.span;
  ReactSelectize = createFactory(require('./ReactSelectize'));
  cancelEvent = require('./utils').cancelEvent;
  module.exports = MultiSelect = (function(superclass){
    var prototype = extend$((import$(MultiSelect, superclass).displayName = 'MultiSelect', MultiSelect), superclass).prototype, constructor = MultiSelect;
    MultiSelect.defaultProps = {
      className: "",
      closeOnSelect: false,
      defaultValues: [],
      delimiters: [],
      filterOptions: curry$(function(options, values, search){
        var this$ = this;
        return filter(function(it){
          return it.label.toLowerCase().trim().indexOf(search.toLowerCase().trim()) > -1;
        })(
        reject(function(it){
          return in$(it.label.trim(), map(function(it){
            return it.label.trim();
          }, values != null
            ? values
            : []));
        })(
        options));
      }),
      firstOptionIndexToHighlight: id,
      onBlur: function(e){},
      onFocus: function(e){},
      onPaste: function(e){
        true;
      },
      serialize: map(function(it){
        return it != null ? it.value : void 8;
      }),
      tether: false
    };
    function MultiSelect(props){
      MultiSelect.superclass.call(this, props);
      this.state = {
        anchor: !!this.props.values ? last(this.props.values) : undefined,
        highlightedUid: undefined,
        open: false,
        scrollLock: false,
        search: "",
        values: this.props.defaultValues
      };
    }
    MultiSelect.prototype.render = function(){
      var ref$, anchor, filteredOptions, highlightedUid, onAnchorChange, onOpenChange, onHighlightedUidChange, onSearchChange, onValuesChange, search, open, options, values, autofocus, autosize, cancelKeyboardEventOnSelection, delimiters, disabled, dropdownDirection, groupId, groups, groupsAsColumns, hideResetButton, inputProps, name, onKeyboardSelectionFailed, renderToggleButton, renderGroupTitle, renderResetButton, serialize, tether, tetherProps, theme, transitionEnter, transitionLeave, transitionEnterTimeout, transitionLeaveTimeout, uid, this$ = this;
      ref$ = this.getComputedState(), anchor = ref$.anchor, filteredOptions = ref$.filteredOptions, highlightedUid = ref$.highlightedUid, onAnchorChange = ref$.onAnchorChange, onOpenChange = ref$.onOpenChange, onHighlightedUidChange = ref$.onHighlightedUidChange, onSearchChange = ref$.onSearchChange, onValuesChange = ref$.onValuesChange, search = ref$.search, open = ref$.open, options = ref$.options, values = ref$.values;
      if ((ref$ = this.props) != null) {
        autofocus = ref$.autofocus, autosize = ref$.autosize, cancelKeyboardEventOnSelection = ref$.cancelKeyboardEventOnSelection, delimiters = ref$.delimiters, disabled = ref$.disabled, dropdownDirection = ref$.dropdownDirection, groupId = ref$.groupId, groups = ref$.groups, groupsAsColumns = ref$.groupsAsColumns, hideResetButton = ref$.hideResetButton, inputProps = ref$.inputProps, name = ref$.name, onKeyboardSelectionFailed = ref$.onKeyboardSelectionFailed, renderToggleButton = ref$.renderToggleButton, renderGroupTitle = ref$.renderGroupTitle, renderResetButton = ref$.renderResetButton, serialize = ref$.serialize, tether = ref$.tether, tetherProps = ref$.tetherProps, theme = ref$.theme, transitionEnter = ref$.transitionEnter, transitionLeave = ref$.transitionLeave, transitionEnterTimeout = ref$.transitionEnterTimeout, transitionLeaveTimeout = ref$.transitionLeaveTimeout, uid = ref$.uid;
      }
      return ReactSelectize(import$(import$({
        autofocus: autofocus,
        autosize: autosize,
        cancelKeyboardEventOnSelection: cancelKeyboardEventOnSelection,
        className: "multi-select " + this.props.className,
        delimiters: delimiters,
        disabled: disabled,
        dropdownDirection: dropdownDirection,
        groupId: groupId,
        groups: groups,
        groupsAsColumns: groupsAsColumns,
        hideResetButton: hideResetButton,
        highlightedUid: highlightedUid,
        onHighlightedUidChange: onHighlightedUidChange,
        inputProps: inputProps,
        name: name,
        onKeyboardSelectionFailed: onKeyboardSelectionFailed,
        renderGroupTitle: renderGroupTitle,
        renderResetButton: renderResetButton,
        renderToggleButton: renderToggleButton,
        scrollLock: this.state.scrollLock,
        onScrollLockChange: function(scrollLock){
          return this$.setState({
            scrollLock: scrollLock
          });
        },
        tether: tether,
        tetherProps: tetherProps,
        theme: theme,
        transitionEnter: transitionEnter,
        transitionEnterTimeout: transitionEnterTimeout,
        transitionLeave: transitionLeave,
        transitionLeaveTimeout: transitionLeaveTimeout,
        uid: uid,
        ref: 'select',
        anchor: anchor,
        onAnchorChange: onAnchorChange,
        open: open,
        onOpenChange: onOpenChange,
        options: options,
        renderOption: this.props.renderOption,
        firstOptionIndexToHighlight: function(){
          return this$.firstOptionIndexToHighlight(options);
        },
        search: search,
        onSearchChange: function(search, callback){
          return onSearchChange(!!this$.props.maxValues && values.length >= this$.props.maxValues ? "" : search, callback);
        },
        values: values,
        onValuesChange: function(newValues, callback){
          return onValuesChange(newValues, function(){
            callback();
            if (this$.props.closeOnSelect || (!!this$.props.maxValues && this$.values().length >= this$.props.maxValues)) {
              return onOpenChange(false, function(){});
            }
          });
        },
        renderValue: this.props.renderValue,
        serialize: serialize,
        onBlur: function(e){
          onSearchChange("", function(){
            return this$.props.onBlur({
              open: open,
              values: values,
              originalEvent: e
            });
          });
        },
        onFocus: function(e){
          this$.props.onFocus({
            open: open,
            values: values,
            originalEvent: e
          });
        },
        onPaste: (function(){
          var ref$;
          switch (false) {
          case typeof ((ref$ = this.props) != null ? ref$.valuesFromPaste : void 8) !== 'undefined':
            return this.props.onPaste;
          default:
            return function(e){
              var clipboardData;
              clipboardData = e.clipboardData;
              (function(){
                var newValues;
                newValues = values.concat(this$.props.valuesFromPaste(options, values, clipboardData.getData('text')));
                return onValuesChange(newValues, function(){
                  return onAnchorChange(last(newValues));
                });
              })();
              return cancelEvent(e);
            };
          }
        }.call(this)),
        placeholder: this.props.placeholder,
        style: this.props.style
      }, (function(){
        switch (false) {
        case typeof this.props.restoreOnBackspace !== 'function':
          return {
            restoreOnBackspace: this.props.restoreOnBackspace
          };
        default:
          return {};
        }
      }.call(this))), (function(){
        switch (false) {
        case typeof this.props.renderNoResultsFound !== 'function':
          return {
            renderNoResultsFound: function(){
              return this$.props.renderNoResultsFound(values, search);
            }
          };
        default:
          return {};
        }
      }.call(this))));
    };
    MultiSelect.prototype.getComputedState = function(){
      var anchor, highlightedUid, open, search, values, ref$, onAnchorChange, onHighlightedUidChange, onOpenChange, onSearchChange, onValuesChange, optionsFromChildren, unfilteredOptions, filteredOptions, newOption, options, this$ = this;
      anchor = this.props.hasOwnProperty('anchor')
        ? this.props.anchor
        : this.state.anchor;
      highlightedUid = this.props.hasOwnProperty('highlightedUid')
        ? this.props.highlightedUid
        : this.state.highlightedUid;
      open = this.isOpen();
      search = this.props.hasOwnProperty('search')
        ? this.props.search
        : this.state.search;
      values = this.values();
      ref$ = map(function(p){
        switch (false) {
        case !(this$.props.hasOwnProperty(p) && this$.props.hasOwnProperty(camelize("on-" + p + "-change"))):
          return function(o, callback){
            this$.props[camelize("on-" + p + "-change")](o, function(){});
            return this$.setState({}, callback);
          };
        case !(this$.props.hasOwnProperty(p) && !this$.props.hasOwnProperty(camelize("on-" + p + "-change"))):
          return function(arg$, callback){
            return callback();
          };
        case !(!this$.props.hasOwnProperty(p) && this$.props.hasOwnProperty(camelize("on-" + p + "-change"))):
          return function(o, callback){
            var ref$;
            return this$.setState((ref$ = {}, ref$[p + ""] = o, ref$), function(){
              callback();
              return this$.props[camelize("on-" + p + "-change")](o, function(){});
            });
          };
        case !(!this$.props.hasOwnProperty(p) && !this$.props.hasOwnProperty(camelize("on-" + p + "-change"))):
          return function(o, callback){
            var ref$;
            return this$.setState((ref$ = {}, ref$[p + ""] = o, ref$), callback);
          };
        }
      })(
      ['anchor', 'highlightedUid', 'open', 'search', 'values']), onAnchorChange = ref$[0], onHighlightedUidChange = ref$[1], onOpenChange = ref$[2], onSearchChange = ref$[3], onValuesChange = ref$[4];
      optionsFromChildren = (function(){
        var ref$;
        switch (false) {
        case !((ref$ = this.props) != null && ref$.children):
          return map(function(arg$){
            var props, value, children;
            if (arg$ != null) {
              props = arg$.props;
            }
            if (props != null) {
              value = props.value, children = props.children;
            }
            return {
              label: children,
              value: value
            };
          })(
          toString$.call(this.props.children).slice(8, -1) === 'Array'
            ? this.props.children
            : [this.props.children]);
        default:
          return [];
        }
      }.call(this));
      unfilteredOptions = this.props.hasOwnProperty('options') ? (ref$ = this.props.options) != null
        ? ref$
        : [] : optionsFromChildren;
      filteredOptions = this.props.filterOptions(unfilteredOptions, values, search);
      newOption = (function(){
        switch (false) {
        case typeof this.props.createFromSearch !== 'function':
          return this.props.createFromSearch(filteredOptions, values, search);
        default:
          return null;
        }
      }.call(this));
      options = (!!newOption
        ? [(ref$ = import$({}, newOption), ref$.newOption = true, ref$)]
        : []).concat(filteredOptions);
      return {
        anchor: anchor,
        highlightedUid: highlightedUid,
        search: search,
        values: values,
        onAnchorChange: onAnchorChange,
        onHighlightedUidChange: onHighlightedUidChange,
        open: open,
        onOpenChange: function(open, callback){
          onOpenChange((function(){
            switch (false) {
            case !(typeof this.props.maxValues !== 'undefined' && this.values().length >= this.props.maxValues):
              return false;
            default:
              return open;
            }
          }.call(this$)), callback);
        },
        onSearchChange: onSearchChange,
        onValuesChange: onValuesChange,
        filteredOptions: filteredOptions,
        options: options
      };
    };
    MultiSelect.prototype.firstOptionIndexToHighlight = function(options){
      var optionIndexToHighlight, search;
      optionIndexToHighlight = (function(){
        var ref$;
        switch (false) {
        case options.length !== 1:
          return 0;
        case typeof ((ref$ = options[0]) != null ? ref$.newOption : void 8) !== 'undefined':
          return 0;
        default:
          if (all(function(it){
            return typeof it.selectable === 'boolean' && !it.selectable;
          })(
          drop(1)(
          options))) {
            return 0;
          } else {
            return 1;
          }
        }
      }());
      search = this.props.hasOwnProperty('search')
        ? this.props.search
        : this.state.search;
      return this.props.firstOptionIndexToHighlight(optionIndexToHighlight, options, this.values(), search);
    };
    MultiSelect.prototype.focus = function(){
      this.refs.select.focus();
    };
    MultiSelect.prototype.blur = function(){
      this.refs.select.blur();
    };
    MultiSelect.prototype.highlightFirstSelectableOption = function(){
      if (this.state.open) {
        this.refs.select.highlightAndScrollToSelectableOption(this.firstOptionIndexToHighlight(this.getComputedState().options), 1);
      }
    };
    MultiSelect.prototype.values = function(){
      if (this.props.hasOwnProperty('values')) {
        return this.props.values;
      } else {
        return this.state.values;
      }
    };
    MultiSelect.prototype.isOpen = function(){
      if (this.props.hasOwnProperty('open')) {
        return this.props.open;
      } else {
        return this.state.open;
      }
    };
    return MultiSelect;
  }(React.Component));
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);
