import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import ThreeColumns from './ThreeColumns';
import {Z_INDEX as OVERLAY_Z_INDEX} from '../Overlay';
import {levenshtein} from '../../utils';
import {getOuterHeight} from './utils';
import debounce from 'lodash/debounce';
import styleConstants from '../../styleConstants';
import InstructionsCsfLeftCol from './InstructionsCsfLeftCol';
import InstructionsCsfRightCol from './InstructionsCsfRightCol';
import InstructionsCsfMiddleCol from './InstructionsCsfMiddleCol';

var instructions = require('../../redux/instructions');

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

// Minecraft-specific styles
const craftStyles = {
  body: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464'
  }
};

/**
 * InstructionsCSF is made up of 3 ThreeColumns:
 * Left column: displays an avatar and a lightbulb (if hints are available) used for requesting hints
 * Middle column: displays the chat bubble with either short or long instructions, hints (if available)
 * and feedback (if available)
 * Right column: displays an expand and collapse button (if instructions are expandable/collapsible)
 * and arrows for scrolling the middle column if it overflows the container

 * Why do we have width calculations?
 * The ThreeColumns component requires explicit widths of the left and right columns. We get these
 * widths by using callbacks setRightColWidth and setLeftColWidth. After the left and right columns render
 * or update, the widths are recalculated.

 * Why do we have height calculations?
 * The height calculations are used to determine how far the instructions resizer can be dragged
*/
class InstructionsCSF extends React.Component {
  static propTypes = {
    teacherViewingStudentWork: PropTypes.bool,
    handleClickCollapser: PropTypes.func,
    adjustMaxNeededHeight: PropTypes.func,
    overlayVisible: PropTypes.bool,
    isMinecraft: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool,
    hideOverlay: PropTypes.func.isRequired,
    isRtl: PropTypes.bool.isRequired,
    isEmbedView: PropTypes.bool,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string.isRequired,
        markdown: PropTypes.string.isRequired,
        block: PropTypes.object, // XML
        video: PropTypes.string
      })
    ).isRequired,
    collapsed: PropTypes.bool.isRequired,

    shortInstructions: PropTypes.string,
    longInstructions: PropTypes.string,

    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),

    height: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired
  };

  static defaultProps = {
    noVisualization: false
  };

  constructor(props) {
    super(props);

    this.state = {
      rightColWidth: 0,
      rightColHeight: 0,
      leftColWidth: 0,
      leftColHeight: 0,
      promptForHint: false,
      displayScrollButtons: true
    };

    this.debouncedCalculateRenderedHeight = debounce(
      this.calculateRenderedHeight,
      300
    );
  }

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    //Overlay is not needed when a teacher is viewing the students work
    if (this.props.teacherViewingStudentWork) {
      this.props.hideOverlay();
    }
  }

  /**
   * When collapsed, height can change when we get additional feedback
   * or the hint prompt. In that case, we want to always resize.
   * When in resize mode, height can get below min height iff we resize
   * the window to be super small.  If we then resize it to be larger
   * again, we want to increase height.
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const minHeight = this.getMinHeight(nextProps.collapsed);
    const newHeight = Math.min(nextProps.maxHeight, minHeight);

    const shouldUpdateHeight = nextProps.collapsed
      ? newHeight !== this.props.height
      : nextProps.height < minHeight && nextProps.height < nextProps.maxHeight;

    if (shouldUpdateHeight) {
      this.props.setInstructionsRenderedHeight(newHeight);
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const gotNewFeedback = !this.props.feedback && nextProps.feedback;
    if (gotNewFeedback) {
      this.setState({
        promptForHint: false
      });
      if (nextProps.collapsed) {
        this.props.handleClickCollapser();
      }
    }
  }

  componentDidUpdate() {
    this.setCanScrollInstructions();
    this.debouncedCalculateRenderedHeight();
    this.props.adjustMaxNeededHeight();
  }

  setCanScrollInstructions() {
    const contentContainer = this.getScrollTarget();
    const canScroll =
      contentContainer.scrollHeight > contentContainer.clientHeight;
    if (canScroll !== this.state.displayScrollButtons) {
      // see comment above
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        displayScrollButtons: canScroll
      });
    }
  }

  calculateRenderedHeight() {
    const minHeight = this.getMinHeight();
    const maxHeight = this.getMaxHeight();
    const heightOutOfBounds =
      this.props.height < minHeight || this.props.height > maxHeight;

    if (heightOutOfBounds) {
      const newHeight = Math.max(
        Math.min(this.props.height, maxHeight),
        minHeight
      );
      this.props.setInstructionsRenderedHeight(newHeight);
    }
  }

  /**
   * @param {boolean} collapsed whether or not the height should be
   * caluclated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The minimum height of the top instructions (which is just
   * the height of the little icon if we're not collapsed
   */
  getMinHeight(collapsed = this.props.collapsed) {
    const {leftColHeight, rightColHeight} = this.state;
    const middleColHeight = this.getMinInstructionsHeight(collapsed);

    return (
      Math.max(leftColHeight, middleColHeight, rightColHeight) +
      this.contentWrapperHeight()
    );
  }

  getMinInstructionsHeight = (collapsed = this.props.collapsed) => {
    if (collapsed || this.props.overlayVisible || this.props.isEmbedView) {
      return Math.min(this.getMiddleColHeight(), this.props.maxHeight);
    } else {
      return 0;
    }
  };

  getMarginsHeight() {
    return (
      getOuterHeight(this.instructionsCsfWrapper, true) -
      getOuterHeight(this.instructionsCsfWrapper, false)
    );
  }

  contentWrapperHeight() {
    return this.getMarginsHeight() + HEADER_HEIGHT + RESIZER_HEIGHT;
  }

  /**
   * @param {boolean} collapsed whether or not the height should be
   * calculated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The max height of the top instructions
   */
  getMaxHeight() {
    const {leftColHeight, rightColHeight} = this.state;
    return (
      Math.max(leftColHeight, this.getMiddleColHeight(), rightColHeight) +
      this.contentWrapperHeight()
    );
  }

  /**
   * @return {Element} scrollTarget
   */
  getScrollTarget = () => {
    return this.instructions.parentElement;
  };

  dismissHintPrompt = () => {
    this.setState({
      promptForHint: false
    });
  };

  shouldDisplayHintPrompt = () => {
    return this.state && this.state.promptForHint && !this.props.collapsed;
  };

  hasShortAndLongInstructions = () => {
    const shortInstructionsExist = !!this.props.shortInstructions;

    // In information theory, linguistics, and computer science, the Levenshtein distance
    // is a string metric for measuring the difference between two sequences.
    const dist = levenshtein(
      this.props.longInstructions,
      this.props.shortInstructions
    );

    // if the levenshtein distance between short and long instructions is <= 10
    // we consider the instructions to be equivalent
    const shortAndLongInstructionsAreEquivalent = dist <= 10;

    const hasValidShortInstructions =
      shortInstructionsExist && !shortAndLongInstructionsAreEquivalent;

    return hasValidShortInstructions && !!this.props.longInstructions;
  };

  requestHint = () => {
    this.setState({
      promptForHint: true
    });
    this.props.collapsed && this.props.handleClickCollapser();
  };

  // needed to set width for ThreeColumns
  setRightColWidth = width => {
    width !== this.state.rightColWidth &&
      this.setState({rightColWidth: width || 0});
  };

  // needed to set width for ThreeColumns
  setLeftColWidth = width => {
    width !== this.state.leftColWidth &&
      this.setState({leftColWidth: width || 0});
  };

  setRightColHeight = height => {
    height !== this.state.rightColHeight &&
      this.setState({rightColHeight: height || 0});
  };

  setLeftColHeight = height => {
    height !== this.state.leftColHeight &&
      this.setState({leftColHeight: height || 0});
  };

  getMiddleColHeight() {
    return this.instructions ? getOuterHeight(this.instructions, true) : 0;
  }

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height
      },
      this.props.noVisualization && styles.noViz,
      this.props.overlayVisible && styles.withOverlay
    ];

    const threeColumnsStyles = {
      container: [styles.body, this.props.isMinecraft && craftStyles.body],
      left: this.props.isRtl ? styles.leftColRtl : styles.leftCol
    };

    const hasShortAndLongInstructions = this.hasShortAndLongInstructions();

    return (
      <div
        style={mainStyle}
        ref={wrapper => (this.instructionsCsfWrapper = wrapper)}
      >
        <ThreeColumns
          styles={threeColumnsStyles}
          leftColWidth={this.state.leftColWidth}
          rightColWidth={this.state.rightColWidth}
          height={this.props.height - HEADER_HEIGHT - RESIZER_HEIGHT}
        >
          <InstructionsCsfLeftCol
            requestHint={this.requestHint}
            setColWidth={this.setLeftColWidth}
            setColHeight={this.setLeftColHeight}
          />
          <InstructionsCsfMiddleCol
            ref={instructions =>
              (this.instructions =
                instructions && instructions.getWrappedInstance().instructions)
            }
            dismissHintPrompt={this.dismissHintPrompt}
            shouldDisplayHintPrompt={this.shouldDisplayHintPrompt}
            adjustMaxNeededHeight={this.props.adjustMaxNeededHeight}
            promptForHint={this.state.promptForHint}
            getMinInstructionsHeight={this.getMinInstructionsHeight}
            hasShortAndLongInstructions={hasShortAndLongInstructions}
          />
          <InstructionsCsfRightCol
            promptForHint={this.state.promptForHint}
            displayScrollButtons={this.state.displayScrollButtons}
            getScrollTarget={this.getScrollTarget}
            handleClickCollapser={this.props.handleClickCollapser}
            setColWidth={this.setRightColWidth}
            setColHeight={this.setRightColHeight}
            shouldDisplayHintPrompt={this.shouldDisplayHintPrompt}
            hasShortAndLongInstructions={hasShortAndLongInstructions}
          />
        </ThreeColumns>
      </div>
    );
  }
}

