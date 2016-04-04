/** @file Top-level view for App Lab */
'use strict';

var _ = require('../lodash');
var connect = require('react-redux').connect;
var actions = require('./actions');
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var TopInstructions = require('../templates/instructions/TopInstructions.jsx');
var CodeWorkspaceContainer = require('../templates/CodeWorkspaceContainer.jsx');
var utils = require('../utils');
var styleConstants = require('../styleConstants');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    instructionsMarkdown: React.PropTypes.string,
    instructionsCollapsed: React.PropTypes.bool.isRequired,
    instructionsHeight: React.PropTypes.number.isRequired,

    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  /**
   * @returns {number} How much vertical space is consumed by the TopInstructions
   */
  topPaneHeight: function () {
    // instructionsHeight represents the height of the TopInstructions if displayed
    // and not collapsed
    var height = this.props.instructionsHeight;

    // If collapsed, we only use display instructions header
    if (this.props.instructionsCollapsed) {
      height = HEADER_HEIGHT;
    }

    // Or we may not display the instructions pane at all
    if (!this.props.instructionsInTopPane) {
      height = 0;
    }

    return height;
  },

  render: function () {
    var playSpaceHeader;
    if (!this.props.isReadOnlyWorkspace) {
      playSpaceHeader = <PlaySpaceHeader
          isEditingProject={this.props.isEditingProject}
          screenIds={this.props.screenIds}
          onViewDataButton={this.props.onViewDataButton}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    var topPaneHeight = this.topPaneHeight();
    var codeWorkspaceContainerStyle = {
      top: topPaneHeight
    };

    // TODO - there are a small set of levels that have instructions but not markdownInstructions
    //   (that are also used in scripts). should convert these to have markdown instructions
    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        {this.props.instructionsInTopPane && <TopInstructions
          isEmbedView={this.props.isEmbedView}
          puzzleNumber={this.props.puzzleNumber}
          stageTotal={this.props.stageTotal}
          height={topPaneHeight}
          markdown={this.props.instructionsMarkdown}
          collapsed={this.props.instructionsCollapsed}
          onToggleCollapsed={this.props.toggleInstructionsCollapsed}
          onChangeHeight={this.props.setInstructionsHeight}/>
        }
        <CodeWorkspaceContainer
            topMargin={topPaneHeight}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}
            onSizeChange={utils.fireResizeEvent}/>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace,
    instructionsInTopPane: state.level.instructionsInTopPane,
    instructionsMarkdown: state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.level.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    isEmbedView: state.level.isEmbedView,
    puzzleNumber: state.level.puzzleNumber,
    stageTotal: state.level.stageTotal
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed: function () {
      dispatch(actions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight: function (height) {
      dispatch(actions.setInstructionsHeight(height));
    }
  };
}
)(AppLabView);
