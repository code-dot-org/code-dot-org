import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import harness from '@cdo/apps/lib/util/harness';

import EmbeddedWorkspace from '../EmbeddedWorkspace';
import SafeMarkdown from '../SafeMarkdown';
import {videoDataShape} from '../types';
import VideoThumbnail from '../VideoThumbnail';

import ChatBubble from './ChatBubble';
import {convertXmlToBlockly} from './utils';

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

  componentDidMount() {
    if (this.props.isBlockly) {
      convertXmlToBlockly(ReactDOM.findDOMNode(this), this.props.isRtl);
    }
  }

  onVideoClick = () => {
    harness.trackAnalytics(
      {
        study: 'hint-videos',
        event: 'click',
        data_string: this.props.video.key,
      },
      {includeUserId: true}
    );
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
        <SafeMarkdown markdown={this.props.markdown} />
        {this.props.block && (
          <EmbeddedWorkspace
            block={this.props.block}
            isRtl={this.props.isRtl}
          />
        )}
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
    state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1,
}))(Radium(InlineHint));
