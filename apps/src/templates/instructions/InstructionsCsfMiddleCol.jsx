import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import HintPrompt from './HintPrompt';
import InlineFeedback from './InlineFeedback';
import InlineHint from './InlineHint';
import ChatBubble from './ChatBubble';
import LegacyButton from '../LegacyButton';
import i18n from '@cdo/locale';
import SafeMarkdown from '../SafeMarkdown';
import {scrollTo, shouldDisplayChatTips} from './utils';
import color from '../../util/color';
import Instructions from './Instructions';

var instructions = require('../../redux/instructions');

class InstructionsCsfMiddleCol extends React.Component {
  static propTypes = {
    dismissHintPrompt: PropTypes.func.isRequired,
    shouldDisplayHintPrompt: PropTypes.func.isRequired,
    adjustMaxNeededHeight: PropTypes.func.isRequired,
    promptForHint: PropTypes.bool.isRequired,
    getMinInstructionsHeight: PropTypes.func.isRequired,
    hasShortAndLongInstructions: PropTypes.bool.isRequired,

    // from redux:
    overlayVisible: PropTypes.bool,
    skinId: PropTypes.string,
    isMinecraft: PropTypes.bool.isRequired,
    isBlockly: PropTypes.bool.isRequired,
    aniGifURL: PropTypes.string,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    isRtl: PropTypes.bool.isRequired,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),
    collapsed: PropTypes.bool.isRequired,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string.isRequired,
        markdown: PropTypes.string.isRequired,
        block: PropTypes.object, // XML
        video: PropTypes.string
      })
    ).isRequired,
    showNextHint: PropTypes.func.isRequired,
    ttsShortInstructionsUrl: PropTypes.string,
    ttsLongInstructionsUrl: PropTypes.string,
    textToSpeechEnabled: PropTypes.bool,
    shortInstructions: PropTypes.string,
    shortInstructions2: PropTypes.string,
    longInstructions: PropTypes.string,
    clearFeedback: PropTypes.func.isRequired,
    hideOverlay: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired
  };

  componentDidUpdate(prevProps) {
    const gotNewHint = prevProps.hints.length !== this.props.hints.length;
    if (gotNewHint) {
      this.handleHintOnLoad();
    }

    if (this.props.feedback || this.props.promptForHint || gotNewHint) {
      this.scrollInstructionsToBottom();
    }
  }

  handleHintOnLoad() {
    const images = ReactDOM.findDOMNode(this.instructions).getElementsByTagName(
      'img'
    );
    for (let i = 0, image; (image = images[i]); i++) {
      image.onload = image.onload || this.scrollInstructionsToBottom.bind(this);
    }
  }

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
    const contentContainer = instructions.parentElement;
    if (instructions.children.length > 1) {
      const lastChild = instructions.children[instructions.children.length - 1];
      scrollTo(contentContainer, lastChild.offsetTop - 10);
    } else {
      scrollBy(contentContainer, contentContainer.scrollHeight);
    }
  }

  showHint = () => {
    this.props.dismissHintPrompt();
    this.props.showNextHint();
    this.props.clearFeedback();
  };

  shouldDisplayShortInstructions() {
    return (
      (this.props.hasShortAndLongInstructions && this.props.collapsed) ||
      !this.props.longInstructions
    );
  }

  closeOverlay = () => {
    this.props.hideOverlay();
    this.props.setInstructionsRenderedHeight(
      this.props.getMinInstructionsHeight()
    );
    this.props.adjustMaxNeededHeight();
  };

  render() {
    const markdown = this.shouldDisplayShortInstructions()
      ? this.props.shortInstructions
      : this.props.longInstructions;

    const ttsUrl = this.shouldDisplayShortInstructions()
      ? this.props.ttsShortInstructionsUrl
      : this.props.ttsLongInstructionsUrl;

    const tipsStyle = shouldDisplayChatTips(this.props.skinId)
      ? this.props.isRtl
        ? styles.instructionsWithTipsRtl
        : styles.instructionsWithTips
      : {};

    return (
      <div
        ref={c => {
          this.instructions = c;
        }}
        className="csf-top-instructions"
        style={{...styles.instructions, ...tipsStyle}}
      >
        <ChatBubble
          ttsUrl={ttsUrl}
          textToSpeechEnabled={this.props.textToSpeechEnabled}
          isMinecraft={this.props.isMinecraft}
          skinId={this.props.skinId}
        >
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
            isBlockly={this.props.isBlockly}
            noInstructionsWhenCollapsed={false}
          />
          {this.props.shortInstructions2 && (
            <div className="secondary-instructions">
              <SafeMarkdown markdown={this.props.shortInstructions2} />
            </div>
          )}
          {this.props.overlayVisible && (
            <div>
              <hr />
              <LegacyButton type="primary" onClick={this.closeOverlay}>
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
            borderColor={this.props.isMinecraft ? color.white : color.charcoal}
            message={this.props.feedback.message}
            isMinecraft={this.props.isMinecraft}
            skinId={this.props.skinId}
            textToSpeechEnabled={this.props.textToSpeechEnabled}
          />
        )}
        {this.props.shouldDisplayHintPrompt() && (
          <HintPrompt
            borderColor={color.yellow}
            onConfirm={this.showHint}
            onDismiss={this.props.dismissHintPrompt}
            isMinecraft={this.props.isMinecraft}
            skinId={this.props.skinId}
            textToSpeechEnabled={this.props.textToSpeechEnabled}
          />
        )}
      </div>
    );
  }
}

const styles = {
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

export const UnconnectedInstructionsCsfMiddleCol = InstructionsCsfMiddleCol;

export default connect(
  function propsFromStore(state) {
    return {
      overlayVisible: state.instructions.overlayVisible,
      skinId: state.pageConstants.skinId,
      isMinecraft: !!state.pageConstants.isMinecraft,
      isBlockly: !!state.pageConstants.isBlockly,
      aniGifURL: state.pageConstants.aniGifURL,
      inputOutputTable: state.pageConstants.inputOutputTable,
      isRtl: state.isRtl,
      feedback: state.instructions.feedback,
      collapsed: state.instructions.isCollapsed,
      hints: state.authoredHints.seenHints,
      showNextHint: state.pageConstants.showNextHint,
      ttsShortInstructionsUrl: state.pageConstants.ttsShortInstructionsUrl,
      ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl,
      textToSpeechEnabled:
        state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
      shortInstructions: state.instructions.shortInstructions,
      shortInstructions2: state.instructions.shortInstructions2,
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
      },
      clearFeedback() {
        dispatch(instructions.setFeedback(null));
      }
    };
  },
  null,
  {forwardRef: true}
)(InstructionsCsfMiddleCol);
