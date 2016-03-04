/** @file Top-level view for App Lab */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('./ConnectedStudioAppWrapper.jsx');

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isDesignModeHidden: React.PropTypes.bool.isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isReadOnlyView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isViewDataButtonHidden: React.PropTypes.bool.isRequired,

    startInDesignMode: React.PropTypes.bool.isRequired,
    activeScreenId: React.PropTypes.string,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    var playSpaceHeader;
    if (!this.props.isReadOnlyView) {
      playSpaceHeader = <PlaySpaceHeader
          hideToggle={this.shouldHideToggle()}
          hideViewDataButton={this.shouldHideViewDataButton()}
          startInDesignMode={this.props.startInDesignMode}
          activeScreenId={this.props.activeScreenId}
          screenIds={this.props.screenIds}
          onDesignModeButton={this.props.onDesignModeButton}
          onCodeModeButton={this.props.onCodeModeButton}
          onViewDataButton={this.props.onViewDataButton}
          onScreenChange={this.props.onScreenChange}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    return (
      <ConnectedStudioAppWrapper
          isEmbedView={this.props.isEmbedView}
          isShareView={this.props.isShareView}>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv renderContents={this.props.renderVisualizationColumn} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv
            id="codeWorkspace"
            renderContents={this.props.renderCodeWorkspace} />
      </ConnectedStudioAppWrapper>
    );
  },

  shouldHideToggle: function () {
    return this.props.isShareView || this.props.isDesignModeHidden;
  },

  shouldHideViewDataButton: function () {
    return this.props.isViewDataButtonHidden ||
        this.props.isDesignModeHidden ||
        this.props.isShareView ||
        !this.props.isEditingProject;
  }
});
module.exports = AppLabView;
