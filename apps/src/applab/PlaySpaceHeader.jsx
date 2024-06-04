/** @file Row of controls above the visualization. */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import msg from '@cdo/locale';

import {isDatablockStorage} from '../storage/storage';
import ToggleGroup from '../templates/ToggleGroup';

import {ApplabInterfaceMode} from './constants';
import {actions} from './redux/applab';
import ScreenSelector from './ScreenSelector';

class PlaySpaceHeader extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
    hasDataMode: PropTypes.bool.isRequired,
    hasDesignMode: PropTypes.bool.isRequired,
    isEditingProject: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    interfaceMode: PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA,
    ]).isRequired,
    playspacePhoneFrame: PropTypes.bool,
    screenIds: PropTypes.array.isRequired,
    onScreenCreate: PropTypes.func.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired,
  };

  // Visually flag that a project is part of the Datablock Storage experiment
  // by squaring the otherwise rounded-on-the-right corners of the [Data] tab.
  //
  // Why? We are gradually rolling out Datablock Storage in a small percentage
  // of Applab projects. For bug triage, we need a quick way for CS to identify
  // projects using Datablock Storage that is likely to be recognizable even if
  // screenshots are taken with a cell phone, or cropped.
  //
  // TODO: post-firebase-cleanup, remove this method, #56994
  squareCornersIfUsingDatablockStorage() {
    const STYLE_TO_FLAG_DATABLOCK_STORAGE = {
      borderRadius: 0,
    };
    return isDatablockStorage() ? STYLE_TO_FLAG_DATABLOCK_STORAGE : {};
  }

  render() {
    let leftSide, rightSide;
    const toggleGroupWidth = this.props.hasDataMode ? '160px' : '120px';

    if (!this.shouldHideToggle()) {
      leftSide = (
        <ToggleGroup
          selected={this.props.interfaceMode}
          onChange={this.props.onInterfaceModeChange}
        >
          <button
            type="button"
            id="codeModeButton"
            value={ApplabInterfaceMode.CODE}
          >
            {msg.codeMode()}
          </button>
          <button
            type="button"
            id="designModeButton"
            value={ApplabInterfaceMode.DESIGN}
          >
            {msg.designMode()}
          </button>
          {this.props.hasDataMode && (
            <button
              type="button"
              id="dataModeButton"
              value={ApplabInterfaceMode.DATA}
              style={this.squareCornersIfUsingDatablockStorage()}
            >
              {msg.dataMode()}
            </button>
          )}
        </ToggleGroup>
      );
    }

    if (
      this.props.interfaceMode === ApplabInterfaceMode.DESIGN &&
      !this.props.playspacePhoneFrame
    ) {
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
  }

  shouldHideToggle() {
    return this.props.isShareView || !this.props.hasDesignMode;
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      channelId: state.pageConstants.channelId,
      hasDataMode: state.pageConstants.hasDataMode,
      hasDesignMode: state.pageConstants.hasDesignMode,
      isShareView: state.pageConstants.isShareView,
      interfaceMode: state.interfaceMode,
      playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      onInterfaceModeChange: function (mode) {
        dispatch(actions.changeInterfaceMode(mode));
      },
    };
  }
)(PlaySpaceHeader);
