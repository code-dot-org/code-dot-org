'use strict';

var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var StudioAppWrapper = require('./StudioAppWrapper');
var CodeWorkspaceContainer = require('./CodeWorkspaceContainer');
var connect = require('react-redux').connect;

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,

    // not provided by redux
    noVisualization: React.PropTypes.bool,
    visualizationColumn: React.PropTypes.element,
    onMount: React.PropTypes.func.isRequired,
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <StudioAppWrapper>
        <div id="visualizationColumn">
          {this.props.visualizationColumn}
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <CodeWorkspaceContainer
            topMargin={0}
            hidden={this.props.hideSource}
            noVisualization={!!this.props.noVisualization}
            isRtl={this.props.isRtl}
        />
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    isEmbedView: state.pageConstants.isEmbedView,
    isShareView: state.pageConstants.isShareView,
    hideSource: state.pageConstants.hideSource,
    isRtl: state.pageConstants.localeDirection === 'rtl'
  };
})(AppView);
