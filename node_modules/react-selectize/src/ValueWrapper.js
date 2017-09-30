(function(){
  var React, div, isEqualToObject, ValueWrapper;
  React = require('react');
  div = require('react-dom-factories').div;
  isEqualToObject = require('prelude-extension').isEqualToObject;
  module.exports = ValueWrapper = (function(superclass){
    var prototype = extend$((import$(ValueWrapper, superclass).displayName = 'ValueWrapper', ValueWrapper), superclass).prototype, constructor = ValueWrapper;
    ValueWrapper.defaultProps = {};
    ValueWrapper.prototype.render = function(){
      return div({
        className: 'value-wrapper'
      }, this.props.renderItem(this.props.item));
    };
    ValueWrapper.prototype.shouldComponentUpdate = function(nextProps){
      var ref$;
      return !isEqualToObject(nextProps != null ? nextProps.uid : void 8, (ref$ = this.props) != null ? ref$.uid : void 8);
    };
    function ValueWrapper(){
      ValueWrapper.superclass.apply(this, arguments);
    }
    return ValueWrapper;
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
