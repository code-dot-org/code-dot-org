/** @file Row of controls above the visualization. */
import PropTypes from 'prop-types';
import React from 'react';
import experiments from '@cdo/apps/util/experiments';
import {changeInterfaceMode} from './actions';
import {Goal, show} from './redux/animationPicker';
import {connect} from 'react-redux';
import {P5LabInterfaceMode, P5LabType} from './constants';
import msg from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import styleConstants from '@cdo/apps/styleConstants';
import {allowAnimationMode, countAllowedModes} from './stateQueries';
import PoemSelector from './poetry/PoemSelector';
import * as utils from '../utils';
import color from '@cdo/apps/util/color';

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
class P5LabVisualizationHeader extends React.Component {
  static propTypes = {
    labType: PropTypes.oneOf(Object.keys(P5LabType)).isRequired,
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION
    ]).isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired,
    isBlockly: PropTypes.bool.isRequired,
    numAllowedModes: PropTypes.number.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    openAnimationPicker: PropTypes.func.isRequired
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
    } else if (mode === P5LabInterfaceMode.ANIMATION) {
      if (this.props.isBlockly) {
        Blockly.WidgetDiv.hide();
        Blockly.DropDownDiv?.hide();
      }

      firehoseClient.putRecord({
        study: 'animation-library',
        study_group: 'control-2020',
        event: 'tab-click',
        data_string: this.props.isBlockly ? 'spritelab' : 'gamelab'
      });
    }

    this.props.onInterfaceModeChange(mode);

    /*
     * User Experiment for costume tab:
     * Treatment B: Clicking button switches to the Costume Tab and opens the animation picker modal
     * Original (No treatment): Clicking button switches to the Costume Tab (and does not open the modal)
     *
     * This user experiment will be conducted in November 2021. This code should be removed
     * and the behavior should revert to the original behavior by November 11, 2021.
     */
    if (
      experiments.isEnabled(experiments.COSTUME_TAB_B) &&
      mode === P5LabInterfaceMode.ANIMATION
    ) {
      this.props.openAnimationPicker();
    }
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
            </ToggleGroup>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    height: styleConstants['workspace-headers-height']
  },
  buttonFocus: {
    ':focus': {
      outlineWidth: 1,
      outlineColor: color.black
    }
  }
};
export default connect(
  state => ({
    interfaceMode: state.interfaceMode,
    allowAnimationMode: allowAnimationMode(state),
    isBlockly: state.pageConstants.isBlockly,
    numAllowedModes: countAllowedModes(state),
    isShareView: state.pageConstants.isShareView,
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
  }),
  dispatch => ({
    onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode)),
    openAnimationPicker: () => dispatch(show(Goal.NEW_ANIMATION, true))
  })
)(P5LabVisualizationHeader);
