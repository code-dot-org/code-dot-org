(function(){
  var ref$, each, filter, find, findIndex, id, initial, last, map, objToPairs, partition, reject, reverse, Str, sortBy, sum, values, clamp, isEqualToObject, React, createFactory, div, input, path, span, svg, findDOMNode, ToggleButton, DropdownMenu, OptionWrapper, ValueWrapper, ResetButton, ResizableInput, cancelEvent, classNameFromObject, ReactSelectize;
  ref$ = require('prelude-ls'), each = ref$.each, filter = ref$.filter, find = ref$.find, findIndex = ref$.findIndex, id = ref$.id, initial = ref$.initial, last = ref$.last, map = ref$.map, objToPairs = ref$.objToPairs, partition = ref$.partition, reject = ref$.reject, reverse = ref$.reverse, Str = ref$.Str, sortBy = ref$.sortBy, sum = ref$.sum, values = ref$.values;
  ref$ = require('prelude-extension'), clamp = ref$.clamp, isEqualToObject = ref$.isEqualToObject;
  React = require('react'), createFactory = React.createFactory;
  ref$ = require('react-dom-factories'), div = ref$.div, input = ref$.input, path = ref$.path, span = ref$.span, svg = ref$.svg;
  findDOMNode = require('react-dom').findDOMNode;
  ToggleButton = createFactory(require('./ToggleButton'));
  DropdownMenu = createFactory(require('./DropdownMenu'));
  OptionWrapper = createFactory(require('./OptionWrapper'));
  ValueWrapper = createFactory(require('./ValueWrapper'));
  ResetButton = createFactory(require('./ResetButton'));
  ResizableInput = createFactory(require('./ResizableInput'));
  ref$ = require('./utils'), cancelEvent = ref$.cancelEvent, classNameFromObject = ref$.classNameFromObject;
  module.exports = ReactSelectize = (function(superclass){
    var prototype = extend$((import$(ReactSelectize, superclass).displayName = 'ReactSelectize', ReactSelectize), superclass).prototype, constructor = ReactSelectize;
    ReactSelectize.prototype.focusLock = false;
    ReactSelectize.defaultProps = {
      anchor: null,
      autofocus: false,
      cancelKeyboardEventOnSelection: true,
      delimiters: [],
      disabled: false,
      dropdownDirection: 1,
      firstOptionIndexToHighlight: function(options){
        return 0;
      },
      groupId: function(it){
        return it.groupId;
      },
      groupsAsColumns: false,
      highlightedUid: undefined,
      inputProps: {},
      onAnchorChange: function(anchor){},
      onBlur: function(e){},
      onEnter: function(highlightedOption){},
      onFocus: function(e){},
      onHighlightedUidChange: function(uid, callback){},
      onKeyboardSelectionFailed: function(keycode){},
      onOpenChange: function(open, callback){},
      onPaste: function(e){
        true;
      },
      onScrollLockChange: function(scrollLock){},
      onSearchChange: function(search, callback){},
      onValuesChange: function(values, callback){},
      open: false,
      hideResetButton: false,
      renderValue: function(arg$){
        var label;
        label = arg$.label;
        return div({
          className: 'simple-value'
        }, span(null, label));
      },
      renderToggleButton: ToggleButton,
      renderResetButton: ResetButton,
      scrollLock: false,
      search: "",
      style: {},
      theme: 'default',
      uid: id,
      values: []
    };
    ReactSelectize.prototype.render = function(){
      var anchorIndex, renderSelectedValues, flipped, ref$, ref1$, this$ = this;
      anchorIndex = (function(){
        var ref$;
        switch (false) {
        case !(typeof this.props.anchor === 'undefined' || this.props.anchor === null):
          return -1;
        default:
          return (ref$ = findIndex(function(it){
            return this$.isEqualToObject(it, this$.props.anchor);
          }, this.props.values)) != null
            ? ref$
            : this.props.values.length - 1;
        }
      }.call(this));
      renderSelectedValues = function(selectedValues){
        return map(function(index){
          var item, uid;
          item = this$.props.values[index];
          uid = this$.props.uid(item);
          return ValueWrapper({
            key: this$.uidToString(uid),
            uid: uid,
            item: item,
            renderItem: this$.props.renderValue
          });
        })(
        selectedValues);
      };
      flipped = this.props.dropdownDirection === -1;
      return div({
        className: classNameFromObject((ref$ = {
          'react-selectize': 1
        }, ref$[this.props.theme + ""] = 1, ref$['root-node'] = 1, ref$[this.props.className + ""] = 1, ref$.disabled = this.props.disabled, ref$.open = this.props.open, ref$.flipped = flipped, ref$.tethered = this.props.tether, ref$)),
        style: this.props.style
      }, !!this.props.name ? input({
        type: 'hidden',
        name: this.props.name,
        value: this.props.serialize(this.props.values)
      }) : void 8, div({
        className: 'react-selectize-control',
        ref: 'control',
        onMouseDown: function(e){
          (function(){
            return this$.props.onAnchorChange(last(this$.props.values), function(){
              return this$.onOpenChange(true, function(){});
            });
          })();
          if (!this$.props.open) {
            return cancelEvent(e);
          }
        }
      }, this.props.search.length === 0 && this.props.values.length === 0 ? div({
        className: 'react-selectize-placeholder'
      }, this.props.placeholder) : void 8, div({
        className: 'react-selectize-search-field-and-selected-values'
      }, renderSelectedValues((function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = anchorIndex; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }())), ResizableInput((ref$ = import$({
        disabled: this.props.disabled
      }, this.props.inputProps), ref$.ref = 'search', ref$.type = 'text', ref$.value = this.props.search, ref$.onChange = function(arg$){
        var value;
        value = arg$.currentTarget.value;
        return this$.props.onSearchChange(value, function(){
          return this$.highlightAndScrollToSelectableOption(this$.props.firstOptionIndexToHighlight(this$.props.options), 1);
        });
      }, ref$.onFocus = function(e){
        (function(){
          return function(callback){
            if (!!this$.focusLock) {
              return callback(this$.focusLock = false);
            } else {
              return this$.onOpenChange(true, function(){
                return callback(true);
              });
            }
          };
        })()(function(){
          return this$.props.onFocus(e);
        });
      }, ref$.onBlur = function(e){
        if (this$.refs.dropdownMenu && document.activeElement === findDOMNode(this$.refs.dropdownMenu)) {
          return;
        }
        return this$.closeDropdown(function(){
          return this$.props.onBlur(e);
        });
      }, ref$.onPaste = this.props.onPaste, ref$.onKeyDown = function(e){
        return this$.handleKeydown({
          anchorIndex: anchorIndex
        }, e);
      }, ref$)), renderSelectedValues((function(){
        var i$, to$, results$ = [];
        for (i$ = anchorIndex + 1, to$ = this.props.values.length; i$ < to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }.call(this)))), this.props.values.length > 0 && !this.props.hideResetButton ? div({
        className: 'react-selectize-reset-button-container',
        onClick: function(e){
          (function(){
            return this$.props.onValuesChange([], function(){
              return this$.props.onSearchChange("", function(){
                return this$.highlightAndFocus();
              });
            });
          })();
          return cancelEvent(e);
        }
      }, this.props.renderResetButton()) : void 8, div({
        className: 'react-selectize-toggle-button-container',
        onMouseDown: function(e){
          if (this$.props.open) {
            this$.onOpenChange(false, function(){});
          } else {
            this$.props.onAnchorChange(last(this$.props.values), function(){
              return this$.onOpenChange(true, function(){});
            });
          }
          return cancelEvent(e);
        }
      }, this.props.renderToggleButton({
        open: this.props.open,
        flipped: flipped
      }))), DropdownMenu((ref$ = import$({}, this.props), ref$.ref = 'dropdownMenu', ref$.className = classNameFromObject((ref1$ = {
        'react-selectize': 1
      }, ref1$[this.props.className + ""] = 1, ref1$)), ref$.theme = this.props.theme, ref$.scrollLock = this.props.scrollLock, ref$.onScrollChange = this.props.onScrollChange, ref$.bottomAnchor = function(){
        return findDOMNode(this$.refs.control);
      }, ref$.tetherProps = (ref1$ = import$({}, this.props.tetherProps), ref1$.target = function(){
        return findDOMNode(this$.refs.control);
      }, ref1$), ref$.highlightedUid = this.props.highlightedUid, ref$.onHighlightedUidChange = this.props.onHighlightedUidChange, ref$.onOptionClick = function(highlightedUid){
        this$.selectHighlightedUid(anchorIndex, function(){});
      }, ref$)));
    };
    ReactSelectize.prototype.handleKeydown = function(arg$, e){
      var anchorIndex, result, index, this$ = this;
      anchorIndex = arg$.anchorIndex;
      e.persist();
      switch (e.which) {
      case 8:
        if (this.props.search.length > 0 || anchorIndex === -1) {
          return;
        }
        (function(){
          var anchorIndexOnRemove, nextAnchor, valueToRemove, ref$;
          anchorIndexOnRemove = anchorIndex;
          nextAnchor = anchorIndex - 1 < 0
            ? undefined
            : this$.props.values[anchorIndex - 1];
          valueToRemove = this$.props.values[anchorIndex];
          return this$.props.onValuesChange((ref$ = reject(function(it){
            return this$.isEqualToObject(it, valueToRemove);
          })(
          this$.props.values)) != null
            ? ref$
            : [], function(){
            return function(){
              return function(callback){
                if (typeof find(function(it){
                  return this$.isEqualToObject(it, valueToRemove);
                }, this$.props.values) === 'undefined') {
                  if (!!this$.props.restoreOnBackspace) {
                    return this$.props.onSearchChange(this$.props.restoreOnBackspace(valueToRemove), function(){
                      return callback(true);
                    });
                  } else {
                    return callback(true);
                  }
                } else {
                  return callback(false);
                }
              };
            }()(function(result){
              if (!!result) {
                this$.highlightAndScrollToSelectableOption(this$.props.firstOptionIndexToHighlight(this$.props.options), 1);
                if (anchorIndex === anchorIndexOnRemove && (typeof nextAnchor === 'undefined' || !!find(function(it){
                  return this$.isEqualToObject(it, nextAnchor);
                })(
                this$.props.values))) {
                  return this$.props.onAnchorChange(nextAnchor, function(){});
                }
              }
            });
          });
        })();
        cancelEvent(e);
        break;
      case 27:
        (function(){
          if (this$.props.open) {
            return function(it){
              return this$.onOpenChange(false, it);
            };
          } else {
            return function(it){
              return this$.props.onValuesChange([], it);
            };
          }
        })()(function(){
          return this$.props.onSearchChange("", function(){
            return this$.focusOnInput();
          });
        });
      }
      if (this.props.open && in$(e.which, [13].concat(this.props.delimiters)) && !((e != null && e.metaKey) || (e != null && e.ctrlKey) || (e != null && e.shiftKey))) {
        result = this.selectHighlightedUid(anchorIndex, function(selectedValue){
          if (typeof selectedValue === 'undefined') {
            return this$.props.onKeyboardSelectionFailed(e.which);
          }
        });
        if (result && this.props.cancelKeyboardEventOnSelection) {
          return cancelEvent(e);
        }
      }
      if (this.props.search.length === 0) {
        switch (e.which) {
        case 37:
          this.props.onAnchorChange(anchorIndex - 1 < 0 || e.metaKey
            ? undefined
            : this.props.values[clamp(anchorIndex - 1, 0, this.props.values.length - 1)], function(){});
          break;
        case 39:
          this.props.onAnchorChange(e.metaKey
            ? last(this.props.values)
            : this.props.values[clamp(anchorIndex + 1, 0, this.props.values.length - 1)], function(){});
        }
      }
      switch (e.which) {
      case 38:
        this.props.onScrollLockChange(true);
        index = (function(){
          switch (false) {
          case typeof this.props.highlightedUid !== 'undefined':
            return 0;
          default:
            return -1 + this.optionIndexFromUid(this.props.highlightedUid);
          }
        }.call(this));
        return this.highlightAndScrollToSelectableOption(index, -1, function(result){
          if (!result) {
            return this$.highlightAndScrollToSelectableOption(this$.props.options.length - 1, -1);
          }
        });
      case 40:
        this.props.onScrollLockChange(true);
        index = (function(){
          switch (false) {
          case typeof this.props.highlightedUid !== 'undefined':
            return 0;
          default:
            return 1 + this.optionIndexFromUid(this.props.highlightedUid);
          }
        }.call(this));
        return this.highlightAndScrollToSelectableOption(index, 1, function(result){
          if (!result) {
            return this$.highlightAndScrollToSelectableOption(0, 1);
          }
        });
      }
    };
    ReactSelectize.prototype.componentDidMount = function(){
      if (this.props.autofocus) {
        this.focus();
      }
      if (this.props.open) {
        this.highlightAndFocus();
      }
    };
    ReactSelectize.prototype.componentDidUpdate = function(prevProps){
      var this$ = this;
      if (this.props.open && !prevProps.open && this.props.highlightedUid === undefined) {
        this.highlightAndFocus();
      }
      if (!this.props.open && prevProps.open) {
        this.props.onHighlightedUidChange(undefined, function(){});
      }
    };
    ReactSelectize.prototype.componentWillReceiveProps = function(props){
      var this$ = this;
      if ((typeof this.props.disabled === 'undefined' || this.props.disabled === false) && (typeof props.disabled !== 'undefined' && props.disabled === true)) {
        this.onOpenChange(false, function(){});
      }
    };
    ReactSelectize.prototype.optionIndexFromUid = function(uid){
      var this$ = this;
      return findIndex(function(it){
        return isEqualToObject(uid, this$.props.uid(it));
      })(
      this.props.options);
    };
    ReactSelectize.prototype.closeDropdown = function(callback){
      var this$ = this;
      this.onOpenChange(false, function(){
        return this$.props.onAnchorChange(last(this$.props.values), callback);
      });
    };
    ReactSelectize.prototype.blur = function(){
      this.refs.search.blur();
    };
    ReactSelectize.prototype.focus = function(){
      this.refs.search.focus();
    };
    ReactSelectize.prototype.focusOnInput = function(){
      var input;
      input = findDOMNode(this.refs.search);
      if (input !== document.activeElement) {
        this.focusLock = true;
        input.focus();
        input.value = input.value;
      }
    };
    ReactSelectize.prototype.highlightAndFocus = function(){
      this.highlightAndScrollToSelectableOption(this.props.firstOptionIndexToHighlight(this.props.options), 1);
      this.focusOnInput();
    };
    ReactSelectize.prototype.highlightAndScrollToOption = function(index, callback){
      callback == null && (callback = function(){});
      this.refs.dropdownMenu.highlightAndScrollToOption(index, callback);
    };
    ReactSelectize.prototype.highlightAndScrollToSelectableOption = function(index, direction, callback){
      var this$ = this;
      callback == null && (callback = function(){});
      (function(){
        if (!this$.props.open) {
          return function(it){
            return this$.onOpenChange(true, it);
          };
        } else {
          return function(it){
            return it();
          };
        }
      })()(function(){
        return this$.refs.dropdownMenu.highlightAndScrollToSelectableOption(index, direction, callback);
      });
    };
    ReactSelectize.prototype.isEqualToObject = function(){
      return isEqualToObject(this.props.uid(arguments[0]), this.props.uid(arguments[1]));
    };
    ReactSelectize.prototype.onOpenChange = function(open, callback){
      return this.props.onOpenChange(this.props.disabled ? false : open, callback);
    };
    ReactSelectize.prototype.selectHighlightedUid = function(anchorIndex, callback){
      var index, option, this$ = this;
      if (this.props.highlightedUid === undefined) {
        callback();
        return false;
      }
      index = this.optionIndexFromUid(this.props.highlightedUid);
      if (typeof index !== 'number') {
        callback();
        return false;
      }
      option = this.props.options[index];
      (function(){
        return this$.props.onValuesChange(map(function(it){
          return this$.props.values[it];
        }, (function(){
          var i$, to$, results$ = [];
          for (i$ = 0, to$ = anchorIndex; i$ <= to$; ++i$) {
            results$.push(i$);
          }
          return results$;
        }())).concat([option], map(function(it){
          return this$.props.values[it];
        }, (function(){
          var i$, to$, results$ = [];
          for (i$ = anchorIndex + 1, to$ = this.props.values.length; i$ < to$; ++i$) {
            results$.push(i$);
          }
          return results$;
        }.call(this$)))), function(){
          var value;
          value = find(function(it){
            return this$.isEqualToObject(it, option);
          }, this$.props.values);
          if (!value) {
            callback();
            return;
          }
          return this$.props.onSearchChange("", function(){
            return this$.props.onAnchorChange(value, function(){
              if (!this$.props.open) {
                callback(value);
                return;
              }
              return this$.highlightAndScrollToSelectableOption(index, 1, function(result){
                if (!!result) {
                  callback(value);
                  return;
                }
                return this$.highlightAndScrollToSelectableOption(this$.props.firstOptionIndexToHighlight(this$.props.options), 1, function(result){
                  if (!result) {
                    return this$.onOpenChange(false, function(){
                      return callback(value);
                    });
                  } else {
                    return callback(value);
                  }
                });
              });
            });
          });
        });
      })();
      return true;
    };
    ReactSelectize.prototype.uidToString = function(uid){
      return (typeof uid === 'object' ? JSON.stringify : id)(uid);
    };
    function ReactSelectize(){
      ReactSelectize.superclass.apply(this, arguments);
    }
    return ReactSelectize;
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
}).call(this);
