/** @file Top-level view for App Lab */
'use strict';

var _ = require('../lodash');
var connect = require('react-redux').connect;
var actions = require('./actions');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var ApplabVisualizationColumn = require('./ApplabVisualizationColumn');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper');
var TopInstructions = require('../templates/instructions/TopInstructions');
var CodeWorkspaceContainer = require('../templates/CodeWorkspaceContainer');
var utils = require('../utils');
var styleConstants = require('../styleConstants');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];

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
    onMount: React.PropTypes.func.isRequired
  },

  getInitialState() {
    // only used so that we can rerender when resized
    return {
      width: undefined,
      height: undefined
    };
  },

  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustTopPaneHeight as our maxHeight may need adjusting.
   */
  onResize: function () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    // We fire window resize events when the grippy is dragged so that non-React
    // controlled components are able to rerender the editor. If width/height
    // didn't change, we don't need to do anything else here
    if (windowWidth === this.state.windowWidth &&
        windowHeight === this.state.windowHeight) {
      return;
    }

    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });

    this.adjustTopPaneHeight();
  },

  /**
   * Adjust the height and maxHeight of our top pane based on the rendered size
   * of the instructions, and the rendered size of the workspace.
   * Our strategy in doing so is as follows:
   * The top pane should never be longer than the rendered height of the instructions
   * The workspace area has a minimum size, and we shouldn't allow the top pane
   * to grow enough to exceed this.
   * At small enough window sizes where we can't shrink enough to meet all of
   * our minimum sizes, shrink the debugger, editor, and instructions pane equally
   */
  adjustTopPaneHeight: function () {
    if (!this.props.instructionsInTopPane) {
      return;
    }

    // Have a preference for showing at least 150px of editor and 120px of
    // debugger. Shrink instructions to make room. If that doesn't provide
    // enough space, start also shrinking workspace
    var EDITOR_RESERVE = 150;
    var DEBUGGER_RESERVE = 120;
    var INSTRUCTIONS_RESERVE = 150;

    var topPaneHeight = this.props.instructionsHeight;
    var totalHeight = topPaneHeight + this.refs.codeWorkspace.getContentHeight();
    var instructionsContentHeight = this.refs.topInstructions.getContentHeight();

    // The max space we could use for our top pane if editor/debugger used
    // only the reserved amount of space.
    var topSpaceAvailable = totalHeight - EDITOR_RESERVE - DEBUGGER_RESERVE;

    // Dont want topPaneHeight to extend past rendered length of content.
    var maxHeight = instructionsContentHeight + HEADER_HEIGHT + RESIZER_HEIGHT;
    if (maxHeight < topPaneHeight) {
      topPaneHeight = maxHeight;
    }

    if (topSpaceAvailable < topPaneHeight) {
      // if we'll still be at least 150px, just make our topPaneHeight smaller
      if (topSpaceAvailable > INSTRUCTIONS_RESERVE) {
        topPaneHeight = topSpaceAvailable;
      } else {
        topPaneHeight = Math.round(totalHeight / 3);
      }
      maxHeight = topPaneHeight;
    } else if (topSpaceAvailable < maxHeight) {
      maxHeight = topSpaceAvailable;
    }
    this.props.setInstructionsHeight(Math.min(topPaneHeight, maxHeight));
    this.props.setInstructionsMaxHeight(maxHeight);
  },

  componentDidMount: function () {
    if (this.props.showInstructions) {
      this.adjustTopPaneHeight();

      window.addEventListener('resize', this.onResize);
    }

    this.props.onMount();
  },

  componentWillUnmount: function () {
    if (this.props.showInstructions) {
      window.removeEventListener("resize", this.onResize);
    }
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
    if (!this.props.showInstructions) {
      height = 0;
    }

    return height;
  },

  render: function () {
    var topPaneHeight = this.topPaneHeight();
    var codeWorkspaceContainerStyle = {
      top: topPaneHeight
    };

    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {!this.props.isReadOnlyWorkspace && <PlaySpaceHeader
              isEditingProject={this.props.isEditingProject}
              screenIds={this.props.screenIds}
              onViewDataButton={this.props.onViewDataButton}
              onScreenCreate={this.props.onScreenCreate} />
          }
          <ApplabVisualizationColumn
              isProjectLevel={this.props.isProjectLevel}
              isSubmittable={this.props.isSubmittable}
              isSubmitted={this.props.isSubmitted}/>
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        {this.props.showInstructions && <TopInstructions
            ref="topInstructions"
            isEmbedView={this.props.isEmbedView}
            puzzleNumber={this.props.puzzleNumber}
            stageTotal={this.props.stageTotal}
            height={topPaneHeight}
            maxHeight={this.props.instructionsMaxHeight}
            markdown={this.props.instructionsMarkdown}
            collapsed={this.props.instructionsCollapsed}
            onToggleCollapsed={this.props.toggleInstructionsCollapsed}
            onChangeHeight={this.props.setInstructionsHeight}
            onLoadImage={this.adjustTopPaneHeight}/>
        }
        <CodeWorkspaceContainer
            ref="codeWorkspace"
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
    showInstructions: state.level.instructionsInTopPane && !!state.level.instructionsMarkdown,
    instructionsMarkdown: state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.level.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    instructionsMaxHeight: state.instructions.maxHeight,
    isEmbedView: state.level.isEmbedView,
    isProjectLevel: state.level.isProjectLevel,
    isSubmittable: state.level.isSubmittable,
    isSubmitted: state.level.isSubmitted,
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
    },
    setInstructionsMaxHeight: function (maxHeight) {
      dispatch(actions.setInstructionsMaxHeight(maxHeight));
    }
  };
}
)(AppLabView);
