(function(){
  var React, ref$, div, span, map, HighlightedText;
  React = require('react');
  ref$ = require('react-dom-factories'), div = ref$.div, span = ref$.span;
  map = require('prelude-ls').map;
  module.exports = HighlightedText = (function(superclass){
    var prototype = extend$((import$(HighlightedText, superclass).displayName = 'HighlightedText', HighlightedText), superclass).prototype, constructor = HighlightedText;
    HighlightedText.defaultProps = {
      partitions: [],
      text: "",
      style: {},
      highlightStyle: {}
    };
    HighlightedText.prototype.render = function(){
      var this$ = this;
      return div({
        className: 'highlighted-text',
        style: this.props.style
      }, map(function(arg$){
        var start, end, highlight;
        start = arg$[0], end = arg$[1], highlight = arg$[2];
        return span({
          key: this$.props.text + "" + start + end + highlight,
          className: highlight ? 'highlight' : '',
          style: highlight
            ? this$.props.highlightStyle
            : {}
        }, this$.props.text.substring(start, end));
      })(
      this.props.partitions));
    };
    function HighlightedText(){
      HighlightedText.superclass.apply(this, arguments);
    }
    return HighlightedText;
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
