/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var GameLabVisualizationHeader = require('./GameLabVisualizationHeader.jsx');
var ResizablePanes = require('./ResizablePanes.jsx');

/**
 * Root of the animation editor interface mode for GameLab
 */
var AnimationTab = React.createClass({
  propTypes: {
  },

  render: function () {
    var fillAbsoluteParentStyle = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };

    return (
      <ResizablePanes style={fillAbsoluteParentStyle}>
        <div style={{backgroundColor: 'rgba(255,0,0,0.2)', flex: '0 0 150px', minWidth: 150, maxWidth: 300}}>
          <GameLabVisualizationHeader/>
        </div>
        <div style={{backgroundColor: 'rgba(0,255,0,0.2)', flex: '0 0 200px', minWidth: 150, maxWidth: 300}}></div>
        <div style={{backgroundColor: 'rgba(0,0,255,0.2)'}}></div>
      </ResizablePanes>
    );
  }
});
module.exports = AnimationTab;