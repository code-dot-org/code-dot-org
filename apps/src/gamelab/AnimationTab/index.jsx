/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var actions = require('./actions');
var AnimationFrameList = require('./AnimationFrameList');
var AnimationPicker = require('../AnimationPicker/index');
var AnimationSequenceList = require('./AnimationSequenceList');
var connect = require('react-redux').connect;
var GameLabVisualizationHeader = require('../GameLabVisualizationHeader');
var ResizablePanes = require('./ResizablePanes');

var styles = {
  root: {
    position: 'absolute',
    top: 0,
    bottom: 20,
    left: 0,
    right: 0
  },
  sequencesColumn: {
    flex: '0 0 150px' // sets initial width
  },
  framesColumn: {
    flex: '0 0 250px' // sets initial width
  },
  editorRegion: {
    flex: '1 0',
    backgroundColor: 'white',
    textAlign: 'center',
    paddingTop:'48%'
  }
};

/**
 * Root of the animation editor interface mode for GameLab
 */
var AnimationTab = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    isAnimationPickerShowing: React.PropTypes.bool.isRequired,
    onAnimationPickerComplete: React.PropTypes.func.isRequired,
    onAnimationPickerCancel: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div>
        <ResizablePanes style={styles.root}>
          <div id='sequences-column' style={styles.sequencesColumn}>
            <GameLabVisualizationHeader />
            <AnimationSequenceList />
          </div>
          <div id='frames-column' style={styles.framesColumn}>
            <div className="purple-header workspace-header">
              <span>Frames</span>
            </div>
            <AnimationFrameList />
          </div>
          <div id='editor-column'>
            <div className="purple-header workspace-header">
              <span>Workspace</span>
            </div>
            <div style={styles.editorRegion}>
              TODO: Piskel editor goes here!
            </div>
          </div>
        </ResizablePanes>
        {this.props.isAnimationPickerShowing &&
        <AnimationPicker
            onComplete={this.props.onAnimationPickerComplete}
            onCancel={this.props.onAnimationPickerCancel}
            channelId={this.props.channelId}/>}
      </div>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    isAnimationPickerShowing: state.animationTab.animationPickerFlow.isPickerShowing
  };
}, function propsFromDispatch(dispatch) {
  return {
    onAnimationPickerComplete: function (result) {
      dispatch(actions.finishPickingAnimation(result));
    },
    onAnimationPickerCancel: function () {
      dispatch(actions.cancelPickingAnimation());
    }
  };
})(AnimationTab);
