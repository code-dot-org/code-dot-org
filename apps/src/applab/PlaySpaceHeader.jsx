/** @file Row of controls above the visualization. */

import React from 'react';

import {ApplabInterfaceMode} from './constants';
import msg from '@cdo/locale';
import {actions} from './redux/applab';
import {connect} from 'react-redux';
import ScreenSelector from './ScreenSelector';
import ToggleGroup from '../templates/ToggleGroup';

var PlaySpaceHeader = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    hasDataMode: React.PropTypes.bool.isRequired,
    hasDesignMode: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA
    ]).isRequired,
    playspacePhoneFrame: React.PropTypes.bool,
    screenIds: React.PropTypes.array.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var leftSide, rightSide;
    var toggleGroupWidth = this.props.hasDataMode ? '160px' : '120px';

    if (!this.shouldHideToggle()) {
      leftSide = (
        <ToggleGroup selected={this.props.interfaceMode} onChange={this.props.onInterfaceModeChange}>
          <button id="codeModeButton" value={ApplabInterfaceMode.CODE}>{msg.codeMode()}</button>
          <button id="designModeButton" value={ApplabInterfaceMode.DESIGN}>{msg.designMode()}</button>
          {this.props.hasDataMode &&
            <button id="dataModeButton" value={ApplabInterfaceMode.DATA}>{msg.dataMode()}</button>
          }
        </ToggleGroup>
      );
    }

    if (this.props.interfaceMode === ApplabInterfaceMode.DESIGN &&
        !this.props.playspacePhoneFrame) {
      rightSide = (
        <ScreenSelector
          screenIds={this.props.screenIds}
          onCreate={this.props.onScreenCreate}
        />
      );
    }

    return (
      <div id="playSpaceHeader">
        <table style={{width: '100%'}}>
          <tbody>
            <tr>
              <td style={{width: toggleGroupWidth}}>{leftSide}</td>
              <td style={{maxWidth: 0}}>{rightSide}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  },

  shouldHideToggle: function () {
    return this.props.isShareView || !this.props.hasDesignMode;
  },
});

export default connect(function propsFromStore(state) {
  return {
    channelId: state.pageConstants.channelId,
    hasDataMode: state.pageConstants.hasDataMode,
    hasDesignMode: state.pageConstants.hasDesignMode,
    isShareView: state.pageConstants.isShareView,
    interfaceMode: state.interfaceMode,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
  };
}, function propsFromDispatch(dispatch) {
  return {
    onInterfaceModeChange: function (mode) {
      dispatch(actions.changeInterfaceMode(mode));
    }
  };
})(PlaySpaceHeader);
