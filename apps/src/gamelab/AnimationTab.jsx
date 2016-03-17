/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var GameLabVisualizationHeader = require('./GameLabVisualizationHeader.jsx');
var ResizablePanes = require('./ResizablePanes.jsx');
var ScrollableList = require('./ScrollableList.jsx');

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
        <div style={{flex: '0 0 150px', minWidth: 150, maxWidth: 300, display: 'flex', flexDirection: 'column'}}>
          <GameLabVisualizationHeader/>
          <ScrollableList style={{border: 'solid thin purple', borderRight: 'none'}}>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
          </ScrollableList>
        </div>
        <div style={{flex: '0 0 200px', minWidth: 150, maxWidth: 300, border: 'solid thin purple', borderRight: 'none', display: 'flex', flexDirection: 'column'}}>
          <div className="purple-header workspace-header"><span>Frames</span></div>
          <ScrollableList>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 100, height: 100, border: 'solid black thin', margin: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)'}}></div>
          </ScrollableList>
        </div>
        <div style={{border: 'solid thin purple', display: 'flex', flexDirection: 'column'}}>
          <div className="purple-header workspace-header"><span>Workspace</span></div>
          <div style={{flex: '1 0', backgroundColor: 'orange'}}>
            TODO: Piskel editor goes here!
          </div>
        </div>
      </ResizablePanes>
    );
  }
});
module.exports = AnimationTab;