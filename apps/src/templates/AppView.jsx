'use strict';

var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var StudioAppWrapper = require('./StudioAppWrapper');
var CodeWorkspaceContainer = require('./CodeWorkspaceContainer');

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
    generateCodeWorkspaceHtml: React.PropTypes.func,
    codeWorkspace: React.PropTypes.element,
    // TODO - remove generateVisualizationColumnHtml once its used everywhere
    generateVisualizationColumnHtml: React.PropTypes.func,
    visualizationColumn: React.PropTypes.element,
    customProp: function (props, propName, componentName) {
      if (!props.generateVisualizationColumnHtml && !props.visualizationColumn) {
        return new Error('must pass either generateVisualizationColumnHtml or ' +
          'visualizationColumn to AppView');
      }

      if (!props.generateCodeWorkspaceHtml && !props.codeWorkspace) {
        return new Error('must pass either generateCodeWorkspaceHtml or ' +
          'codeWorkspace to AppView');
      }
    },
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
        <div id="visualizationColumn">
          {this.props.generateVisualizationColumnHtml && <ProtectedStatefulDiv
            contentFunction={this.props.generateVisualizationColumnHtml} />}
          {this.props.visualizationColumn}
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <CodeWorkspaceContainer
            topMargin={0}
            hidden={this.props.hideSource}
            noVisualization={this.props.noVisualization}
            isRtl={this.props.isRtl}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}
            codeWorkspace={this.props.codeWorkspace}/>
      </StudioAppWrapper>
    );
  }
});
module.exports = AppView;
