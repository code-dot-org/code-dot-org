(function(){
  var ref$, filter, id, map, isEqualToObject, React, createFactory, div, input, span, findDOMNode, ReactCSSTransitionGroup, ReactTether, DivWrapper, OptionWrapper, cancelEvent, classNameFromObject, DropdownMenu;
  ref$ = require('prelude-ls'), filter = ref$.filter, id = ref$.id, map = ref$.map;
  isEqualToObject = require('prelude-extension').isEqualToObject;
  React = require('react'), createFactory = React.createFactory;
  ref$ = require('react-dom-factories'), div = ref$.div, input = ref$.input, span = ref$.span;
  findDOMNode = require('react-dom').findDOMNode;
  ReactCSSTransitionGroup = createFactory(require('react-transition-group/CSSTransitionGroup'));
  ReactTether = createFactory(require('./ReactTether'));
  DivWrapper = createFactory(require('./DivWrapper'));
  OptionWrapper = createFactory(require('./OptionWrapper'));
  ref$ = require('./utils'), cancelEvent = ref$.cancelEvent, classNameFromObject = ref$.classNameFromObject;
  module.exports = DropdownMenu = (function(superclass){
    var prototype = extend$((import$(DropdownMenu, superclass).displayName = 'DropdownMenu', DropdownMenu), superclass).prototype, constructor = DropdownMenu;
    DropdownMenu.defaultProps = {
      className: "",
      dropdownDirection: 1,
      groupId: function(it){
        return it.groupId;
      },
      groupsAsColumns: false,
      highlightedUid: undefined,
      onHighlightedUidChange: function(uid, callback){},
      onOptionClick: function(uid){},
      onScrollLockChange: function(scrollLock){},
      options: [],
      renderNoResultsFound: function(){
        return div({
          className: 'no-results-found'
        }, "No results found");
      },
      renderGroupTitle: function(index, arg$){
        var groupId, title;
        if (arg$ != null) {
          groupId = arg$.groupId, title = arg$.title;
        }
        return div({
          className: 'simple-group-title',
          key: groupId
        }, title);
      },
      renderOption: function(arg$){
        var label, newOption, selectable, isSelectable;
        if (arg$ != null) {
          label = arg$.label, newOption = arg$.newOption, selectable = arg$.selectable;
        }
        isSelectable = typeof selectable === 'undefined' || selectable;
        return div({
          className: "simple-option " + (isSelectable ? '' : 'not-selectable')
        }, span(null, !!newOption ? "Add " + label + " ..." : label));
      },
      scrollLock: false,
      style: {},
      tether: false,
      tetherProps: {},
      theme: 'default',
      transitionEnter: false,
      transitionLeave: false,
      transitionEnterTimeout: 200,
      transitionLeaveTimeout: 200,
      uid: id
    };
    DropdownMenu.prototype.render = function(){
      var dynamicClassName, ref$;
      dynamicClassName = classNameFromObject((ref$ = {}, ref$[this.props.theme + ""] = 1, ref$[this.props.className + ""] = 1, ref$.flipped = this.props.dropdownDirection === -1, ref$.tethered = this.props.tether, ref$));
      if (this.props.tether) {
        return ReactTether((ref$ = import$({}, this.props.tetherProps), ref$.options = {
          attachment: "top left",
          targetAttachment: "bottom left",
          constraints: [{
            to: 'scrollParent'
          }]
        }, ref$), this.renderAnimatedDropdown({
          dynamicClassName: dynamicClassName
        }));
      } else {
        return this.renderAnimatedDropdown({
          dynamicClassName: dynamicClassName
        });
      }
    };
    DropdownMenu.prototype.renderAnimatedDropdown = function(computedState){
      var dynamicClassName;
      dynamicClassName = computedState.dynamicClassName;
      if (!!this.props.transitionEnter || !!this.props.transitionLeave) {
        return ReactCSSTransitionGroup({
          ref: 'dropdownMenuWrapper',
          component: 'div',
          transitionName: 'custom',
          transitionEnter: this.props.transitionEnter,
          transitionLeave: this.props.transitionLeave,
          transitionEnterTimeout: this.props.transitionEnterTimeout,
          transitionLeaveTimeout: this.props.transitionLeaveTimeout,
          className: "dropdown-menu-wrapper " + dynamicClassName
        }, this.renderDropdown(computedState));
      } else {
        return this.renderDropdown(computedState);
      }
    };
    DropdownMenu.prototype.renderOptions = function(options){
      var this$ = this;
      return map(function(index){
        var option, uid;
        option = options[index];
        uid = this$.props.uid(option);
        return OptionWrapper(import$({
          uid: uid,
          ref: function(element){
            this$["option-" + this$.uidToString(uid)] = element;
          },
          key: this$.uidToString(uid),
          item: option,
          highlight: isEqualToObject(this$.props.highlightedUid, uid),
          selectable: option != null ? option.selectable : void 8,
          onMouseMove: function(arg$){
            var currentTarget;
            currentTarget = arg$.currentTarget;
            if (this$.props.scrollLock) {
              this$.props.onScrollLockChange(false);
            }
          },
          onMouseOut: function(){
            if (!this$.props.scrollLock) {
              this$.props.onHighlightedUidChange(undefined, function(){});
            }
          },
          renderItem: this$.props.renderOption
        }, (function(){
          switch (false) {
          case !(typeof (option != null ? option.selectable : void 8) === 'boolean' && !option.selectable):
            return {
              onClick: cancelEvent
            };
          default:
            return {
              onClick: function(){
                if (!this$.props.scrollLock) {
                  this$.props.onHighlightedUidChange(uid, function(){});
                }
                this$.props.onOptionClick(this$.props.highlightedUid);
              },
              onMouseOver: function(arg$){
                var currentTarget;
                currentTarget = arg$.currentTarget;
                if ('ontouchstart' in window) {
                  return false;
                }
                if (!this$.props.scrollLock) {
                  this$.props.onHighlightedUidChange(uid, function(){});
                }
              }
            };
          }
        }())));
      })(
      (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = options.length; i$ < to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()));
    };
    DropdownMenu.prototype.renderDropdown = function(arg$){
      var dynamicClassName, ref$, ref1$, groups, this$ = this;
      dynamicClassName = arg$.dynamicClassName;
      if (this.props.open) {
        return DivWrapper({
          className: "dropdown-menu " + dynamicClassName,
          ref: function(element){
            !!element && (this$.dropdownMenu = element);
          },
          onHeightChange: function(height){
            if (this$.refs.dropdownMenuWrapper) {
              findDOMNode(this$.refs.dropdownMenuWrapper).style.height = height + "px";
            }
          }
        }, this.props.options.length === 0
          ? this.props.renderNoResultsFound()
          : ((ref$ = this.props) != null ? (ref1$ = ref$.groups) != null ? ref1$.length : void 8 : void 8) > 0
            ? (groups = map(function(index){
              var group, groupId, options;
              group = this$.props.groups[index], groupId = group.groupId;
              options = filter(function(it){
                return this$.props.groupId(it) === groupId;
              })(
              this$.props.options);
              return {
                index: index,
                group: group,
                options: options
              };
            })(
            (function(){
              var i$, to$, results$ = [];
              for (i$ = 0, to$ = this.props.groups.length; i$ < to$; ++i$) {
                results$.push(i$);
              }
              return results$;
            }.call(this))), div({
              className: "groups " + (!!this.props.groupsAsColumns ? 'as-columns' : '')
            }, map(function(arg$){
              var index, group, groupId, options;
              index = arg$.index, group = arg$.group, groupId = group.groupId, options = arg$.options;
              return div({
                key: groupId
              }, this$.props.renderGroupTitle(index, group, options), div({
                className: 'options'
              }, this$.renderOptions(options)));
            })(
            filter(function(it){
              return it.options.length > 0;
            })(
            groups))))
            : this.renderOptions(this.props.options));
      } else {
        return null;
      }
    };
    DropdownMenu.prototype.componentDidUpdate = function(prevProps){
      var x$, dropdownMenu, ref$;
      if (!deepEq$(prevProps.dropdownDirection, this.props.dropdownDirection, '===') && this.props.open) {
        x$ = dropdownMenu = findDOMNode((ref$ = this.refs.dropdownMenuWrapper) != null
          ? ref$
          : this.dropdownMenu);
        if (x$ != null) {
          x$.style.bottom = (function(){
            switch (false) {
            case this.props.dropdownDirection !== -1:
              return (this.props.bottomAnchor().offsetHeight + dropdownMenu.style.marginBottom) + "px";
            default:
              return "";
            }
          }.call(this));
        }
      }
    };
    DropdownMenu.prototype.highlightAndScrollToOption = function(index, callback){
      var uid, this$ = this;
      callback == null && (callback = function(){});
      uid = this.props.uid(this.props.options[index]);
      this.props.onHighlightedUidChange(uid, function(){
        var ref$, optionElement, parentElement, optionHeight;
        if ((ref$ = findDOMNode(this$ != null ? this$["option-" + this$.uidToString(uid)] : void 8)) != null) {
          optionElement = ref$;
        }
        if (!!optionElement) {
          parentElement = optionElement.parentElement;
          optionHeight = optionElement.offsetHeight - 1;
          if (optionElement.offsetTop - parentElement.scrollTop >= parentElement.offsetHeight) {
            parentElement.scrollTop = optionElement.offsetTop - parentElement.offsetHeight + optionHeight;
          } else if (optionElement.offsetTop - parentElement.scrollTop + optionHeight <= 0) {
            parentElement.scrollTop = optionElement.offsetTop;
          }
        }
        return callback();
      });
    };
    DropdownMenu.prototype.highlightAndScrollToSelectableOption = function(index, direction, callback){
      var option, ref$, ref1$, this$ = this;
      callback == null && (callback = function(){});
      if (index < 0 || index >= this.props.options.length) {
        this.props.onHighlightedUidChange(undefined, function(){
          return callback(false);
        });
      } else {
        option = (ref$ = this.props) != null ? (ref1$ = ref$.options) != null ? ref1$[index] : void 8 : void 8;
        if (typeof (option != null ? option.selectable : void 8) === 'boolean' && !option.selectable) {
          this.highlightAndScrollToSelectableOption(index + direction, direction, callback);
        } else {
          this.highlightAndScrollToOption(index, function(){
            return callback(true);
          });
        }
      }
    };
    DropdownMenu.prototype.uidToString = function(uid){
      return (typeof uid === 'object' ? JSON.stringify : id)(uid);
    };
    function DropdownMenu(){
      DropdownMenu.superclass.apply(this, arguments);
    }
    return DropdownMenu;
  }(React.PureComponent));
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
  function deepEq$(x, y, type){
    var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
        has = function (obj, key) { return hasOwnProperty.call(obj, key); };
    var first = true;
    return eq(x, y, []);
    function eq(a, b, stack) {
      var className, length, size, result, alength, blength, r, key, ref, sizeB;
      if (a == null || b == null) { return a === b; }
      if (a.__placeholder__ || b.__placeholder__) { return true; }
      if (a === b) { return a !== 0 || 1 / a == 1 / b; }
      className = toString.call(a);
      if (toString.call(b) != className) { return false; }
      switch (className) {
        case '[object String]': return a == String(b);
        case '[object Number]':
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          return +a == +b;
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != 'object' || typeof b != 'object') { return false; }
      length = stack.length;
      while (length--) { if (stack[length] == a) { return true; } }
      stack.push(a);
      size = 0;
      result = true;
      if (className == '[object Array]') {
        alength = a.length;
        blength = b.length;
        if (first) {
          switch (type) {
          case '===': result = alength === blength; break;
          case '<==': result = alength <= blength; break;
          case '<<=': result = alength < blength; break;
          }
          size = alength;
          first = false;
        } else {
          result = alength === blength;
          size = alength;
        }
        if (result) {
          while (size--) {
            if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
          }
        }
      } else {
        if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
          return false;
        }
        for (key in a) {
          if (has(a, key)) {
            size++;
            if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
          }
        }
        if (result) {
          sizeB = 0;
          for (key in b) {
            if (has(b, key)) { ++sizeB; }
          }
          if (first) {
            if (type === '<<=') {
              result = size < sizeB;
            } else if (type === '<==') {
              result = size <= sizeB
            } else {
              result = size === sizeB;
            }
          } else {
            first = false;
            result = size === sizeB;
          }
        }
      }
      stack.pop();
      return result;
    }
  }
}).call(this);
