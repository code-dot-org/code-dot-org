import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import UnsafeRenderedMarkdown from '../UnsafeRenderedMarkdown';
import {shouldDisplayChatTips} from './utils';
import Instructions from './Instructions';
import color from '../../util/color';
import HintPrompt from './HintPrompt';
import InlineFeedback from './InlineFeedback';
import InlineHint from './InlineHint';
import ChatBubble from './ChatBubble';
import LegacyButton from '../LegacyButton';
import instructions from '../../redux/instructions';

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

class CSFInstructionsColumnTwo extends React.Component {
  static propTypes = {
    adjustMaxNeededHeight: PropTypes.func,
    shouldDisplayHintPrompt: PropTypes.func,
    instructionsRef: PropTypes.func, //maybe rename
    setPromptForHintFalse: PropTypes.func,
    markdown: PropTypes.string,
    ttsUrl: PropTypes.string,
    showNextHint: PropTypes.func,
    clearFeedback: PropTypes.func.isRequired,

    //redux
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    }),
    isMinecraft: PropTypes.bool,
    hints: PropTypes.arrayOf(
      PropTypes.shape({
        hintId: PropTypes.string,
        markdown: PropTypes.string,
        block: PropTypes.object, // XML
        video: PropTypes.string
      })
    ),
    hideOverlay: PropTypes.func.isRequired,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    skinId: PropTypes.string,
    isRtl: PropTypes.bool,
    aniGifURL: PropTypes.string,
    shortInstructions2: PropTypes.string,
    overlayVisible: PropTypes.bool,
    collapsed: PropTypes.bool
  };

  showHint = () => {
    this.dismissHintPrompt();
    this.props.showNextHint();
    this.props.clearFeedback();
  };

  dismissHintPrompt = () => {
    this.props.setPromptForHintFalse();
  };

  render() {
    const {isRtl, markdown, ttsUrl} = this.props;

    return (
      <div
        ref={this.props.instructionsRef}
        className="csf-top-instructions"
        style={[
          styles.instructions,
          shouldDisplayChatTips(this.props.skinId) &&
            (isRtl
              ? styles.instructionsWithTipsRtl
              : styles.instructionsWithTips)
        ]}
      >
        <ChatBubble ttsUrl={ttsUrl}>
          <Instructions
            ref={this.props.instructionsRef}
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
              <UnsafeRenderedMarkdown
                markdown={this.props.shortInstructions2}
              />
            </div>
          )}
          {this.props.overlayVisible && (
            <div>
              <hr />
              <LegacyButton type="primary" onClick={this.props.hideOverlay}>
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
        {this.props.feedback && !this.props.collapsed && (
          <InlineFeedback
            borderColor={this.props.isMinecraft ? color.white : color.charcoal}
            message={this.props.feedback.message}
          />
        )}
        {this.props.shouldDisplayHintPrompt() && (
          <HintPrompt
            borderColor={color.yellow}
            onConfirm={this.showHint}
            onDismiss={this.dismissHintPrompt}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => (
    {
      skinId: state.pageConstants.skinId,
      inputOutputTable: state.pageConstants.inputOutputTable,
      aniGifURL: state.pageConstants.aniGifURL,
      shortInstructions2: state.instructions.shortInstructions2,
      overlayVisible: state.instructions.overlayVisible,
      collapsed: state.instructions.collapsed,
      hints: state.authoredHints.seenHints,
      feedback: state.instructions.feedback,
      isMinecraft: !!state.pageConstants.isMinecraft
    },
    function propsFromDispatch(dispatch) {
      return {
        hideOverlay: function() {
          dispatch(instructions.hideOverlay());
        }
      };
    }
  )
)(CSFInstructionsColumnTwo);
