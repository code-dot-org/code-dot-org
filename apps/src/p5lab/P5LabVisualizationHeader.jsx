/** @file Row of controls above the visualization. */
import PropTypes from 'prop-types';
import React from 'react';
import {changeInterfaceMode} from './actions';
import {connect} from 'react-redux';
import {P5LabInterfaceMode} from './constants';
import msg from '@cdo/locale';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import styleConstants from '@cdo/apps/styleConstants';
import {allowAnimationMode} from './stateQueries';
import * as utils from '../utils';

const styles = {
  main: {
    height: styleConstants['workspace-headers-height']
  }
};

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
class P5LabVisualizationHeader extends React.Component {
  static propTypes = {
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION
    ]).isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired,
    spriteLab: PropTypes.bool.isRequired
  };

  changeInterfaceMode = mode => {
    if (!this.props.spriteLab) {
      // Add a resize event to Gamelab (i.e. droplet) to ensure code is rendered
      // correctly if it was in the middle of a transition from code to block mode
      // when the interface mode was changed. Blockly already fires resize events
      // so this is not needed for spriteLab - too many resize events seem to
      // conflict with each other.
      setTimeout(() => utils.fireResizeEvent(), 0);
    }

    this.props.onInterfaceModeChange(mode);
  };

  render() {
    const {interfaceMode, allowAnimationMode} = this.props;
    return (
      <div style={styles.main} id="playSpaceHeader">
        <ToggleGroup
          selected={interfaceMode}
          onChange={this.changeInterfaceMode}
        >
          <button type="button" value={P5LabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {allowAnimationMode && (
            <button
              type="button"
              value={P5LabInterfaceMode.ANIMATION}
              id="animationMode"
            >
              {this.props.spriteLab ? msg.costumeMode() : msg.animationMode()}
            </button>
          )}
        </ToggleGroup>
      </div>
    );
  }
}
export default connect(
  state => ({
    interfaceMode: state.interfaceMode,
    allowAnimationMode: allowAnimationMode(state),
    spriteLab: state.pageConstants.isBlockly
  }),
  dispatch => ({
    onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode))
  })
)(P5LabVisualizationHeader);
