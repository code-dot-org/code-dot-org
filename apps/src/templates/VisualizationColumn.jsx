var msg = require('../locale');
var commonStyles = require('../commonStyles');

var GameButtons = require('./GameButtons');
var BelowVisualization = require('./BelowVisualization');

/**
 * Generic visualization column, currently only used by Maze. Might end up
 * makign sense to share with App Lab, or alternatively to have each app end
 * up with their own version.
 */
var VisualizationColumn = React.createClass({
  propTypes: {
    hideRunButton: React.PropTypes.bool.isRequired,
    visualization: React.PropTypes.element.isRequired,
    controls: React.PropTypes.element.isRequired,
    extraControls: React.PropTypes.element,
  },

  render: function () {
    return (
      <span>
        {this.props.visualization}

        <GameButtons hideRunButton={this.props.hideRunButton}>
          {this.props.controls}
        </GameButtons>

        {/* TODO - other apps may have data.pinWorkspaceToBottom */}
        {this.props.extraControls}

        <BelowVisualization/>
      </span>
    );
  }
});

module.exports = VisualizationColumn;
