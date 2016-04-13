var Visualization = require('./Visualization');
var GameButtons = require('./GameButtons');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var commonStyles = require('../commonStyles');
var connect = require('react-redux').connect;

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var ApplabVisualizationColumn = React.createClass({
  propTypes: {
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
        <GameButtons/>
        <ProtectedStatefulDiv id="belowVisualization">
          <div id="bubble" className="clearfix">
            <table id="prompt-table">
              <tbody>
                <tr>
                  <td id="prompt-icon-cell" style={commonStyles.hidden}>
                    <img id="prompt-icon"/>
                  </td>
                  <td id="prompt-cell">
                    <p id="prompt"/>
                    <p id="prompt2" style={commonStyles.hidden}/>
                  </td>
                </tr>
              </tbody>
            </table>
            <div id="ani-gif-preview-wrapper">
              <div id="ani-gif-preview">
              </div>
            </div>
          </div>
        </ProtectedStatefulDiv>
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
