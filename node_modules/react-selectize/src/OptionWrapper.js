(function(){
  var React, div, isEqualToObject, cancelEvent, OptionWrapper;
  React = require('react');
  div = require('react-dom-factories').div;
  isEqualToObject = require('prelude-extension').isEqualToObject;
  cancelEvent = require('./utils').cancelEvent;
  module.exports = OptionWrapper = (function(superclass){
    var prototype = extend$((import$(OptionWrapper, superclass).displayName = 'OptionWrapper', OptionWrapper), superclass).prototype, constructor = OptionWrapper;
    OptionWrapper.defaultProps = {};
    OptionWrapper.prototype.render = function(){
      var this$ = this;
      return div({
        className: "option-wrapper " + (!!this.props.highlight ? 'highlight' : ''),
        onMouseDown: function(e){
          var listener;
          listener = function(e){
            this$.props.onClick(e);
            return window.removeEventListener('mouseup', listener);
          };
          window.addEventListener('mouseup', listener);
          return cancelEvent(e);
        },
        onMouseMove: this.props.onMouseMove,
        onMouseOut: this.props.onMouseOut,
        onMouseOver: this.props.onMouseOver
      }, this.props.renderItem(this.props.item));
    };
    OptionWrapper.prototype.shouldComponentUpdate = function(nextProps){
      var ref$, ref1$, ref2$;
      return !isEqualToObject(nextProps != null ? nextProps.uid : void 8, (ref$ = this.props) != null ? ref$.uid : void 8) || (nextProps != null ? nextProps.highlight : void 8) !== ((ref1$ = this.props) != null ? ref1$.highlight : void 8) || (nextProps != null ? nextProps.selectable : void 8) !== ((ref2$ = this.props) != null ? ref2$.selectable : void 8);
    };
    function OptionWrapper(){
      OptionWrapper.superclass.apply(this, arguments);
    }
    return OptionWrapper;
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
}).call(this);
