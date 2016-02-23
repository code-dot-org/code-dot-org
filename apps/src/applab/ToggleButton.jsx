/** @file Button that can be active or inactive, for use inside ToggleGroup */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
/* global $ */

var styles = require('./PlaySpaceHeaderStyles');

var ToggleButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    active: React.PropTypes.bool.isRequired,
    first: React.PropTypes.bool,
    last: React.PropTypes.bool,
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
        <button
            id={this.props.id}
            style={this.getStyle()}
            className='no-outline'
            onClick={this.props.onClick}>
          {this.props.children}
        </button>
    );
  },

  getStyle: function () {
    return $.extend({},
        styles.buttonStyle,
        styles.toggleButtonStyle,
        this.props.active ? styles.activeStyle : styles.inactiveStyle,
        this.props.first ? styles.firstButtonStyle: null,
        this.props.last ? styles.lastButtonStyle : null);
  }
});
module.exports = ToggleButton;
