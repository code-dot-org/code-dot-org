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

  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustHeights as our maxHeight may need adjusting.
   */
  onResize: function () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    // We fire window resize events when the grippy is dragged so that non-React
    // controlled components are able to rerender the editor. If width/height
    // didn't change, we don't need to do anything else here
    if (windowWidth === this.state.width && windowHeight === this.state.height) {
      return;
    }

    this.setState({
      width: $(window).width(),
      height: $(window).height()
    });

    this.adjustHeights();
  },

  /**
   * Adjust the height/maxHeight of our instructions based on the rendered size
   * of the instructions, and the rendered size of the workspace.
   */
  adjustHeights: function () {
    var instructionsContent = this.refs.topInstructions.refs.instructions.refs.instructionsMarkdown;
    var instructionsContentHeight = $(ReactDOM.findDOMNode(instructionsContent)).outerHeight(true);
    var workspaceHeight = $(ReactDOM.findDOMNode(this.refs.codeWorkspace)).height();
    var totalHeight = workspaceHeight + this.props.instructionsHeight;

    var height = this.props.instructionsHeight || 300;
    var maxHeight;

    // Dont want height to extend past rendered length of content.
    maxHeight = instructionsContentHeight + HEADER_HEIGHT + RESIZER_HEIGHT;
    if (maxHeight < height) {
      height = maxHeight;
    }

    // Have a preference for showing at least 150px of editor and 120px of
    // debugger. Shrink instructions to make room. If that doesn't provide
    // enough space, start also shrinking workspace
    var EDITOR_RESERVE = 150;
    var DEBUGGER_RESERVE = 120;
    var INSTRUCTIONS_RESERVE = 150;

    var topSpaceAvailable = totalHeight - EDITOR_RESERVE - DEBUGGER_RESERVE;
    if (topSpaceAvailable < height) {
      // if we'll still be at least 150px, just make our height smaller
      if (topSpaceAvailable > INSTRUCTIONS_RESERVE) {
        height = topSpaceAvailable;
      } else {
        height = Math.round(totalHeight / 3);
      }
      maxHeight = height;
    } else if (topSpaceAvailable < maxHeight) {
      maxHeight = topSpaceAvailable;
    }
    this.props.setInstructionsHeight(Math.min(height, maxHeight));
    this.props.setInstructionsMaxHeight(maxHeight);
  },

  componentDidMount: function () {
    this.adjustHeights();

    // Image loading can change the size of our instructions. Call adjustHeights
    // so that our maxHeight is updated appropriately.
    var dom = ReactDOM.findDOMNode(this.refs.topInstructions);
    $(dom).find('img').load(function () {
      this.adjustHeights();
    }.bind(this));

    this.props.onMount();
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

    var topPaneHeight = this.topPaneHeight();
    var codeWorkspaceContainerStyle = {
      top: topPaneHeight
    };

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
            maxHeight={this.props.instructionsMaxHeight}
            markdown={this.props.instructionsMarkdown}
            collapsed={this.props.instructionsCollapsed}
            onToggleCollapsed={this.props.toggleInstructionsCollapsed}
            onChangeHeight={this.props.setInstructionsHeight}/>
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
    instructionsInTopPane: state.level.instructionsInTopPane,
    instructionsMarkdown: state.level.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.level.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    instructionsMaxHeight: state.instructions.maxHeight,
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
    },
    setInstructionsMaxHeight: function (maxHeight) {
      dispatch(actions.setInstructionsMaxHeight(maxHeight));
    }
  };
}
)(AppLabView);
