import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import ThreeColumns from './ThreeColumns';
import {Z_INDEX as OVERLAY_Z_INDEX} from '../Overlay';
import {levenshtein} from '../../utils';
import {getOuterHeight} from './utils';
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

  state = {
    rightColWidth: 0,
    rightColHeight: 0,
    leftColWidth: 0,
    leftColHeight: 0,
    middleColHeight: 0,
    promptForHint: false,
    displayScrollButtons: true
  };

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    //Overlay is not needed when a teacher is viewing the students work
    if (this.props.teacherViewingStudentWork) {
      this.props.hideOverlay();
    }

    // Might want to increase the size of our instructions after our icon image
    // has loaded, to make sure the image fits
    $(ReactDOM.findDOMNode(this.icon)).load(
      function() {
        const minHeight = this.getMinHeight();
        if (this.props.height < minHeight) {
          this.props.setInstructionsRenderedHeight(minHeight);
        }
      }.bind(this)
    );
  }

  /**
   * When collapsed, height can change when we get additional feedback
   * or the hint prompt. In that case, we want to always resize.
   * When in resize mode, height can get below min height iff we resize
   * the window to be super small.  If we then resize it to be larger
   * again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    const minHeight = this.getMinHeight(nextProps.collapsed);
    const newHeight = Math.min(nextProps.maxHeight, minHeight);

    const shouldUpdateHeight = nextProps.collapsed
      ? newHeight !== this.props.height
      : nextProps.height < minHeight && nextProps.height < nextProps.maxHeight;

    if (shouldUpdateHeight) {
      this.props.setInstructionsRenderedHeight(newHeight);
    }
  }

  componentWillUpdate(nextProps) {
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
    this.calculateRenderedHeight();
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
    const domNode = $(ReactDOM.findDOMNode(this));
    return domNode.outerHeight(true) - domNode.outerHeight(false);
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

  hasShortInstructions = () => {
    return (
      !!this.props.shortInstructions &&
      !this.shortAndLongInstructionsAreEquivalent()
    );
  };

  shortAndLongInstructionsAreEquivalent() {
    if (!this.props.shortInstructions || !this.props.longInstructions) {
      return false;
    }
    const dist = levenshtein(
      this.props.longInstructions,
      this.props.shortInstructions
    );
    return dist <= 10;
  }

  requestHint = () => {
    this.setState({
      promptForHint: true
    });
    this.props.collapsed && this.props.handleClickCollapser();
  };

  setRightColWidth = width => {
    width !== this.state.rightColWidth &&
      this.setState({rightColWidth: width || 0});
  };

  setRightColHeight = height => {
    height !== this.state.rightColHeight &&
      this.setState({rightColHeight: height || 0});
  };

  setLeftColWidth = width => {
    width !== this.state.leftColWidth &&
      this.setState({leftColWidth: width || 0});
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

    const hasShortInstructions = this.hasShortInstructions();

    return (
      <div style={mainStyle}>
        <ThreeColumns
          styles={{
            container: [
              styles.body,
              this.props.isMinecraft && craftStyles.body
            ],
            left: this.props.isRtl ? styles.leftColRtl : styles.leftCol
          }}
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
            hasShortInstructions={hasShortInstructions}
            adjustMaxNeededHeight={this.props.adjustMaxNeededHeight}
            promptForHint={this.state.promptForHint}
            getMinInstructionsHeight={this.getMinInstructionsHeight}
          />
          <InstructionsCsfRightCol
            hasShortInstructions={hasShortInstructions}
            promptForHint={this.state.promptForHint}
            displayScrollButtons={this.state.displayScrollButtons}
            getScrollTarget={this.getScrollTarget}
            handleClickCollapser={this.props.handleClickCollapser}
            setColWidth={this.setRightColWidth}
            setColHeight={this.setRightColHeight}
            shouldDisplayHintPrompt={this.shouldDisplayHintPrompt}
          />
        </ThreeColumns>
      </div>
    );
  }
}

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
  {withRef: true}
)(Radium(InstructionsCSF));
