/** @file Row of controls above the visualization. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var constants = require('./constants');
var msg = require('../locale');
var connect = require('react-redux').connect;
var ScreenSelector = require('./ScreenSelector.jsx');
var ToggleGroup = require('./ToggleGroup.jsx');
var ViewDataButton = require('./ViewDataButton.jsx');

var Mode = constants.MODE;

var PlaySpaceHeader = React.createClass({
  propTypes: {
    isDesignModeHidden: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isViewDataButtonHidden: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.array.isRequired,
    startInDesignMode: React.PropTypes.bool.isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      mode: this.props.startInDesignMode ? Mode.DESIGN :  Mode.CODE
    };
  },

  handleSetMode: function (newMode) {
    if (this.state.mode === newMode) {
      return;
    }
    if (newMode === Mode.CODE) {
      this.props.onCodeModeButton();
    } else {
      this.props.onDesignModeButton();
    }

    this.setState({
      mode: newMode
    });
  },

  handleScreenChange: function (evt) {
    var screenId = evt.target.value;
    if (screenId === constants.NEW_SCREEN) {
      screenId = this.props.onScreenCreate();
    }
    this.props.onScreenChange(screenId);
  },

  render: function () {
    var leftSide, rightSide;

    if (!this.shouldHideToggle()) {
      leftSide = (
        <ToggleGroup selected={this.state.mode} onChange={this.handleSetMode}>
          <button id='codeModeButton' value={Mode.CODE}>{msg.codeMode()}</button>
          <button id='designModeButton' value={Mode.DESIGN}>{msg.designMode()}</button>
        </ToggleGroup>
      );
    }

    if (this.state.mode === Mode.CODE && !this.shouldHideViewDataButton()) {
      rightSide = <ViewDataButton onClick={this.props.onViewDataButton} />;
    } else if (this.state.mode === Mode.DESIGN) {
      rightSide = <ScreenSelector
          screenIds={this.props.screenIds}
          onChange={this.handleScreenChange} />;
    }

    return (
      <div id="playSpaceHeader">
        <table style={{width: '100%'}}>
          <tbody>
            <tr>
              <td style={{width: '120px'}}>{leftSide}</td>
              <td style={{maxWidth: 0}}>{rightSide}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  },

  shouldHideToggle: function () {
    return this.props.isShareView || this.props.isDesignModeHidden;
  },

  shouldHideViewDataButton: function () {
    return this.props.isViewDataButtonHidden ||
        this.props.isDesignModeHidden ||
        this.props.isShareView ||
        !this.props.isEditingProject;
  }
});
module.exports = connect(function propsFromState(state) {
  return {
    isDesignModeHidden: state.isDesignModeHidden,
    isShareView: state.isShareView,
    isViewDataButtonHidden: state.isViewDataButtonHidden
  };
})(PlaySpaceHeader);
