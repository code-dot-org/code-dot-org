/** @file Top-level view for App Lab */
'use strict';

var _ = require('../lodash');
var connect = require('react-redux').connect;
var actions = require('./actions');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper');
var TopInstructions = require('../templates/instructions/TopInstructions');
var CodeWorkspaceContainer = require('../templates/CodeWorkspaceContainer');
var utils = require('../utils');
var styleConstants = require('../styleConstants');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    instructionsMarkdown: React.PropTypes.string,
    instructionsCollapsed: React.PropTypes.bool.isRequired,
    instructionsHeight: React.PropTypes.number.isRequired,

    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  getInitialState() {
    // only used so that we can rerender when resized
    return {
      width: undefined,
      height: undefined
    };
  },

  onResize: function () {
    this.setState({
      width: $(window).width(),
      height: $(window).height()
    });
  },

  componentDidMount: function () {
    this.props.onMount();
    var top = this.refs.topInstructions;
    var child = top.refs.instructions;
    // TODO  onResize
    // var instructionsHeight = $(ReactDOM.findDOMNode(child)).height();
    // if (instructionsHeight < this.props.instructionsHeight - HEADER_HEIGHT - 13) {
    //   this.props.setInstructionsHeight(instructionsHeight + HEADER_HEIGHT + 13);
    // }

    window.addEventListener('resize', this.onResize);
  },

  componentWillUnmount: function () {
    window.removeEventListener("resize", this.onResize);
  },

  /**
   * @returns {number} How much vertical space is consumed by the TopInstructions
   */
  topPaneHeight: function () {
    // instructionsHeight represents the height of the TopInstructions if displayed
    // and not collapsed
    var height = this.props.instructionsHeight;

    // If collapsed, we only use display instructions header
    if (this.props.instructionsCollapsed) {
      height = HEADER_HEIGHT;
    }

    // Or we may not display the instructions pane at all
    if (!this.props.instructionsInTopPane) {
      height = 0;
    }

    return height;
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

    // 150 is min editor size
    // 120 is min debugger size
    var maxHeight = $("#codeApp").height() - 150 - 120;
    // console.log(this.topPaneHeight(), maxHeight);
    // var topPaneHeight = Math.min(this.topPaneHeight(), maxHeight);
    var topPaneHeight = this.topPaneHeight();
    var codeWorkspaceContainerStyle = {
      top: topPaneHeight
    };
    // maxHeight is at least current height
    maxHeight = Math.max(maxHeight, topPaneHeight);
    console.log('ALV:', maxHeight, topPaneHeight);

    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        {this.props.instructionsInTopPane && <TopInstructions
          ref="topInstructions"
          isEmbedView={this.props.isEmbedView}
          puzzleNumber={this.props.puzzleNumber}
          stageTotal={this.props.stageTotal}
          height={topPaneHeight}
          maxHeight={maxHeight}
          markdown={this.props.instructionsMarkdown}
          collapsed={this.props.instructionsCollapsed}
          onToggleCollapsed={this.props.toggleInstructionsCollapsed}
          onChangeHeight={this.props.setInstructionsHeight}/>
        }
        <CodeWorkspaceContainer
            topMargin={topPaneHeight}
            isRtl={false}
            noVisualization={false}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}
            onSizeChange={utils.fireResizeEvent}/>
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.level.isReadOnlyWorkspace,
    instructionsInTopPane: state.level.instructionsInTopPane,
    instructionsMarkdown: state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.level.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    isEmbedView: state.level.isEmbedView,
    puzzleNumber: state.level.puzzleNumber,
    stageTotal: state.level.stageTotal
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed: function () {
      dispatch(actions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight: function (height) {
      dispatch(actions.setInstructionsHeight(height));
    }
  };
}
)(AppLabView);
