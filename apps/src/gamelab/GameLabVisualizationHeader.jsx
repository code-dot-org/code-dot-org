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
    isShareView: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes
        .oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION])
        .isRequired,
    showAnimationMode: React.PropTypes.bool.isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div style={styles.main}>
        <ToggleGroup
            selected={this.props.interfaceMode}
            onChange={this.props.onInterfaceModeChange}
        >
          <button value={GameLabInterfaceMode.CODE} id="codeMode">
            {msg.codeMode()}
          </button>
          {this.props.showAnimationMode &&
            <button value={GameLabInterfaceMode.ANIMATION} id="animationMode">
              {msg.animationMode()}
            </button>}
        </ToggleGroup>
      </div>
    );
  }
});
module.exports = connect(state => ({
  isShareView: state.pageConstants.isShareView,
  interfaceMode: state.interfaceMode,
  showAnimationMode: state.pageConstants.showAnimationMode
}), dispatch => ({
  onInterfaceModeChange: mode => dispatch(changeInterfaceMode(mode))
}))(GameLabVisualizationHeader);
