(function(){
  var React, ref$, render, unmountComponentAtNode, Tether, ReactTether;
  React = require('react');
  ref$ = require('react-dom'), render = ref$.render, unmountComponentAtNode = ref$.unmountComponentAtNode;
  Tether = require('tether');
  ReactTether = (function(superclass){
    var prototype = extend$((import$(ReactTether, superclass).displayName = 'ReactTether', ReactTether), superclass).prototype, constructor = ReactTether;
    ReactTether.defaultProps = {
      parentElement: function(){
        return document.body;
      }
    };
    ReactTether.prototype.render = function(){
      return null;
    };
    ReactTether.prototype.initTether = function(props){
      var this$ = this;
      this.node = document.createElement('div');
      this.props.parentElement().appendChild(this.node);
      this.tether = new Tether(import$({
        element: this.node,
        target: props.target()
      }, props.options));
      render(props.children, this.node, function(){
        return this$.tether.position();
      });
    };
    ReactTether.prototype.destroyTether = function(){
      if (this.tether) {
        this.tether.destroy();
      }
      if (this.node) {
        unmountComponentAtNode(this.node);
        this.node.parentElement.removeChild(this.node);
      }
      this.node = this.tether = undefined;
    };
    ReactTether.prototype.componentDidMount = function(){
      if (this.props.children) {
        this.initTether(this.props);
      }
    };
    ReactTether.prototype.componentWillReceiveProps = function(newProps){
      var this$ = this;
      if (this.props.children && !newProps.children) {
        this.destroyTether();
      } else if (newProps.children && !this.props.children) {
        this.initTether(newProps);
      } else if (newProps.children) {
        this.tether.setOptions(import$({
          element: this.node,
          target: newProps.target()
        }, newProps.options));
        render(newProps.children, this.node, function(){
          return this$.tether.position();
        });
      }
    };
    ReactTether.prototype.componentWillUnmount = function(){
      this.destroyTether();
    };
    function ReactTether(){
      ReactTether.superclass.apply(this, arguments);
    }
    return ReactTether;
  }(React.PureComponent));
  module.exports = ReactTether;
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
