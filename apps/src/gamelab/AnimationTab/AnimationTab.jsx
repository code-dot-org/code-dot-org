/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var Radium = require('radium');
var FrameList = require('./FrameList');
var AnimationPicker = require('../AnimationPicker/AnimationPicker');
var AnimationList = require('./AnimationList');
var styleConstants = require('../../styleConstants');
var commonStyles = require('../../commonStyles');
var color = require('../../color');
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
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 150px', // sets initial width
    minWidth: 150,
    maxWidth: 300
  },
  framesColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 250px', // sets initial width
    minWidth: 150,
    maxWidth: 300,
    border: 'solid thin ' + color.light_purple,
    borderRight: 'none'
  },
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    border: 'solid thin ' + color.light_purple
  },
  editorRegion: {
    flex: '1 0',
    backgroundColor: 'white',
    textAlign: 'center',
    paddingTop:'48%'
  },
};

/**
 * Root of the animation editor interface mode for GameLab
 */
var AnimationTab = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
  },

  render: function () {
    return (
      <div>
        <ResizablePanes style={styles.root}>
          <div style={styles.animationsColumn}>
            <GameLabVisualizationHeader />
            <AnimationList />
          </div>
          <div style={styles.framesColumn}>
            <div className="purple-header workspace-header" style={commonStyles.purpleHeader}>
              <span>Frames</span>
            </div>
            <FrameList />
          </div>
          <div style={styles.editorColumn}>
            <div className="purple-header workspace-header" style={commonStyles.purpleHeader}>
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
module.exports = Radium(AnimationTab);
