/** @file Top-level view for Gamelab */
'use strict';

var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var GameLabVisualizationHeader = require('./GameLabVisualizationHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');

/**
 * Top-level React wrapper for Gamelab
 */
var GamelabView = React.createClass({
  propTypes: {
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    var leftColumnHeader;
    if (!this.props.isReadOnlyWorkspace) {
      leftColumnHeader = <GameLabVisualizationHeader
          isEditingProject={this.props.isEditingProject}
          screenIds={this.props.screenIds}
          onViewDataButton={this.props.onViewDataButton}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {leftColumnHeader}
          <ProtectedStatefulDiv renderContents={this.props.renderVisualizationColumn} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv id="codeWorkspace">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" renderContents={this.props.renderCodeWorkspace}/>
        </ProtectedStatefulDiv>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = GamelabView;
