/** @file Top-level view for App Lab */
'use strict';

var _ = require('lodash');
var connect = require('react-redux').connect;
var actions = require('./actions');
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var TopInstructions = require('../templates/instructions/TopInstructions.jsx');
var HeightResizer = require('../templates/instructions/HeightResizer.jsx');

// TODO - share with top instructions?
var HEADER_HEIGHT = 30;

var styles = {
  // same as #codeWorkspace + #codeWorkspace.pin_bottom from common.scss, with
  // the exception fo left: 400, which we let media queries from applab/styles.scss
  // deal with
  codeWorkspace: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginLeft: 15,
    border: 'none',
    borderTop: '1px solid #ddd',
    overflow: 'hidden',
    zIndex: 0
  },
  hidden: {
    display: 'none'
  },
  resizer: {
    position: 'absolute',
    height: 13, // TODO $resize-bar-width from style-constants
    right: 0
  }
};

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    instructionsMarkdown: React.PropTypes.string.isRequired,
    instructionsCollapsed: React.PropTypes.bool.isRequired,
    instructionsHeight: React.PropTypes.number.isRequired,

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

    var instructionsHeight = this.props.instructionsHeight;
    if (this.props.instructionsCollapsed) {
      instructionsHeight = HEADER_HEIGHT;
    }

    // TODO - have this change as we drag grippy
    // TODO - grippy should be hidden with collapse?
    var codeWorkspaceStyle = _.assign({}, styles.codeWorkspace, {
      top: instructionsHeight + styles.resizer.height
    });

    var resizerStyle = _.assign({}, styles.resizer, {
      top: instructionsHeight
    });

    // TODO - changing id of codeWorkspace to codeWorkspaceApplab will break callouts and some UI tests
    // TODO - could group rightSide into single component?
    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        <TopInstructions
            height={instructionsHeight}
            markdown={this.props.instructionsMarkdown}
            collapsed={this.props.instructionsCollapsed}
            onToggleCollapsed={this.props.toggleInstructionsCollapsed}/>
        <HeightResizer style={resizerStyle}/>
        <ProtectedStatefulDiv
            id="codeWorkspace"
            style={codeWorkspaceStyle}
            className="applab workspace-right">
          <ProtectedStatefulDiv
              id="codeWorkspaceWrapper"
              contentFunction={this.props.generateCodeWorkspaceHtml}/>
          {!this.props.isReadOnlyWorkspace &&
            <ProtectedStatefulDiv id="designWorkspace" style={styles.hidden} />}
        </ProtectedStatefulDiv>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace,
    instructionsMarkdown: state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed,
    instructionsHeight: state.instructions.height
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed: function () {
      dispatch(actions.toggleInstructionsCollapsed());
    }
  };
}
)(AppLabView);
