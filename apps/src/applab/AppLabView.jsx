'use strict';

var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('../templates/StudioAppWrapper.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppLabView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isReadOnlyView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
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
          {!this.props.isReadOnlyView && <ProtectedStatefulDiv id="designToggleRow" />}
          <ProtectedStatefulDiv renderContents={this.props.renderVisualizationColumn} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv
            id="codeWorkspace"
            renderContents={this.props.renderCodeWorkspace} />
      </StudioAppWrapper>
    );
  }
});
module.exports = AppLabView;
