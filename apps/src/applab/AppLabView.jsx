/** @file Top-level view for App Lab */
'use strict';

var _ = require('lodash');
var connect = require('react-redux').connect;
var actions = require('./actions');
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var TopInstructions = require('../templates/instructions/TopInstructions.jsx');
var CodeWorkspaceContainer = require('../templates/CodeWorkspaceContainer.jsx');
var utils = require('../utils');

// TODO These numbers are defined in style-constants.scss. Do the same sort
// of thing we did with colors
var HEADER_HEIGHT = 30;

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

  render: function () {
    var playSpaceHeader;
    if (!this.props.isReadOnlyWorkspace) {
      playSpaceHeader = <PlaySpaceHeader
          isEditingProject={this.props.isEditingProject}
          screenIds={this.props.screenIds}
          onViewDataButton={this.props.onViewDataButton}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    var instructionsHeight = this.props.instructionsHeight;
    if (this.props.instructionsCollapsed) {
      instructionsHeight = HEADER_HEIGHT;
    }

    if (!this.props.instructionsInTopPane) {
      instructionsHeight = 0;
    }

    var codeWorkspaceContainerStyle = {
      top: instructionsHeight
    };


    // TODO - there are a small set of levels that have instructions but not markdownInstructions
    //   (that are also used in scripts). should convert these to have markdown instructions
    // TODO - changing id of codeWorkspace to codeWorkspaceApplab will break callouts and some UI tests
    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        <TopInstructions
            height={instructionsHeight}
            markdown={this.props.instructionsMarkdown}
            collapsed={this.props.instructionsCollapsed}
            onToggleCollapsed={this.props.toggleInstructionsCollapsed}
            onChangeHeight={this.props.setInstructionsHeight}/>
        <CodeWorkspaceContainer
            topMargin={instructionsHeight}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}
            onSizeChange={utils.fireResizeEvent}/>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace,
    instructionsInTopPane: state.instructions.inTopPane,
    instructionsMarkdown: state.level.instructionsMarkdown,
    // TODO - how do i actually feel about using inTopPane here?
    instructionsCollapsed: state.instructions.collapsed || !state.instructions.inTopPane,
    instructionsHeight: state.instructions.height,
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
