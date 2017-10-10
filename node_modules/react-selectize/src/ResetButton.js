(function(){
  var React, createFactory, path, SvgWrapper, ResetButton;
  React = require('react'), createFactory = React.createFactory;
  path = require('react-dom-factories').path;
  SvgWrapper = createFactory(require('./SvgWrapper'));
  module.exports = ResetButton = (function(superclass){
    var prototype = extend$((import$(ResetButton, superclass).displayName = 'ResetButton', ResetButton), superclass).prototype, constructor = ResetButton;
    ResetButton.prototype.render = function(){
      return SvgWrapper({
        className: 'react-selectize-reset-button',
        style: {
          width: 8,
          height: 8
        }
      }, path({
        d: "M0 0 L8 8 M8 0 L 0 8"
      }));
    };
    function ResetButton(){
      ResetButton.superclass.apply(this, arguments);
    }
    return ResetButton;
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
