/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var AnimationFrameList = require('./AnimationFrameList.jsx');
var AnimationSequenceList = require('./AnimationSequenceList.jsx');
var GameLabVisualizationHeader = require('../GameLabVisualizationHeader.jsx');
var ResizablePanes = require('./ResizablePanes.jsx');

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
var AnimationTab = function () {
  return (
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
  );
};
module.exports = AnimationTab;
