import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import {Z_INDEX as OVERLAY_Z_INDEX} from '../Overlay';
import {getOuterHeight, scrollTo} from './utils';
import {levenshtein} from '../../utils';
import styleConstants from '../../styleConstants';
import color from '../../util/color';
import HeightResizer from './HeightResizer';
import CSFContainedLevelInstructions from './CSFContainedLevelInstructions';
import ThreeColumns from './ThreeColumns';
import CSFInstructionsColumnOne from './CSFInstructionsColumnOne';
import CSFInstructionsColumnTwo from './CSFInstructionsColumnTwo';
import CSFInstructionsColumnThree from './CSFInstructionsColumnThree';

var instructions = require('../../redux/instructions');

const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon
const CONTAINED_LEVEL_PADDING = 10;
const MIN_CONTAINED_LEVEL_HEIGHT = 50;

// Minecraft-specific styles
const craftStyles = {
  body: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464'
  }
};

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0
    // left handled by media queries for .editor-column
  },
  mainRtl: {
    position: 'absolute',
    marginRight: 15,
    top: 0,
    left: 0
    // right handled by media queries for .editor-column
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
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    width: '100%'
  },
  leftCol: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginLeft: 0
  },
  leftColRtl: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: 0
  },
  embedView: {
    display: 'none'
  },
  heightResizer: {
    backgroundColor: color.background_gray
  }
};

