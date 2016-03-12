/** @file Row of controls above the visualization. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var constants = require('./constants');
var msg = require('../locale');
var actions = require('./actions');
var connect = require('react-redux').connect;
var ScreenSelector = require('./ScreenSelector.jsx');
var ToggleGroup = require('./ToggleGroup.jsx');
var ViewDataButton = require('./ViewDataButton.jsx');

var ApplabMode = constants.ApplabMode;

var PlaySpaceHeader = React.createClass({
  propTypes: {
    isDesignModeHidden: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isViewDataButtonHidden: React.PropTypes.bool.isRequired,
    mode: React.PropTypes.oneOf([ApplabMode.CODE, ApplabMode.DESIGN]).isRequired,
    screenIds: React.PropTypes.array.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
    onModeChange: React.PropTypes.func.isRequired
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
        <ToggleGroup selected={this.props.mode} onChange={this.props.onModeChange}>
          <button id='codeModeButton' value={ApplabMode.CODE}>{msg.codeMode()}</button>
          <button id='designModeButton' value={ApplabMode.DESIGN}>{msg.designMode()}</button>
        </ToggleGroup>
      );
    }

    if (this.props.mode === ApplabMode.CODE && !this.shouldHideViewDataButton()) {
      rightSide = <ViewDataButton onClick={this.props.onViewDataButton} />;
    } else if (this.props.mode === ApplabMode.DESIGN) {
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
module.exports = connect(function propsFromStore(state) {
  return {
    isDesignModeHidden: state.level.isDesignModeHidden,
    isShareView: state.level.isShareView,
    isViewDataButtonHidden: state.level.isViewDataButtonHidden,
    mode: state.mode
  };
}, function propsFromDispatch(dispatch) {
  return {
    onScreenChange: function (screenId) {
      dispatch(actions.changeScreen(screenId));
    },
    onModeChange: function (mode) {
      dispatch(actions.changeMode(mode));
    }
  };
})(PlaySpaceHeader);
