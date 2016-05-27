var connect = require('react-redux').connect;
var utils = require('../../utils');
var styleConstants = require('../../styleConstants');
var CodeWorkspaceContainer = require('../CodeWorkspaceContainer');
var TopInstructions = require('./TopInstructions');
var instructions = require('../../redux/instructions');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];

/**
 * A component representing the right side of the screen in our app. In particular
 * it has instructions in the top pane (unless disabled), a resizer, and then
 * our code workspace component
 */
var InstructionsWithWorkspace = React.createClass({
  propTypes: {
    // props provided via connect
    showInstructions: React.PropTypes.bool.isRequired,
    instructionsCollapsed: React.PropTypes.bool.isRequired,
    instructionsHeight: React.PropTypes.number.isRequired,
    instructionsMaxHeight: React.PropTypes.number.isRequired,
    setInstructionsHeight: React.PropTypes.func.isRequired,
    setInstructionsMaxHeight: React.PropTypes.func.isRequired,

    shortInstructionsWhenCollapsed: React.PropTypes.bool,
    // TODO - properly pass these to top instructions
    isRtl: React.PropTypes.bool.isRequired,
    noVisualization: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    // only used so that we can rerender when resized
    return {
      windowWidth: undefined,
      windowHeight: undefined
    };
  },

  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustTopPaneHeight as our maxHeight may need adjusting.
   */
  onResize() {
    // No need to resize anything if we're collapsed
    if (this.props.instructionsCollapsed) {
      return;
    }

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
  adjustTopPaneHeight() {
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
    var codeWorkspaceHeight = this.refs.codeWorkspaceContainer.getWrappedInstance()
      .getRenderedHeight();
    if (codeWorkspaceHeight === 0) {
      // We haven't initialized the codeWorkspace yet. Don't do any adjusting
      return;
    }

    var totalHeight = topPaneHeight + codeWorkspaceHeight;
    var instructionsContentHeight = this.refs.topInstructions.getRenderedHeight();

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
   * @returns {number} How much vertical space is consumed by the TopInstructions,
   *   including space for any resizer
   */
  topPaneHeight() {
    // We may not display the instructions pane at all
    if (!this.props.showInstructions) {
      return 0;
    }

    // instructionsHeight represents the height of the TopInstructions if displayed
    // and not collapsed
    var height = this.props.instructionsHeight;

    // If collapsed, we only use display instructions header
    if (this.props.instructionsCollapsed) {
      height = this.refs.topInstructions.getCollapsedHeight();
    }

    return height;
  },

  componentDidMount() {
    if (!this.props.showInstructions) {
      return;
    }

    this.adjustTopPaneHeight();
    window.addEventListener('resize', this.onResize);
  },

  componentWillUnmount() {
    if (this.props.showInstructions) {
      window.removeEventListener("resize", this.onResize);
    }
  },

  render() {
    const topPaneHeight = this.topPaneHeight();

    return (
      <span>
        {this.props.showInstructions && <TopInstructions
            ref="topInstructions"
            shortInstructionsWhenCollapsed={!!this.props.shortInstructionsWhenCollapsed}
            height={topPaneHeight}
            onResize={this.adjustTopPaneHeight}/>
        }
        <CodeWorkspaceContainer
            ref="codeWorkspaceContainer"
            topMargin={topPaneHeight}
            onSizeChange={utils.fireResizeEvent}/>
      </span>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    showInstructions: state.pageConstants.instructionsInTopPane && !!state.pageConstants.instructionsMarkdown,
    instructionsCollapsed: state.instructions.collapsed || !state.pageConstants.instructionsInTopPane,
    instructionsHeight: state.instructions.height,
    instructionsMaxHeight: state.instructions.maxHeight,
    isRtl: state.pageConstants.localeDirection === 'rtl',
    noVisualization: !!state.pageConstants.noVisualization
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
})(InstructionsWithWorkspace);