const styles = {
  main: {
    position: 'relative',
    top: 0,
    right: 0
    // left handled by media queries for .editor-column
  },
  withOverlay: {
    zIndex: OVERLAY_Z_INDEX + 1
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: '#ddd',
    width: '100%'
  },
  leftCol: {
    position: 'absolute',
    bottom: HEADER_HEIGHT + RESIZER_HEIGHT,
    left: 0,
    marginLeft: 0
  },
  leftColRtl: {
    position: 'absolute',
    bottom: HEADER_HEIGHT + RESIZER_HEIGHT,
    right: 0,
    marginRight: 0
  }
};

export default connect(
  function propsFromStore(state) {
    return {
      overlayVisible: state.instructions.overlayVisible,
      isMinecraft: !!state.pageConstants.isMinecraft,
      isRtl: state.isRtl,
      noVisualization: state.pageConstants.noVisualization,
      feedback: state.instructions.feedback,
      collapsed: state.instructions.isCollapsed,
      hints: state.authoredHints.seenHints,
      height: state.instructions.renderedHeight,
      maxHeight: Math.min(
        state.instructions.maxAvailableHeight,
        state.instructions.maxNeededHeight
      ),
      shortInstructions: state.instructions.shortInstructions,
      longInstructions: state.instructions.longInstructions
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      hideOverlay: function() {
        dispatch(instructions.hideOverlay());
      },
      setInstructionsRenderedHeight(height) {
        dispatch(instructions.setInstructionsRenderedHeight(height));
      }
    };
  },
  null,
  {forwardRef: true}
)(Radium(InstructionsCSF));
