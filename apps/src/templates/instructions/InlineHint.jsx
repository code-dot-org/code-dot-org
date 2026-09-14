import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import EmbeddedWorkspace from '../EmbeddedWorkspace';
import {videoDataShape} from '../types';
import VideoThumbnail from '../VideoThumbnail';

import ChatBubble from './ChatBubble';
import MarkdownInstructions from './MarkdownInstructions';

class InlineHint extends React.Component {
  static propTypes = {
    block: PropTypes.object, // XML
    borderColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    markdown: PropTypes.string.isRequired,
    video: videoDataShape,
    ttsUrl: PropTypes.string,
    ttsMessage: PropTypes.string,
    ttsEnabled: PropTypes.bool,
    textToSpeechEnabled: PropTypes.bool,
    isBlockly: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    isRtl: PropTypes.bool,
    skinId: PropTypes.string,
  };

  render() {
    return (
      <ChatBubble
        borderColor={this.props.borderColor}
        backgroundColor={this.props.backgroundColor}
        textToSpeechEnabled={this.props.textToSpeechEnabled}
        ttsUrl={this.props.ttsUrl}
        ttsMessage={this.props.ttsMessage}
        isMinecraft={this.props.isMinecraft}
        skinId={this.props.skinId}
      >
        <MarkdownInstructions
          inTopPane
          isBlockly
          markdown={this.props.markdown}
        />
        {this.props.block && (
          <EmbeddedWorkspace
            block={this.props.block}
            isRtl={this.props.isRtl}
          />
        )}
        {this.props.video && <VideoThumbnail video={this.props.video} />}
      </ChatBubble>
    );
  }
}

export const StatelessInlineHint = InlineHint;
export default connect(state => ({
  isBlockly: state.pageConstants.isBlockly,
  isMinecraft: state.pageConstants.isMinecraft,
  skinId: state.pageConstants.skinId,
  textToSpeechEnabled:
    state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
}))(InlineHint);
