/** @file Row of controls above the visualization. */
import * as utils from '../utils';
import PropTypes from 'prop-types';
import React from 'react';
import {changeInterfaceMode} from './actions';
import {connect} from 'react-redux';
import {GameLabInterfaceMode} from './constants';
import msg from '@cdo/locale';
import ToggleGroup from '../templates/ToggleGroup';
import styleConstants from '../styleConstants';
import {allowAnimationMode} from './stateQueries';

const styles = {
  main: {
    height: styleConstants['workspace-headers-height']
  }
};

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
class GameLabVisualizationHeader extends React.Component {
  static propTypes = {
    interfaceMode: PropTypes.oneOf([
      GameLabInterfaceMode.CODE,
      GameLabInterfaceMode.ANIMATION
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
          <button type="button" value={GameLabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {allowAnimationMode && (
            <button
              type="button"
              value={GameLabInterfaceMode.ANIMATION}
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
)(GameLabVisualizationHeader);
