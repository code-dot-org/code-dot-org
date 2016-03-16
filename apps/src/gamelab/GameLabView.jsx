/** @file Top-level view for GameLab */
'use strict';

var AnimationTab = require('./AnimationTab.jsx');
var connect = require('react-redux').connect;
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
var GameLabVisualizationHeader = require('./GameLabVisualizationHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');

/**
 * Top-level React wrapper for GameLab
 */
var GameLabView = React.createClass({
  propTypes: {
    interfaceMode: React.PropTypes.bool.isRequired,
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
      <ConnectedStudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
      </ConnectedStudioAppWrapper>
    );
  },

  renderCodeMode: function () {
    // Code mode contains protected (non-React) content.  We have to always
    // render it, so when we're not in code mode use CSS to hide it.
    var codeModeStyle = {};
    if (this.props.interfaceMode !== GameLabInterfaceMode.CODE) {
      codeModeStyle.display = 'none';
    }

    return (
      <div style={codeModeStyle}>
        <div id="visualizationColumn">
          {this.shouldShowHeader() && <GameLabVisualizationHeader/>}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv id="codeWorkspace">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" contentFunction={this.props.generateCodeWorkspaceHtml}/>
        </ProtectedStatefulDiv>
      </div>
    );
  },

  renderAnimationMode: function () {
    return this.props.interfaceMode === GameLabInterfaceMode.ANIMATION ?
        <AnimationTab/> :
        undefined;
  },

  shouldShowHeader: function () {
    return !(this.props.isEmbedView || this.props.isShareView);
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    interfaceMode: state.interfaceMode,
    isEmbedView: state.level.isEmbedView,
    isShareView: state.level.isShareView
  };
})(GameLabView);
