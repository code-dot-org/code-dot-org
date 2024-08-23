/** @file Row of controls above the visualization. */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import harness from '@cdo/apps/lib/util/harness';
import styleConstants from '@cdo/apps/styleConstants';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';

import * as utils from '../utils';

import {changeInterfaceMode} from './actions';
import {P5LabInterfaceMode, P5LabType} from './constants';
import PoemSelector from './poetry/PoemSelector';
import {allowAnimationMode, countAllowedModes} from './stateQueries';

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

      harness.trackAnalytics({
        study: 'animation-library',
        study_group: 'control-2020',
        event: 'tab-click',
        data_string: this.props.isBlockly ? 'spritelab' : 'gamelab',
      });
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
            <ToggleGroup
              selected={interfaceMode}
              onChange={this.changeInterfaceMode}
              flex={true}
            >
              <button
                style={styles.buttonFocus}
                type="button"
                value={P5LabInterfaceMode.CODE}
                id="codeMode"
              >
                {msg.codeMode()}
              </button>
              {allowAnimationMode && (
                <button
                  style={styles.buttonFocus}
                  type="button"
                  value={P5LabInterfaceMode.ANIMATION}
                  id="animationMode"
                >
                  {this.props.isBlockly
                    ? msg.costumeMode()
                    : msg.animationMode()}
                </button>
              )}
              {allowAnimationMode && this.props.isBlockly && (
                <button
                  style={{
                    ...styles.buttonFocus,
                    // If the button text is wider than the available space, truncate it.
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  type="button"
                  value={P5LabInterfaceMode.BACKGROUND}
                  id="backgroundMode"
                >
                  {msg.backgroundMode()}
                </button>
              )}
            </ToggleGroup>
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
  buttonFocus: {
    ':focus': {
      outlineWidth: 1,
      outlineColor: color.black,
    },
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
