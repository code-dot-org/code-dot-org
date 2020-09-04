import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import classNames from 'classnames';
import {connect} from 'react-redux';
import CollapserButton from './CollapserButton';
import ScrollButtons from './ScrollButtons';
import ThreeColumns from './ThreeColumns';
import PromptIcon from './PromptIcon';
import HintDisplayLightbulb from '../HintDisplayLightbulb';
import HintPrompt from './HintPrompt';
import InlineFeedback from './InlineFeedback';
import InlineHint from './InlineHint';
import ChatBubble from './ChatBubble';
import LegacyButton from '../LegacyButton';
import {Z_INDEX as OVERLAY_Z_INDEX} from '../Overlay';
import i18n from '@cdo/locale';
import SafeMarkdown from '../SafeMarkdown';
import {getOuterHeight, scrollTo, shouldDisplayChatTips} from './utils';
import {levenshtein} from '../../utils';
import color from '../../util/color';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import styleConstants from '../../styleConstants';

var instructions = require('../../redux/instructions');

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon

// Minecraft-specific styles
const craftStyles = {
  body: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464'
  },
  collapserButton: {
    padding: 5,
    marginBottom: 0
  },
  scrollButtons: {
    left: 38
  },
  scrollButtonsRtl: {
    right: 38
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
  },
  collapserButton: {
    position: 'absolute',
    right: 0,
    marginTop: 5,
    marginRight: 5
  },
  scrollButtons: {
    position: 'relative',
    top: 50,
    left: 25
  },
  scrollButtonsRtl: {
    position: 'relative',
    top: 50,
    right: 25
  },
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default',
    marginBottom: 0
  },
  authoredHints: {
    // raise by 20 so that the lightbulb "floats" without causing the original
    // icon to move. This strangeness happens in part because prompt-icon-cell
    // is managed outside of React
    marginBottom: 0
  },
  instructions: {
    padding: '5px 0'
  },
  instructionsWithTips: {
    width: 'calc(100% - 20px)',
    float: 'right'
  },
  instructionsWithTipsRtl: {
    width: 'calc(100% - 20px)',
    float: 'left'
  }
};

class InstructionsCSF extends React.Component {
  static propTypes = {
    teacherViewingStudentWork: PropTypes.bool,
    handleClickCollapser: PropTypes.func,
    adjustMaxNeededHeight: PropTypes.func,
    overlayVisible: PropTypes.bool,
    skinId: PropTypes.string,
    isMinecraft: PropTypes.bool.isRequired,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    noVisualization: PropTypes.bool,
    hideOverlay: PropTypes.func.isRequired,
    aniGifURL: PropTypes.string,
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
    hasUnseenHint: PropTypes.bool.isRequired,
    showNextHint: PropTypes.func.isRequired,
    hasAuthoredHints: PropTypes.bool.isRequired,

    collapsed: PropTypes.bool.isRequired,

    shortInstructions: PropTypes.string,
    shortInstructions2: PropTypes.string,
    longInstructions: PropTypes.string,

    clearFeedback: PropTypes.func.isRequired,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),

    smallStaticAvatar: PropTypes.string,
    failureAvatar: PropTypes.string,

    ttsShortInstructionsUrl: PropTypes.string,
    ttsLongInstructionsUrl: PropTypes.string,

