/** @file Row of buttons for switching editor modes. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
/* global $ */

var constants = require('./constants');
var msg = require('../locale');
var styles = require('./PlaySpaceHeaderStyles');

var Mode = constants.MODE;

var ToggleGroup = React.createClass({
  propTypes: {
    mode: React.PropTypes.string.isRequired,
    hideToggle: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <span>
        <button
            id='codeModeButton'
            style={$.extend({}, styles.codeButtonStyle,
                  this.props.mode === Mode.CODE ? styles.activeStyle : styles.inactiveStyle,
                  this.props.hideToggle ? styles.hiddenStyle : null)}
            className='no-outline'
            onClick={function () { this.props.onChange(Mode.CODE); }.bind(this)}>
          {msg.codeMode()}
        </button>
        <button
            id='designModeButton'
            style={$.extend({}, styles.designButtonStyle,
                  this.props.mode === Mode.DESIGN ? styles.activeStyle : styles.inactiveStyle,
                  this.props.hideToggle ? styles.hiddenStyle : null)}
            className='no-outline'
            onClick={function () { this.props.onChange(Mode.DESIGN); }.bind(this)}>
          {msg.designMode()}
        </button>
      </span>
    );
  }
});
module.exports = ToggleGroup;