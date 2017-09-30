(function(){
  var React, createFactory, path, SvgWrapper, ToggleButton;
  React = require('react'), createFactory = React.createFactory;
  path = require('react-dom-factories').path;
  SvgWrapper = createFactory(require('./SvgWrapper'));
  module.exports = ToggleButton = (function(superclass){
    var prototype = extend$((import$(ToggleButton, superclass).displayName = 'ToggleButton', ToggleButton), superclass).prototype, constructor = ToggleButton;
    ToggleButton.defaultProps = {
      open: false,
      flipped: false
    };
    ToggleButton.prototype.render = function(){
      return SvgWrapper({
        className: 'react-selectize-toggle-button',
        style: {
          width: 10,
          height: 8
        }
      }, path({
        d: (function(){
          switch (false) {
          case !((this.props.open && !this.props.flipped) || (!this.props.open && this.props.flipped)):
            return "M0 6 L5 1 L10 6 Z";
          default:
            return "M0 1 L5 6 L10 1 Z";
          }
        }.call(this))
      }));
    };
    function ToggleButton(){
      ToggleButton.superclass.apply(this, arguments);
    }
    return ToggleButton;
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
