(function(){
  var ref$, each, objToPairs, React, createFactory, input, findDOMNode, ResizableInput;
  ref$ = require('prelude-ls'), each = ref$.each, objToPairs = ref$.objToPairs;
  React = require('react'), createFactory = React.createFactory;
  input = require('react-dom-factories').input;
  findDOMNode = require('react-dom').findDOMNode;
  module.exports = ResizableInput = (function(superclass){
    var prototype = extend$((import$(ResizableInput, superclass).displayName = 'ResizableInput', ResizableInput), superclass).prototype, constructor = ResizableInput;
    ResizableInput.prototype.render = function(){
      var ref$;
      return input((ref$ = import$({}, this.props), ref$.type = 'input', ref$.className = 'resizable-input', ref$));
    };
    ResizableInput.prototype.autosize = function(){
      var x$, inputElement, y$, dummpyInput, ref$;
      x$ = inputElement = findDOMNode(this);
      x$.style.width = '0px';
      if (inputElement.value.length === 0) {
        return inputElement.style.width = !!(inputElement != null && inputElement.currentStyle) ? '4px' : '2px';
      } else {
        if (inputElement.scrollWidth > 0) {
          return inputElement.style.width = (2 + inputElement.scrollWidth) + "px";
        } else {
          y$ = dummpyInput = document.createElement('div');
          y$.innerHTML = inputElement.value;
          (function(){
            var ref$;
            return ref$ = dummpyInput.style, ref$.display = 'inline-block', ref$.width = "", ref$;
          })(
          each(function(arg$){
            var key, value;
            key = arg$[0], value = arg$[1];
            return dummpyInput.style[key] = value;
          })(
          objToPairs(
          !!inputElement.currentStyle
            ? inputElement.currentStyle
            : (ref$ = document.defaultView) != null
              ? ref$
              : window.getComputedStyle(inputElement))));
          document.body.appendChild(dummpyInput);
          inputElement.style.width = (4 + dummpyInput.clientWidth) + "px";
          return document.body.removeChild(dummpyInput);
        }
      }
    };
    ResizableInput.prototype.componentDidMount = function(){
      this.autosize();
    };
    ResizableInput.prototype.componentDidUpdate = function(){
      this.autosize();
    };
    ResizableInput.prototype.blur = function(){
      return findDOMNode(this).blur();
    };
    ResizableInput.prototype.focus = function(){
      return findDOMNode(this).focus();
    };
    function ResizableInput(){
      ResizableInput.superclass.apply(this, arguments);
    }
    return ResizableInput;
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
}).call(this);
