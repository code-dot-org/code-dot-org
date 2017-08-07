/** @file Row of controls above the visualization. */
import React from 'react';
import PropTypes from 'prop-types';
import {changeInterfaceMode} from './actions';
import {connect} from 'react-redux';
import {GameLabInterfaceMode} from './constants';
import msg from '@cdo/locale';
import ToggleGroup from '../templates/ToggleGroup';
import styleConstants from '../styleConstants';
import {allowAnimationMode} from './stateQueries';

const styles = {
  main: {
    height: styleConstants["workspace-headers-height"]
  }
};

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
const GameLabVisualizationHeader = React.createClass({
  propTypes: {
    interfaceMode: PropTypes
        .oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION])
        .isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    onInterfaceModeChange: PropTypes.func.isRequired
  },

  render() {
    const {interfaceMode, allowAnimationMode,
        onInterfaceModeChange} = this.props;
    return (
      <div style={styles.main} id="playSpaceHeader">
        <ToggleGroup
          selected={interfaceMode}
          onChange={onInterfaceModeChange}
        >
          <button value={GameLabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {allowAnimationMode &&
            <button value={GameLabInterfaceMode.ANIMATION} id="animationMode">
              {msg.animationMode()}
            </button>
          }
        </ToggleGroup>
      </div>
    );
  }
});
module.exports = connect(state => ({
  interfaceMode: state.interfaceMode,
  allowAnimationMode: allowAnimationMode(state)
}), dispatch => ({
  onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode))
}))(GameLabVisualizationHeader);
