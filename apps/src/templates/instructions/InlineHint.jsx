import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubble from './ChatBubble';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {connect} from 'react-redux';
import {convertXmlToBlockly} from './utils';
import VideoThumbnail from '../VideoThumbnail';
import {videoDataShape} from '../types';
import SafeMarkdown from '../SafeMarkdown';

class InlineHint extends React.Component {
  static propTypes = {
    block: PropTypes.object, // XML
    borderColor: PropTypes.string,
    markdown: PropTypes.string.isRequired,
    video: videoDataShape,
    ttsUrl: PropTypes.string,
    ttsMessage: PropTypes.string,
    ttsEnabled: PropTypes.bool,
    textToSpeechEnabled: PropTypes.bool,
    isBlockly: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    skinId: PropTypes.string
  };

  componentDidMount() {
    if (this.props.isBlockly) {
      convertXmlToBlockly(ReactDOM.findDOMNode(this));
    }
  }

  onVideoClick = () => {
    firehoseClient.putRecord(
      {
        study: 'hint-videos',
        event: 'click',
        data_string: this.props.video.key
      },
      {includeUserId: true}
    );
  };

  render() {
    return (
      <ChatBubble
        borderColor={this.props.borderColor}
        textToSpeechEnabled={this.props.textToSpeechEnabled}
        ttsUrl={this.props.ttsUrl}
        ttsMessage={this.props.ttsMessage}
        isMinecraft={this.props.isMinecraft}
        skinId={this.props.skinId}
      >
        <SafeMarkdown markdown={this.props.markdown} />
        {this.props.block && <ReadOnlyBlockSpace block={this.props.block} />}
        {this.props.video && (
          <VideoThumbnail
            onClick={this.onVideoClick}
            video={this.props.video}
          />
        )}
      </ChatBubble>
    );
  }
}

export const StatelessInlineHint = Radium(InlineHint);
export default connect(state => ({
  isBlockly: state.pageConstants.isBlockly,
  isMinecraft: state.pageConstants.isMinecraft,
  skinId: state.pageConstants.skinId,
  textToSpeechEnabled:
    state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1
}))(Radium(InlineHint));
