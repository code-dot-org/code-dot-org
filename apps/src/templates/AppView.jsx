'use strict';

var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('./StudioAppWrapper.jsx');
var CodeWorkspaceContainer = require('./CodeWorkspaceContainer.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    noVisualization: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    var isRTL = !!document.querySelector('html[dir="rtl"]');

    return (
      <StudioAppWrapper
          assetUrl={this.props.assetUrl}
          isEmbedView={this.props.isEmbedView}
          isShareView={this.props.isShareView}>
        <div id="visualizationColumn">
          <ProtectedStatefulDiv
            contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <CodeWorkspaceContainer
            topMargin={0}
            hidden={this.props.hideSource}
            noVisualization={this.props.noVisualization}
            isRtl={this.props.isRtl}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}/>
      </StudioAppWrapper>
    );
  }
});
module.exports = AppView;
