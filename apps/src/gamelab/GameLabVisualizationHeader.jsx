/** @file Row of controls above the visualization. */
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

  render() {
    const {
      interfaceMode,
      allowAnimationMode,
      onInterfaceModeChange
    } = this.props;
    return (
      <div style={styles.main} id="playSpaceHeader">
        <ToggleGroup selected={interfaceMode} onChange={onInterfaceModeChange}>
          <button value={GameLabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {allowAnimationMode && (
            <button value={GameLabInterfaceMode.ANIMATION} id="animationMode">
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
