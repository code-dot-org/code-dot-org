(function(){
  var div, React, DivWrapper;
  div = require('react-dom-factories').div;
  React = require('react');
  module.exports = DivWrapper = (function(superclass){
    var prototype = extend$((import$(DivWrapper, superclass).displayName = 'DivWrapper', DivWrapper), superclass).prototype, constructor = DivWrapper;
    DivWrapper.defaultProps = {
      className: "",
      onHeightChange: function(){}
    };
    DivWrapper.prototype.render = function(){
      return div({
        className: this.props.className,
        ref: 'dropdown'
      }, this.props.children);
    };
    DivWrapper.prototype.componentDidMount = function(){
      this.props.onHeightChange(this.refs.dropdown.offsetHeight);
    };
    DivWrapper.prototype.componentDidUpdate = function(){
      this.props.onHeightChange(this.refs.dropdown.offsetHeight);
    };
    DivWrapper.prototype.componentWillUnmount = function(){
      this.props.onHeightChange(0);
    };
    function DivWrapper(){
      DivWrapper.superclass.apply(this, arguments);
    }
    return DivWrapper;
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
