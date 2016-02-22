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
var ToggleButton = require('./ToggleButton.jsx');

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
        <ToggleButton id='codeModeButton'
                      active={this.props.mode === Mode.CODE}
                      style={$.extend({}, styles.codeButtonStyle,
                            this.props.hideToggle ? styles.hiddenStyle : null)}
                      onClick={function () { this.props.onChange(Mode.CODE); }.bind(this)}>{msg.codeMode()}</ToggleButton>
        <ToggleButton id='designModeButton'
                      active={this.props.mode === Mode.DESIGN}
                      style={$.extend({}, styles.designButtonStyle,
                            this.props.hideToggle ? styles.hiddenStyle : null)}
                      onClick={function () { this.props.onChange(Mode.DESIGN); }.bind(this)}>{msg.designMode()}</ToggleButton>
      </span>
    );
  }
});
module.exports = ToggleGroup;