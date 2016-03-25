'use strict';

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('./StudioAppWrapper.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <StudioAppWrapper
          assetUrl={this.props.assetUrl}
          isEmbedView={this.props.isEmbedView}
          isShareView={this.props.isShareView}>
        <ProtectedStatefulDiv
            id="visualizationColumn"
            contentFunction={this.props.generateVisualizationColumnHtml} />
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv id="codeWorkspace" className="workspace-right">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" contentFunction={this.props.generateCodeWorkspaceHtml}/>
        </ProtectedStatefulDiv>
      </StudioAppWrapper>
    );
  }
});
module.exports = AppView;
