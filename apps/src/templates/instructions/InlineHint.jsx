/* eslint-disable react/no-danger */
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubble from './ChatBubble';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import { connect } from 'react-redux';
import { convertXmlToBlockly } from './utils';
import VideoThumbnail from '../VideoThumbnail';
import { videoDataShape } from '../types';

const InlineHint = React.createClass({

  propTypes: {
    block: PropTypes.object, // XML
    borderColor: PropTypes.string,
    content: PropTypes.string.isRequired,
    video: videoDataShape,
    ttsUrl: PropTypes.string,
    ttsMessage: PropTypes.string,
    isBlockly: PropTypes.bool,
  },

  componentDidMount() {
    if (this.props.isBlockly) {
      convertXmlToBlockly(ReactDOM.findDOMNode(this));
    }
  },

  onVideoClick() {
    firehoseClient.putRecord(
      'analysis-events',
      {
        study: 'hint-videos',
        event: 'click',
        data_string: this.props.video.key,
      },
      { includeUserId: true }
    );
  },

  render() {
    return (
      <ChatBubble borderColor={this.props.borderColor} ttsUrl={this.props.ttsUrl} ttsMessage={this.props.ttsMessage}>
        <div
          dangerouslySetInnerHTML={{ __html: this.props.content }}
        />
        {this.props.block && <ReadOnlyBlockSpace block={this.props.block} />}
        {this.props.video &&
          <VideoThumbnail
            onClick={this.onVideoClick}
            video={this.props.video}
          />
        }
      </ChatBubble>
    );
  }

});

export const StatelessInlineHint = Radium(InlineHint);
export default connect(state => ({
  isBlockly: state.pageConstants.isBlockly,
}))(Radium(InlineHint));
