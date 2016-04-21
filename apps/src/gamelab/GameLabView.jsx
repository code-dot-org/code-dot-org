/** @file Top-level view for GameLab */
'use strict';

var _ = require('../lodash');
var AnimationTab = require('./AnimationTab/index');
var instructions = require('../redux/instructions');
var connect = require('react-redux').connect;
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper');
var TopInstructions = require('../templates/instructions/TopInstructions');
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;
var GameLabVisualizationHeader = require('./GameLabVisualizationHeader');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var CodeWorkspaceContainer = require('../templates/CodeWorkspaceContainer');
var utils = require('../utils');
var styleConstants = require('../styleConstants');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];


/**
 * Top-level React wrapper for GameLab
 */
var GameLabView = React.createClass({
  propTypes: {
    interfaceMode: React.PropTypes.oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION]).isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    generateVisualizationColumnHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  // TODO - share code better
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
    if (!this.props.showInstructions) {
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
    var topInstructions = this.refs.topInstructions.getWrappedInstance();
    var instructionsContentHeight = topInstructions.getContentHeight();

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

  componentDidMount: function () {
    if (this.props.showInstructions) {
      this.adjustTopPaneHeight();

      window.addEventListener('resize', this.onResize);
    }

    this.props.onMount();
  },

  renderCodeMode: function () {
    var topPaneHeight = this.topPaneHeight();

    // Code mode contains protected (non-React) content.  We have to always
    // render it, so when we're not in code mode use CSS to hide it.
    var codeModeStyle = {};
    if (this.props.interfaceMode !== GameLabInterfaceMode.CODE) {
      codeModeStyle.display = 'none';
    }

    return (
      <div style={codeModeStyle}>
        <div id="visualizationColumn">
          {this.shouldShowHeader() && <GameLabVisualizationHeader />}
          <ProtectedStatefulDiv contentFunction={this.props.generateVisualizationColumnHtml} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        {this.props.showInstructions && <TopInstructions
            ref="topInstructions"
            height={topPaneHeight}
            onLoadImage={this.adjustTopPaneHeight}/>
        }
        <CodeWorkspaceContainer
            ref="codeWorkspace"
            topMargin={topPaneHeight}
            noVisualization={false}
            isRtl={false}
            generateCodeWorkspaceHtml={this.props.generateCodeWorkspaceHtml}
            onSizeChange={utils.fireResizeEvent}/>
      </div>
    );
  },

  renderAnimationMode: function () {
    return this.props.interfaceMode === GameLabInterfaceMode.ANIMATION ?
        <AnimationTab /> :
        undefined;
  },

  shouldShowHeader: function () {
    return !(this.props.isEmbedView || this.props.isShareView);
  },

  render: function () {
    return (
      <ConnectedStudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    interfaceMode: state.interfaceMode,
    isEmbedView: state.level.isEmbedView,
    isShareView: state.level.isShareView,
    showInstructions: state.level.instructionsInTopPane && !!state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.level.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    instructionsMaxHeight: state.instructions.maxHeight,
  };
}, function propsFromDispatch(dispatch) {
  return {
    setInstructionsHeight: function (height) {
      dispatch(instructions.setInstructionsHeight(height));
    },
    setInstructionsMaxHeight: function (maxHeight) {
      dispatch(instructions.setInstructionsMaxHeight(maxHeight));
    }
  };
})(GameLabView);
