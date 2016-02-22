/** @file Row of buttons for switching editor modes. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var constants = require('./constants');
var msg = require('../locale');
var ToggleButton = require('./ToggleButton.jsx');

var Mode = constants.MODE;

var ToggleGroup = React.createClass({
  propTypes: {
    mode: React.PropTypes.string.isRequired,
    hideToggle: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  setMode: function (mode) {
    this.props.onChange(mode);
  },

  render: function () {
    if (this.props.hideToggle) {
      return <span />;
    }

    return (
      <span>
        <ToggleButton id='codeModeButton'
                      active={this.props.mode === Mode.CODE}
                      first={true}
                      onClick={this.setMode.bind(this, Mode.CODE)}>{msg.codeMode()}</ToggleButton>
        <ToggleButton id='designModeButton'
                      active={this.props.mode === Mode.DESIGN}
                      last={true}
                      onClick={this.setMode.bind(this, Mode.DESIGN)}>{msg.designMode()}</ToggleButton>
      </span>
    );
  }
});
module.exports = ToggleGroup;