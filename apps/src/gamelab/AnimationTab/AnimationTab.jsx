/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var FrameList = require('./FrameList');
var AnimationPicker = require('../AnimationPicker/AnimationPicker');
var AnimationList = require('./AnimationList');
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
  animationsColumn: {
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
    channelId: React.PropTypes.string.isRequired
  },

  render: function () {
    return (
      <div>
        <ResizablePanes style={styles.root}>
          <div id='animations-column' style={styles.animationsColumn}>
            <GameLabVisualizationHeader />
            <AnimationList />
          </div>
          <div id='frames-column' style={styles.framesColumn}>
            <div className="purple-header workspace-header">
              <span>Frames</span>
            </div>
            <FrameList />
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
        <AnimationPicker channelId={this.props.channelId}/>
      </div>
    );
  }
});
module.exports = AnimationTab;