class TopInstructions extends React.Component {
  static propTypes = {
    overlayVisible: PropTypes.bool,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string.isRequired,
        markdown: PropTypes.string.isRequired,
        block: PropTypes.object, // XML
        video: PropTypes.string
      })
    ).isRequired,
    hasUnseenHint: PropTypes.bool.isRequired,
    showNextHint: PropTypes.func.isRequired,
    hasContainedLevels: PropTypes.bool,
    isEmbedView: PropTypes.bool,
    isMinecraft: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    collapsed: PropTypes.bool.isRequired,
    shortInstructions: PropTypes.string,
    longInstructions: PropTypes.string,
    clearFeedback: PropTypes.func.isRequired,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),
    hasAuthoredHints: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    smallStaticAvatar: PropTypes.string,
    failureAvatar: PropTypes.string,
    noVisualization: PropTypes.bool,

    ttsShortInstructionsUrl: PropTypes.string,
    ttsLongInstructionsUrl: PropTypes.string,
    textToSpeechEnabled: PropTypes.bool,

    toggleInstructionsCollapsed: PropTypes.func.isRequired,
    setInstructionsHeight: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: PropTypes.func.isRequired
  };

  static defaultProps = {
    hasContainedLevels: false,
    isEmbedView: false,
    noVisualization: false
  };

  state = {
    rightColWidth: {
      collapsed: undefined,
      uncollapsed: undefined,
      empty: 10
    },
    promptForHint: false,
    displayScrollButtons: true
  };

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    window.addEventListener('resize', this.adjustMaxNeededHeight);

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

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));
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

  componentWillUpdate(nextProps, nextState) {
    const gotNewFeedback = !this.props.feedback && nextProps.feedback;
    if (gotNewFeedback) {
      this.setState({
        promptForHint: false
      });
      if (nextProps.collapsed) {
        this.handleClickCollapser();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.shouldDisplayCollapserButton() &&
      this.getRightColWidth() === undefined
    ) {
      // Update right col width now that we know how much space it needs, and
      // rerender if it has changed. One thing to note is that if we end up
      // resizing our column significantly, it can result in our maxNeededHeight
      // being inaccurate. This isn't that big a deal except that it means when we
      // adjust maxNeededHeight below, it might not be as large as we want.
      const width = $(ReactDOM.findDOMNode(this.collapser)).outerWidth(true);

      // setting state in componentDidUpdate will trigger another
      // re-render and is discouraged; unfortunately in this case we
      // can't do it earlier in the lifecycle as we need to examine the
      // actual DOM to determine the desired value. We are careful to
      // only actually update the state when it has changed, which will
      // prevent the possibility of an infinite loop and should serve to
      // minimize excess rerenders.
      let rightColWidth = Object.assign({}, this.state.rightColWidth);
      rightColWidth[this.getCurrentRightColWidthProperty()] = width;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({rightColWidth});
    }

    this.adjustMaxNeededHeight();

    if (this.instructions) {
      const contentContainer = this.instructions.parentElement;
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

    const gotNewHint = prevProps.hints.length !== this.props.hints.length;
    if (gotNewHint) {
      const images = ReactDOM.findDOMNode(
        this.instructions
      ).getElementsByTagName('img');
      for (let i = 0, image; (image = images[i]); i++) {
        image.onload = image.onload || this.scrollInstructionsToBottom;
      }
    }

    if (this.props.feedback || this.state.promptForHint || gotNewHint) {
      this.scrollInstructionsToBottom();
    }

    if (!this.props.collapsed && !prevProps.collapsed) {
      const minHeight = this.getMinHeight();
      const maxHeight = this.props.maxHeight;
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
  }

  /**
   * @param {boolean} collapsed whether or not the height should be
   * caluclated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The minimum height of the top instructions (which is just
   * the height of the little icon and the height of the resizer if we're not
   * collapsed
   */
  getMinHeight(collapsed = this.props.collapsed) {
    if (this.containedLevel) {
      return MIN_CONTAINED_LEVEL_HEIGHT;
    }
    const collapseButtonHeight = getOuterHeight(this.collapser, true);
    const scrollButtonsHeight =
      !collapsed && this.scrollButtons
        ? this.scrollButtons.getWrappedInstance().getMinHeight()
        : 0;

    const minIconHeight = this.icon ? getOuterHeight(this.icon, true) : 0;
    const minInstructionsHeight = this.props.collapsed
      ? getOuterHeight(this.instructions, true)
      : 0;

    const domNode = $(ReactDOM.findDOMNode(this));
    const margins = domNode.outerHeight(true) - domNode.outerHeight(false);

    const leftColHeight = minIconHeight;
    const middleColHeight = minInstructionsHeight;
    const rightColHeight = collapseButtonHeight + scrollButtonsHeight;

    // Only include resizer height if resizer is available
    const resizerHeight = collapsed ? 0 : RESIZER_HEIGHT;

    return (
      Math.max(leftColHeight, middleColHeight, rightColHeight) +
      resizerHeight +
      margins
    );
  }

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize = (delta = 0) => {
    const minHeight = this.getMinHeight();
    const currentHeight = this.props.height;

    let newHeight = Math.max(minHeight, currentHeight + delta);
    if (this.containedLevel) {
      const maxContainedLevelHeight =
        getOuterHeight(this.containedLevel, true) +
        RESIZER_HEIGHT +
        CONTAINED_LEVEL_PADDING;
      newHeight = Math.min(newHeight, maxContainedLevelHeight);
    } else {
      newHeight = Math.min(newHeight, this.props.maxHeight);
    }

    this.props.setInstructionsRenderedHeight(newHeight);
    return newHeight - currentHeight;
  };

  /**
   * Calculate how much height it would take to show top instructions with our
   * entire instructions visible and update store with this value.
   * @returns {number}
   */
  adjustMaxNeededHeight = () => {
    const minHeight = this.getMinHeight();
    const instructionsContent = this.instructions;
    const maxNeededHeight =
      (this.props.hasContainedLevels
        ? getOuterHeight(this.containedLevel, true) + CONTAINED_LEVEL_PADDING
        : getOuterHeight(instructionsContent, true)) +
      (this.props.collapsed ? 0 : RESIZER_HEIGHT);

    this.props.setInstructionsMaxHeightNeeded(
      Math.max(minHeight, maxNeededHeight)
    );
    return maxNeededHeight;
  };

  /**
   * Handle a click to our collapser icon by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser = () => {
    const nextCollapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (nextCollapsed) {
      this.props.setInstructionsRenderedHeight(
        this.getMinHeight(nextCollapsed)
      );
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  };

  /**
   * @return {Element} scrollTarget
   */
  getScrollTarget = () => {
    return this.instructions.parentElement;
  };

  /**
   * Manually scroll instructions to bottom. When we have multiple
   * elements in instructions, "bottom" is defined as 10 pixels above
   * the top of the bottommost element. This is so we don't scroll past
   * the beginning of a long element, and so we scroll to a position
   * such that you can see that there is an element above it which you
   * can scroll up to.
   */
  scrollInstructionsToBottom() {
    const instructions = this.instructions;
    if (!instructions) {
      // If we have a contained level instead of instructions, do nothing
      return;
    }
    const contentContainer = instructions.parentElement;
    if (instructions.children.length > 1) {
      const lastChild = instructions.children[instructions.children.length - 1];
      scrollTo(contentContainer, lastChild.offsetTop - 10);
    } else {
      scrollBy(contentContainer, contentContainer.scrollHeight);
    }
  }

  /**
   * Handle a click to the hint display bubble (lightbulb)
   */
  handleClickBubble = () => {
    // If we don't have authored hints to display, clicking bubble shouldnt do anything
    if (this.props.hasAuthoredHints && this.props.hasUnseenHint) {
      this.setState({
        promptForHint: true
      });
      if (this.props.collapsed) {
        this.handleClickCollapser();
      }
    }
  };

  setPromptForHintFalse = () => {
    this.setState({
      promptForHint: false
    });
  };

  shouldDisplayHintPrompt = () => {
    return this.state && this.state.promptForHint && !this.props.collapsed;
  };

  shouldDisplayCollapserButton = () => {
    // if we have "extra" (non-instruction) content, we should always
    // give the option of collapsing it
    if (
      this.props.hints.length ||
      this.shouldDisplayHintPrompt() ||
      this.props.feedback
    ) {
      return true;
    }

    // Otherwise, only show the button if we have two versions of
    // instruction we want to toggle between
    return this.props.longInstructions && !this.shouldIgnoreShortInstructions();
  };

  shouldIgnoreShortInstructions = () => {
    // If we have no short instructions, always ignore them.
    if (!this.props.shortInstructions) {
      return true;
    }

    // Otherwise, if we have no long instructions, never ignore the short ones.
    // Note that we would only decide to ignore short instructions in
    // the absense of long instructions when the short instructions
    // themselves were less than 10 characters, which can easily happen
    // in ideo- or logographic languages.
    if (!this.props.longInstructions) {
      return false;
    }

    // if short instructions and long instructions have a Levenshtein
    // Edit Distance of less than or equal to 10, ignore short
    // instructions and only show long.
    let dist = levenshtein(
      this.props.longInstructions,
      this.props.shortInstructions
    );
    return dist <= 10;
  };

  getAvatar = () => {
    // Show the "sad" avatar if there is failure feedback. Otherwise,
    // show the default avatar.
    return this.props.feedback && this.props.feedback.isFailure
      ? this.props.failureAvatar
      : this.props.smallStaticAvatar;
  };

  /**
   * this.state.rightColWidth contains three key/value pairs, reflecting the
   * three different possible states for the right column content. This simple
   * helper method returns the key corresponding to our current state.
   *
   * @returns {string} the key to this.state.rightColWidth which represents our
   *          current state
   */
  getCurrentRightColWidthProperty() {
    if (this.shouldDisplayCollapserButton()) {
      return this.props.collapsed ? 'collapsed' : 'uncollapsed';
    } else {
      return 'empty';
    }
  }

  getRightColWidth() {
    return this.state.rightColWidth[this.getCurrentRightColWidthProperty()];
  }

  setContainedLevelRef = ref => {
    this.containedLevel = ref;
  };

  setIconRef = ref => {
    this.icon = ref;
  };

  setInstructionsRef = ref => {
    this.instructions = ref;
  };

  setCollapserRef = ref => {
    this.collapser = ref;
  };

  setScrollButtonsRef = ref => {
    this.scrollButtons = ref;
  };

  shouldDisplayShortInstructions = () => {
    return (
      !this.shouldIgnoreShortInstructions() &&
      (this.props.collapsed || !this.props.longInstructions)
    );
  };

  render() {
    const resizerHeight = this.props.collapsed ? 0 : RESIZER_HEIGHT;
    const topInstructionsHeight = this.props.height - resizerHeight;

    const mainStyle = [
      this.props.isRtl ? styles.mainRtl : styles.main,
      {
        height: topInstructionsHeight
      },
      this.props.isEmbedView && styles.embedView,
      this.props.noVisualization && styles.noViz,
      this.props.overlayVisible && styles.withOverlay
    ];

    const markdown = this.shouldDisplayShortInstructions()
      ? this.props.shortInstructions
      : this.props.longInstructions;

    const ttsUrl = this.shouldDisplayShortInstructions()
      ? this.props.ttsShortInstructionsUrl
      : this.props.ttsLongInstructionsUrl;

    if (this.props.hasContainedLevels) {
      return (
        <div style={mainStyle} className="editor-column">
          <CSFContainedLevelInstructions
            showAudioControls={this.props.textToSpeechEnabled && ttsUrl}
            topInstructionsHeight={topInstructionsHeight}
            containedLevel={this.setContainedLevelRef}
          />
          {!this.props.collapsed && !this.props.isEmbedView && (
            <HeightResizer
              position={this.props.height}
              onResize={this.handleHeightResize}
              style={styles.heightResizer}
            />
          )}
        </div>
      );
    }

    const leftColWidth =
      (this.getAvatar() ? PROMPT_ICON_WIDTH : 10) +
      (this.props.hasAuthoredHints ? AUTHORED_HINTS_EXTRA_WIDTH : 0);

    return (
      <div style={mainStyle} className="editor-column">
        <ThreeColumns
          styles={{
            container: [
              styles.body,
              this.props.isMinecraft && craftStyles.body
            ],
            left: this.props.isRtl ? styles.leftColRtl : styles.leftCol
          }}
          leftColWidth={leftColWidth}
          rightColWidth={this.getRightColWidth() || 0}
          height={this.props.height - resizerHeight}
        >
          <CSFInstructionsColumnOne
            getAvatar={this.getAvatar}
            handleClickBubble={this.handleClickBubble}
            iconRef={this.setIconRef}
          />
          <CSFInstructionsColumnTwo
            markdown={markdown}
            ttsUrl={ttsUrl}
            adjustMaxNeededHeight={this.adjustMaxNeededHeight}
            shouldDisplayHintPrompt={this.shouldDisplayHintPrompt}
            instructions={this.setInstructionsRef}
            setPromptForHintFalse={this.setPromptForHintFalse}
            showNextHint={this.props.showNextHint}
            clearFeedback={this.props.clearFeedback}
          />
          <CSFInstructionsColumnThree
            shouldDisplayCollapserButton={this.shouldDisplayCollapserButton}
            handleClickCollapser={this.handleClickCollapser}
            instructions={this.setInstructionsRef}
            collapser={this.setCollapserRef}
            scrollButtons={this.setScrollButtonsRef}
            displayScrollButtons={this.state.displayScrollButtons}
            resizerHeight={resizerHeight}
            getScrollTarget={this.getScrollTarget}
          />
        </ThreeColumns>
        {!this.props.collapsed && !this.props.isEmbedView && (
          <HeightResizer
            position={this.props.height}
            onResize={this.handleHeightResize}
          />
        )}
      </div>
    );
  }
}

module.exports = connect(
  function propsFromStore(state) {
    return {
      overlayVisible: state.instructions.overlayVisible,
      ttsShortInstructionsUrl: state.pageConstants.ttsShortInstructionsUrl,
      ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl,
      hasContainedLevels: state.pageConstants.hasContainedLevels,
      hints: state.authoredHints.seenHints,
      hasUnseenHint: state.authoredHints.unseenHints.length > 0,
      showNextHint: state.pageConstants.showNextHint,
      isEmbedView: state.pageConstants.isEmbedView,
      isMinecraft: !!state.pageConstants.isMinecraft,
      height: state.instructions.renderedHeight,
      expandedHeight: state.instructions.expandedHeight,
      maxHeight: Math.min(
        state.instructions.maxAvailableHeight,
        state.instructions.maxNeededHeight
      ),
      collapsed: state.instructions.collapsed,
      shortInstructions: state.instructions.shortInstructions,
      longInstructions: state.instructions.longInstructions,
      hasAuthoredHints: state.instructions.hasAuthoredHints,
      feedback: state.instructions.feedback,
      isRtl: state.isRtl,
      smallStaticAvatar: state.pageConstants.smallStaticAvatar,
      failureAvatar: state.pageConstants.failureAvatar,
      noVisualization: state.pageConstants.noVisualization,
      textToSpeechEnabled:
        state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      toggleInstructionsCollapsed: function() {
        dispatch(instructions.toggleInstructionsCollapsed());
      },
      setInstructionsHeight: function(height) {
        dispatch(instructions.setInstructionsHeight(height));
      },
      setInstructionsRenderedHeight(height) {
        dispatch(instructions.setInstructionsRenderedHeight(height));
      },
      setInstructionsMaxHeightNeeded(height) {
        dispatch(instructions.setInstructionsMaxHeightNeeded(height));
      },
      clearFeedback(height) {
        dispatch(instructions.setFeedback(null));
      }
    };
  },
  null,
  {withRef: true}
)(Radium(TopInstructions));
