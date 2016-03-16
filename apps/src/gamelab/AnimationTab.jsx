/** @file Root of the animation editor interface mode for GameLab */
'use strict';

var GameLabVisualizationHeader = require('./GameLabVisualizationHeader.jsx');

/**
 * Root of the animation editor interface mode for GameLab
 */
var AnimationTab = React.createClass({
  propTypes: {
  },

  render: function () {
    return (
      <div>
        <GameLabVisualizationHeader/>
      </div>
    );
  }
});
module.exports = AnimationTab;