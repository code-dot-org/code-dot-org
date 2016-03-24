/** @file Top-level view for App Lab */
'use strict';

var _ = require('lodash');
var connect = require('react-redux').connect;
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper.jsx');
var TopInstructions = require('../templates/instructions/TopInstructions.jsx');
var HeightResizer = require('../templates/instructions/HeightResizer.jsx');

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

    // TODO - have this change as we drag grippy
    var instructionHeight = 200;

    var codeWorkspaceStyle = _.assign({}, styles.codeWorkspace, {
      top: instructionHeight + styles.resizer.height
    });

    var resizerStyle = _.assign({}, styles.resizer, {
      top: instructionHeight
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
            height={instructionHeight}
            markdown={this.props.instructionsMarkdown}/>
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
    instructionsMarkdown: state.level.instructionsMarkdown
  };
})(AppLabView);
