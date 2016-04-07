/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var AnimationFrameList = require('./AnimationFrameList');
var AnimationPicker = require('../AnimationPicker/index');
var animationPickerActions = require('../AnimationPicker/actions');
var AnimationSequenceList = require('./AnimationSequenceList');
var connect = require('react-redux').connect;
var GameLabVisualizationHeader = require('../GameLabVisualizationHeader');
var ResizablePanes = require('./ResizablePanes');

var staticStyles = {
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
var AnimationTab = function (props) {
  return (
    <div>
      <ResizablePanes style={staticStyles.root}>
        <div id='sequences-column' style={staticStyles.sequencesColumn}>
          <GameLabVisualizationHeader />
          <AnimationSequenceList />
        </div>
        <div id='frames-column' style={staticStyles.framesColumn}>
          <div className="purple-header workspace-header">
            <span>Frames</span>
          </div>
          <AnimationFrameList />
        </div>
        <div id='editor-column'>
          <div className="purple-header workspace-header">
            <span>Workspace</span>
          </div>
          <div style={staticStyles.editorRegion}>
            TODO: Piskel editor goes here!
          </div>
        </div>
      </ResizablePanes>
      {props.isAnimationPickerShowing &&
          <AnimationPicker handleClose={props.hideAnimationPicker} />}
    </div>
  );
};

AnimationTab.propTypes = {
  isAnimationPickerShowing: React.PropTypes.bool.isRequired,
  hideAnimationPicker: React.PropTypes.func.isRequired
};

module.exports = connect(function propsFromStore(state) {
  return {
    isAnimationPickerShowing: state.animationPicker.isShowing
  };
}, function propsFromDispatch(dispatch) {
  return {
    hideAnimationPicker: function () {
      dispatch(animationPickerActions.hideAnimationPicker());
    }
  };
})(AnimationTab);