    height: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired
  };

  static defaultProps = {
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

    this.updateRightColumnWidth();
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
        this.props.handleClickCollapser();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateRightColumnWidth();

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

    this.props.adjustMaxNeededHeight();
  }

  updateRightColumnWidth = () => {
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
  };

  /**
   * @param {boolean} collapsed whether or not the height should be
   * caluclated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The minimum height of the top instructions (which is just
   * the height of the little icon if we're not collapsed
   */
  getMinHeight(collapsed = this.props.collapsed) {
    const collapseButtonHeight = getOuterHeight(this.collapser, true);
    const scrollButtonsHeight =
      !collapsed && this.scrollButtons
        ? this.scrollButtons.getWrappedInstance().getMinHeight()
        : 0;

    const minIconHeight = this.icon ? getOuterHeight(this.icon, true) : 0;
    const instructionsHeight = Math.min(
      getOuterHeight(this.instructions, true),
      this.props.maxHeight
    );
    const minInstructionsHeight =
      this.props.collapsed ||
      this.props.overlayVisible ||
      this.props.isEmbedView
        ? instructionsHeight
        : 0;

    const domNode = $(ReactDOM.findDOMNode(this));
    const margins = domNode.outerHeight(true) - domNode.outerHeight(false);

    const leftColHeight = minIconHeight;
    const middleColHeight = minInstructionsHeight;
    const rightColHeight = collapseButtonHeight + scrollButtonsHeight;
    return (
      Math.max(leftColHeight, middleColHeight, rightColHeight) +
      margins +
      HEADER_HEIGHT +
      RESIZER_HEIGHT
    );
  }

  /**
   * @param {boolean} collapsed whether or not the height should be
   * calculated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The max height of the top instructions
   */
  getMaxHeight(collapsed = this.props.collapsed) {
    const collapseButtonHeight = getOuterHeight(this.collapser, true);
    const scrollButtonsHeight =
      !collapsed && this.scrollButtons
        ? this.scrollButtons.getWrappedInstance().getMinHeight()
        : 0;

    const minIconHeight = this.icon ? getOuterHeight(this.icon, true) : 0;
    const instructionsHeight = getOuterHeight(this.instructions, true);

    const domNode = $(ReactDOM.findDOMNode(this));
    const margins = domNode.outerHeight(true) - domNode.outerHeight(false);

    const leftColHeight = minIconHeight;
    const middleColHeight = instructionsHeight;
    const rightColHeight = collapseButtonHeight + scrollButtonsHeight;
    return (
      Math.max(leftColHeight, middleColHeight, rightColHeight) +
      margins +
      HEADER_HEIGHT +
      RESIZER_HEIGHT
    );
  }

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
    if (instructions) {
      const contentContainer = instructions.parentElement;
      if (instructions.children.length > 1) {
        const lastChild =
          instructions.children[instructions.children.length - 1];
        scrollTo(contentContainer, lastChild.offsetTop - 10);
      } else {
        scrollBy(contentContainer, contentContainer.scrollHeight);
      }
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
        this.props.handleClickCollapser();
      }
    }
  };

  dismissHintPrompt = () => {
    this.setState({
      promptForHint: false
    });
  };

  showHint = () => {
    this.dismissHintPrompt();
    this.props.showNextHint();
    this.props.clearFeedback();
  };

  shouldDisplayHintPrompt() {
    return this.state && this.state.promptForHint && !this.props.collapsed;
  }

  shouldDisplayCollapserButton() {
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
  }

  shouldIgnoreShortInstructions() {
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
  }

  shouldDisplayShortInstructions() {
    return (
      !this.shouldIgnoreShortInstructions() &&
      (this.props.collapsed || !this.props.longInstructions)
    );
  }

  getAvatar() {
    // Show the "sad" avatar if there is failure feedback. Otherwise,
    // show the default avatar.
    return this.props.feedback && this.props.feedback.isFailure
      ? this.props.failureAvatar
      : this.props.smallStaticAvatar;
  }

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

  legacyButtonClicked = () => {
    this.props.hideOverlay();
    this.props.setInstructionsRenderedHeight(this.getMinHeight());
    this.props.adjustMaxNeededHeight();
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height
      },
      this.props.noVisualization && styles.noViz,
      this.props.overlayVisible && styles.withOverlay
    ];

    const markdown = this.shouldDisplayShortInstructions()
      ? this.props.shortInstructions
      : this.props.longInstructions;

    const ttsUrl = this.shouldDisplayShortInstructions()
      ? this.props.ttsShortInstructionsUrl
      : this.props.ttsLongInstructionsUrl;

    const leftColWidth =
      (this.getAvatar() ? PROMPT_ICON_WIDTH : 10) +
      (this.props.hasAuthoredHints ? AUTHORED_HINTS_EXTRA_WIDTH : 0);

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
          leftColWidth={leftColWidth}
          rightColWidth={this.getRightColWidth() || 0}
          height={this.props.height - HEADER_HEIGHT - RESIZER_HEIGHT}
        >
          <div
            style={[
              commonStyles.bubble,
              this.props.hasAuthoredHints
                ? styles.authoredHints
                : styles.noAuthoredHints
            ]}
          >
            <div
              className={classNames({
                'prompt-icon-cell': true,
                authored_hints: this.props.hasAuthoredHints
              })}
              onClick={this.handleClickBubble}
            >
              {this.props.hasAuthoredHints && <HintDisplayLightbulb />}
              {this.getAvatar() && (
                <PromptIcon
                  src={this.getAvatar()}
                  ref={c => {
                    this.icon = c;
                  }}
                />
              )}
            </div>
          </div>
          <div
            ref={c => {
              this.instructions = c;
            }}
            className="csf-top-instructions"
            style={[
              styles.instructions,
              shouldDisplayChatTips(this.props.skinId) &&
                (this.props.isRtl
                  ? styles.instructionsWithTipsRtl
                  : styles.instructionsWithTips)
            ]}
          >
            <ChatBubble ttsUrl={ttsUrl}>
              <Instructions
                ref={c => {
                  this.instructions = c;
                }}
                longInstructions={markdown}
                onResize={this.props.adjustMaxNeededHeight}
                inputOutputTable={
                  this.props.collapsed ? undefined : this.props.inputOutputTable
                }
                imgURL={this.props.aniGifURL}
                inTopPane
              />
              {this.props.shortInstructions2 && (
                <div className="secondary-instructions">
                  <SafeMarkdown markdown={this.props.shortInstructions2} />
                </div>
              )}
              {this.props.overlayVisible && (
                <div>
                  <hr />
                  <LegacyButton
                    type="primary"
                    onClick={this.legacyButtonClicked}
                  >
                    {i18n.dialogOK()}
                  </LegacyButton>
                </div>
              )}
            </ChatBubble>
            {!this.props.collapsed &&
              this.props.hints &&
              this.props.hints.map(hint => (
                <InlineHint
                  key={hint.hintId}
                  borderColor={color.yellow}
                  markdown={hint.markdown}
                  ttsUrl={hint.ttsUrl}
                  ttsMessage={hint.ttsMessage}
                  block={hint.block}
                  video={hint.hintVideo}
                />
              ))}
            {/*
              The `key` prop on the InlineFeedback component is a workaround for a React 15.x problem
              with efficiently updating inline blockly xml within this message. By providing a
              changing key prop, we force the component to entirely unmount and re-mount when the
              message contents change.  This may not be a problem once we upgrade to React 16.
            */}
            {this.props.feedback && !this.props.collapsed && (
              <InlineFeedback
                key={this.props.feedback.message}
                borderColor={
                  this.props.isMinecraft ? color.white : color.charcoal
                }
                message={this.props.feedback.message}
              />
            )}
            {this.shouldDisplayHintPrompt() && (
              <HintPrompt
                borderColor={color.yellow}
                onConfirm={this.showHint}
                onDismiss={this.dismissHintPrompt}
              />
            )}
          </div>
          <div>
            <CollapserButton
              ref={c => {
                this.collapser = c;
              }}
              style={[
                styles.collapserButton,
                this.props.isMinecraft && craftStyles.collapserButton,
                !this.shouldDisplayCollapserButton() && commonStyles.hidden
              ]}
              collapsed={this.props.collapsed}
              onClick={this.props.handleClickCollapser}
            />
            {!this.props.collapsed && (
              <ScrollButtons
                style={[
                  this.props.isRtl
                    ? styles.scrollButtonsRtl
                    : styles.scrollButtons,
                  this.props.isMinecraft &&
                    (this.props.isRtl
                      ? craftStyles.scrollButtonsRtl
                      : craftStyles.scrollButtons)
                ]}
                ref={c => {
                  this.scrollButtons = c;
                }}
                getScrollTarget={this.getScrollTarget}
                visible={this.state.displayScrollButtons}
                height={
                  this.props.height -
                  HEADER_HEIGHT -
                  RESIZER_HEIGHT -
                  styles.scrollButtons.top
                }
              />
            )}
          </div>
        </ThreeColumns>
      </div>
    );
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      overlayVisible: state.instructions.overlayVisible,
      skinId: state.pageConstants.skinId,
      isMinecraft: !!state.pageConstants.isMinecraft,
      aniGifURL: state.pageConstants.aniGifURL,
      inputOutputTable: state.pageConstants.inputOutputTable,
      isRtl: state.isRtl,
      noVisualization: state.pageConstants.noVisualization,
      feedback: state.instructions.feedback,
      collapsed: state.instructions.collapsed,
      hints: state.authoredHints.seenHints,
      hasUnseenHint: state.authoredHints.unseenHints.length > 0,
      hasAuthoredHints: state.instructions.hasAuthoredHints,
      showNextHint: state.pageConstants.showNextHint,
      height: state.instructions.renderedHeight,
      maxHeight: Math.min(
        state.instructions.maxAvailableHeight,
        state.instructions.maxNeededHeight
      ),
      ttsShortInstructionsUrl: state.pageConstants.ttsShortInstructionsUrl,
      ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl,
      shortInstructions: state.instructions.shortInstructions,
      shortInstructions2: state.instructions.shortInstructions2,
      longInstructions: state.instructions.longInstructions,
      smallStaticAvatar: state.pageConstants.smallStaticAvatar,
      failureAvatar: state.pageConstants.failureAvatar
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      hideOverlay: function() {
        dispatch(instructions.hideOverlay());
      },
      setInstructionsRenderedHeight(height) {
        dispatch(instructions.setInstructionsRenderedHeight(height));
      },
      clearFeedback(height) {
        dispatch(instructions.setFeedback(null));
      }
    };
  },
  null,
  {withRef: true}
)(Radium(InstructionsCSF));
