/** @file Button that can be active or inactive, for use inside ToggleGroup */
var React = require('react');
var styles = require('./ToggleButtonStyles');

var ToggleButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    active: React.PropTypes.bool.isRequired,
    first: React.PropTypes.bool,
    last: React.PropTypes.bool,
    onClick: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
  },

  render: function () {
    return (
      <button
        id={this.props.id}
        style={this.getStyle()}
        className="no-outline"
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  },

  getStyle: function () {
    return Object.assign({},
      styles.buttonStyle,
      styles.toggleButtonStyle,
      this.props.active ? styles.activeStyle : styles.inactiveStyle,
      this.props.first ? styles.firstButtonStyle: null,
      this.props.last ? styles.lastButtonStyle : null);
  }
});
module.exports = ToggleButton;
