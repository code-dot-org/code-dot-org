var Visualization = require('./Visualization');
var GameButtons = require('../templates/GameButtons');
var CompletionButton = require('./CompletionButton');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var BelowVisualization = require('../templates/BelowVisualization');
var connect = require('react-redux').connect;

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var ApplabVisualizationColumn = React.createClass({
  propTypes: {
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
  },

  render: function () {
    return (
      <div id="visualizationColumn">
        {!this.props.isReadOnlyWorkspace && <PlaySpaceHeader
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate} />
        }
        <Visualization/>
        <GameButtons>
          <CompletionButton/>
        </GameButtons>
        <BelowVisualization/>
      </div>
    );
  }
})
;
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace,
  };
})(ApplabVisualizationColumn);
