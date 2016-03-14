/** @file Top-level view for Gamelab */
'use strict';

var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');

/**
 * Top-level React wrapper for Gamelab
 */
var GamelabView = React.createClass({
  propTypes: {
    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <ConnectedStudioAppWrapper>
        <ProtectedStatefulDiv
            id="visualizationColumn"
            renderContents={this.props.renderVisualizationColumn} />
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv id="codeWorkspace">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" renderContents={this.props.renderCodeWorkspace}/>
        </ProtectedStatefulDiv>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = GamelabView;
