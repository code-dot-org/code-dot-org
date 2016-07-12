/** @file Row of controls above the visualization. */
import React from 'react';
import {changeInterfaceMode} from './actions';
var connect = require('react-redux').connect;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
var msg = require('../locale');
var ToggleGroup = require('../templates/ToggleGroup');
var styleConstants = require('../styleConstants');

var styles = {
  main: {
    height: styleConstants["workspace-headers-height"],
  }
};

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
var GameLabVisualizationHeader = React.createClass({
  propTypes: {
    isShareView: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes
        .oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION])
        .isRequired,
    showAnimationMode: React.PropTypes.bool.isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div style={styles.main}>
        <ToggleGroup
            selected={this.props.interfaceMode}
            onChange={this.props.onInterfaceModeChange}>
          <button value={GameLabInterfaceMode.CODE}>
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
module.exports = connect(function propsFromStore(state) {
  return {
    isShareView: state.pageConstants.isShareView,
    interfaceMode: state.interfaceMode,
    showAnimationMode: state.pageConstants.showAnimationMode
  };
}, function propsFromDispatch(dispatch) {
  return {
    onInterfaceModeChange: function (mode) {
      dispatch(changeInterfaceMode(mode));
    }
  };
})(GameLabVisualizationHeader);
