/** @file Row of controls above the visualization. */
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import styleConstants from '@cdo/apps/styleConstants';
import msg from '@cdo/locale';

import * as utils from '../utils';

import {changeInterfaceMode} from './actions';
import {P5LabInterfaceMode, P5LabType} from './constants';
import PoemSelector from './poetry/PoemSelector';
import {allowAnimationMode, countAllowedModes} from './stateQueries';

import legacyStyles from '@cdo/apps/templates/legacy-toggle-styles.module.scss';

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
class P5LabVisualizationHeader extends React.Component {
  static propTypes = {
    labType: PropTypes.oneOf(Object.keys(P5LabType)).isRequired,
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION,
      P5LabInterfaceMode.BACKGROUND,
    ]).isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired,
    isBlockly: PropTypes.bool.isRequired,
    numAllowedModes: PropTypes.number.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
  };

  changeInterfaceMode = mode => {
    // Make sure code workspace is rendered properly after switching from the Animation Tab.
    if (mode === P5LabInterfaceMode.CODE) {
      if (this.props.isBlockly) {
        // Sprite Lab (Blockly) doesn't need a window resize event, but it does need to rerender.
        setTimeout(() => Blockly.mainBlockSpace.render(), 0);
      } else {
        // Fire a window resize event to tell Game Lab (Droplet) to rerender.
        setTimeout(() => utils.fireResizeEvent(), 0);
      }
    } else if (
      mode === P5LabInterfaceMode.ANIMATION ||
      mode === P5LabInterfaceMode.BACKGROUND
    ) {
      if (this.props.isBlockly) {
        Blockly.WidgetDiv.hide();
        Blockly.DropDownDiv?.hide();
      }
    }

    this.props.onInterfaceModeChange(mode);
  };

  shouldShowPoemSelector() {
    return (
      this.props.labType === P5LabType.POETRY &&
      this.props.interfaceMode === P5LabInterfaceMode.CODE &&
      !this.props.isShareView &&
      !this.props.isReadOnlyWorkspace
    );
  }

  render() {
    const {interfaceMode, allowAnimationMode} = this.props;
    return (
      <div>
        {this.shouldShowPoemSelector() && <PoemSelector />}
        {this.props.numAllowedModes > 1 && (
          <div style={styles.main} id="playSpaceHeader">
            <SegmentedButtons
              selectedButtonValue={interfaceMode}
              onChange={this.changeInterfaceMode}
              className={legacyStyles.legacyToggle}
              buttons={[
                {
                  value: P5LabInterfaceMode.CODE,
                  label: msg.codeMode(),
                  id: 'codeMode',
                },
                ...(allowAnimationMode
                  ? [
                      {
                        value: P5LabInterfaceMode.ANIMATION,
                        label: this.props.isBlockly
                          ? msg.costumeMode()
                          : msg.animationMode(),
                        id: 'animationMode',
                      },
                    ]
                  : []),
                ...(allowAnimationMode && this.props.isBlockly
                  ? [
                      {
                        value: P5LabInterfaceMode.BACKGROUND,
                        label: msg.backgroundMode(),
                        id: 'backgroundMode',
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    height: styleConstants['workspace-headers-height'],
  },
};
export default connect(
  state => ({
    interfaceMode: state.interfaceMode,
    allowAnimationMode: allowAnimationMode(state),
    isBlockly: state.pageConstants.isBlockly,
    numAllowedModes: countAllowedModes(state),
    isShareView: state.pageConstants.isShareView,
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  }),
  dispatch => {
    return {
      onInterfaceModeChange(mode) {
        dispatch(changeInterfaceMode(mode));
      },
    };
  }
)(P5LabVisualizationHeader);
