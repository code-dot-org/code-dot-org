'use strict';

var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('./StudioAppWrapper.jsx');

var styles = {
  codeWorkspace: {
    position: 'absolute',
    top: 0,
    right: 0,
    // left is controlled by CSS rules
    bottom: 0,
    marginLeft: 15,
    border: '1px solid #ddd',
    overflow: 'hidden',
  },
  codeWorkspaceRTL: {
    // right is controlled by CSS rules
    left: 0,
    marginRight: 15,
    marginLeft: 0
  }
};

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
    var isRTL = !!document.querySelector('html[dir="rtl"]');

    var codeWorkspaceStyle = _.assign({}, styles.codeWorkspace,
      isRTL && styles.codeWorkspaceRTL);
    return (
      <StudioAppWrapper
          assetUrl={this.props.assetUrl}
          isEmbedView={this.props.isEmbedView}
          isShareView={this.props.isShareView}>
        <ProtectedStatefulDiv
            id="visualizationColumn"
            contentFunction={this.props.generateVisualizationColumnHtml} />
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv style={codeWorkspaceStyle} id="codeWorkspace" className="editor-column">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" contentFunction={this.props.generateCodeWorkspaceHtml}/>
        </ProtectedStatefulDiv>
      </StudioAppWrapper>
    );
  }
});
module.exports = AppView;
