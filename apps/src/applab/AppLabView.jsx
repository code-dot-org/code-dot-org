'use strict';

var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('../templates/StudioAppWrapper.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppLabView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isDesignModeHidden: React.PropTypes.bool.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isReadOnlyView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,

    hideViewDataButton: React.PropTypes.bool.isRequired,
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
          hideToggle={this.props.isShareView || this.props.isDesignModeHidden}
          hideViewDataButton={this.props.hideViewDataButton}
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
      <StudioAppWrapper
          assetUrl={this.props.assetUrl}
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
      </StudioAppWrapper>
    );
  }
});
module.exports = AppLabView;
