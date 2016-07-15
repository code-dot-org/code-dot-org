/** @file Row of controls above the visualization. */
import React from 'react';
import {changeInterfaceMode} from './actions';
import {connect} from 'react-redux';
import {GameLabInterfaceMode} from './constants';
import msg from '../locale';
import ToggleGroup from '../templates/ToggleGroup';
import styleConstants from '../styleConstants';

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
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes
        .oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION])
        .isRequired,
    showAnimationMode: React.PropTypes.bool.isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  render() {
    const {isReadOnlyWorkspace, interfaceMode, showAnimationMode,
        onInterfaceModeChange} = this.props;
    return (
      <div style={styles.main}>
        <ToggleGroup
            selected={interfaceMode}
            onChange={onInterfaceModeChange}
        >
          <button value={GameLabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {showAnimationMode && !isReadOnlyWorkspace &&
            <button value={GameLabInterfaceMode.ANIMATION} id="animationMode">
              {msg.animationMode()}
            </button>}
        </ToggleGroup>
      </div>
    );
  }
});
module.exports = connect(state => ({
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  isShareView: state.pageConstants.isShareView,
  interfaceMode: state.interfaceMode,
  showAnimationMode: state.pageConstants.showAnimationMode
}), dispatch => ({
  onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode))
}))(GameLabVisualizationHeader);
