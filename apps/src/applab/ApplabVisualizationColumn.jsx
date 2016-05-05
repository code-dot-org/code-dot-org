var Radium = require('radium');
var Visualization = require('./Visualization');
var GameButtons = require('../templates/GameButtons');
var CompletionButton = require('./CompletionButton');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var PhoneFrame = require('./PhoneFrame');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var applabConstants = require('./constants');
var connect = require('react-redux').connect;

var styles = {
  nonResponsive: {
    maxWidth: applabConstants.APP_WIDTH,
  }
};

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var ApplabVisualizationColumn = React.createClass({
  propTypes: {
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,

    isEditingProject: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
  },

  render: function () {
    var classes = '';
    if (this.props.visualizationHasPadding) {
      classes += 'with_padding';
    }

    var vizColStyle = [
      (this.props.isEmbedView || this.props.hideSource) && styles.nonResponsive
    ];

    var showFrame = !this.props.isEmbedView && !this.props.isShareView;

    return (
      <div id="visualizationColumn" className={classes} style={vizColStyle}>
        {!this.props.isReadOnlyWorkspace && <PlaySpaceHeader
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate} />
        }
        <PhoneFrame showFrame={showFrame} isRunning={this.props.isRunning}>
          <Visualization/>
        </PhoneFrame>
        <GameButtons instructionsInTopPane={this.props.instructionsInTopPane}>
          <CompletionButton/>
        </GameButtons>
        <BelowVisualization instructionsInTopPane={this.props.instructionsInTopPane}/>
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    instructionsInTopPane: state.pageConstants.instructionsInTopPane,
    visualizationHasPadding: state.pageConstants.visualizationHasPadding,
    hideSource: state.pageConstants.hideSource,
    isShareView: state.pageConstants.isShareView,
    isEmbedView: state.pageConstants.isEmbedView,
    isRunning: state.runState.isRunning,
  };
})(Radium(ApplabVisualizationColumn));
