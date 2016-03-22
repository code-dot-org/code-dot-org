/** @file Top-level view for App Lab */
'use strict';

var connect = require('react-redux').connect;
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');

var styles = {
  // same as #codeWorkspace + #codeWorkspace.pin_bottom from common.scss, with
  // the exception fo left: 400, which we let media queries from applab/styles.scss
  // deal with
  codeWorkspace: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    marginLeft: 15,
    border: 'none',
    borderTop: '1px solid #ddd',
    overflow: 'hidden'
  },
  hidden: {
    display: 'none'
  }
};

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,

    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    var playSpaceHeader;
    if (!this.props.isReadOnlyWorkspace) {
      playSpaceHeader = <PlaySpaceHeader
          isEditingProject={this.props.isEditingProject}
          screenIds={this.props.screenIds}
          onViewDataButton={this.props.onViewDataButton}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    // TODO - changing id of codeWorkspace to codeWorkspaceApplab will break callouts and some UI tests
    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv id="codeWorkspace" style={styles.codeWorkspace} className="applab">
          <ProtectedStatefulDiv id="codeWorkspaceWrapper" contentFunction={this.props.generateCodeWorkspaceHtml}/>
          {!this.props.isReadOnlyWorkspace && <ProtectedStatefulDiv id="designWorkspace" style={styles.hidden} />}
        </ProtectedStatefulDiv>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace
  };
})(AppLabView);
