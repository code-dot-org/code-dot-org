/** @file Row of controls above the visualization. */

import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import msg from '@cdo/locale';

import {ApplabInterfaceMode} from './constants';
import {actions} from './redux/applab';
import ScreenSelector from './ScreenSelector';

import legacyStyles from '@cdo/apps/templates/legacy-toggle-styles.module.scss';

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

  render() {
    let leftSide, rightSide;
    const toggleGroupWidth = this.props.hasDataMode ? '160px' : '120px';

    if (!this.shouldHideToggle()) {
      leftSide = (
        <SegmentedButtons
          selectedButtonValue={this.props.interfaceMode}
          onChange={this.props.onInterfaceModeChange}
          className={legacyStyles.legacyToggle}
          buttons={[
            {
              value: ApplabInterfaceMode.CODE,
              label: msg.codeMode(),
              id: 'codeModeButton',
            },
            {
              value: ApplabInterfaceMode.DESIGN,
              label: msg.designMode(),
              id: 'designModeButton',
            },
            ...(this.props.hasDataMode
              ? [
                  {
                    value: ApplabInterfaceMode.DATA,
                    label: msg.dataMode(),
                    id: 'dataModeButton',
                  },
                ]
              : []),
          ]}
        />
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
