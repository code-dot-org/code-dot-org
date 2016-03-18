/** @file Row of controls above the visualization. */
var actions = require('./actions');
var connect = require('react-redux').connect;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
var msg = require('../locale');
var ToggleGroup = require('../templates/ToggleGroup.jsx');

/**
 * Controls above the visualization header, including the code/animation toggle.
 */
var GameLabVisualizationHeader = React.createClass({
  propTypes: {
    isShareView: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes
        .oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION])
        .isRequired,
    onInterfaceModeChange: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div className="workspace-header-height">
        <ToggleGroup
            selected={this.props.interfaceMode}
            onChange={this.props.onInterfaceModeChange}>
          <button value={GameLabInterfaceMode.CODE}>
            {msg.codeMode()}
          </button>
          <button value={GameLabInterfaceMode.ANIMATION}>
            {msg.animationMode()}
          </button>
        </ToggleGroup>
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isShareView: state.level.isShareView,
    interfaceMode: state.interfaceMode
  };
}, function propsFromDispatch(dispatch) {
  return {
    onInterfaceModeChange: function (mode) {
      dispatch(actions.changeInterfaceMode(mode));
    }
  };
})(GameLabVisualizationHeader);
