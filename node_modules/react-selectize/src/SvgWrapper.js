(function(){
  var React, svg, findDOMNode, SvgWrapper;
  React = require('react');
  svg = require('react-dom-factories').svg;
  findDOMNode = require('react-dom').findDOMNode;
  module.exports = SvgWrapper = (function(superclass){
    var prototype = extend$((import$(SvgWrapper, superclass).displayName = 'SvgWrapper', SvgWrapper), superclass).prototype, constructor = SvgWrapper;
    SvgWrapper.prototype.render = function(){
      return svg(this.props);
    };
    SvgWrapper.prototype.componentDidMount = function(){
      findDOMNode(this).setAttribute('focusable', false);
    };
    function SvgWrapper(){
      SvgWrapper.superclass.apply(this, arguments);
    }
    return SvgWrapper;
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
