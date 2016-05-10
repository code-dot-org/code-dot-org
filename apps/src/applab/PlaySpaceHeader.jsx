/** @file Row of controls above the visualization. */

var constants = require('./constants');
var msg = require('../locale');
var utils = require('../utils');
var actions = require('./actions');
var connect = require('react-redux').connect;
var ScreenSelector = require('./ScreenSelector');
var ToggleGroup = require('../templates/ToggleGroup');
var ViewDataButton = require('./ViewDataButton');
var experiments = require('../experiments');

var ApplabInterfaceMode = constants.ApplabInterfaceMode;

var PlaySpaceHeader = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    isDesignModeHidden: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isViewDataButtonHidden: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes.oneOf([ApplabInterfaceMode.CODE, ApplabInterfaceMode.DESIGN]).isRequired,
    screenIds: React.PropTypes.array.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  handleViewData: function () {
    window.open(
      '//' + utils.getPegasusHost() + '/v3/edit-csp-app/' + this.props.channelId,
      '_blank');
  },

  render: function () {
    var leftSide, rightSide;

    var phoneFrame = experiments.isEnabled('phoneFrame');

    if (!this.shouldHideToggle()) {
      leftSide = (
        <ToggleGroup selected={this.props.interfaceMode} onChange={this.props.onInterfaceModeChange}>
          <button id='codeModeButton' value={ApplabInterfaceMode.CODE}>{msg.codeMode()}</button>
          <button id='designModeButton' value={ApplabInterfaceMode.DESIGN}>{msg.designMode()}</button>
        </ToggleGroup>
      );
    }

    if (this.props.interfaceMode === ApplabInterfaceMode.CODE && !this.shouldHideViewDataButton()) {
      rightSide = <ViewDataButton onClick={this.handleViewData} />;
    } else if (this.props.interfaceMode === ApplabInterfaceMode.DESIGN && !phoneFrame) {
      rightSide = <ScreenSelector
          screenIds={this.props.screenIds}
          onCreate={this.props.onScreenCreate}/>;
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
    channelId: state.pageConstants.channelId,
    isDesignModeHidden: state.pageConstants.isDesignModeHidden,
    isShareView: state.pageConstants.isShareView,
    isViewDataButtonHidden: state.pageConstants.isViewDataButtonHidden,
    interfaceMode: state.interfaceMode
  };
}, function propsFromDispatch(dispatch) {
  return {
    onInterfaceModeChange: function (mode) {
      dispatch(actions.changeInterfaceMode(mode));
    }
  };
})(PlaySpaceHeader);
