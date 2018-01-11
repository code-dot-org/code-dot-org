import {showVideoDialog} from "@cdo/apps/code-studio/videos";
import React, {PropTypes, Component} from 'react';
import {videoDataShape} from './types';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const styles = {
  videoLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
    cursor: 'pointer',
  },
  videoThumbnail: {
    borderRadius: 5,
    height: 40,
    width: 'auto',
    marginRight: 8,
  }
};

export default class VideoThumbnail extends Component {
  static propTypes = {
    logText: PropTypes.string,
    video: videoDataShape,
  };

  render() {
    const video = this.props.video;
    return (
      <a
        style={styles.videoLink}
        onClick={() => {
          showVideoDialog({
            src: video.src,
            name: video.name,
            key: video.key,
            download: video.download,
            thumbnail: video.thumbnail,
            enable_fallback: video.enable_fallback,
            autoplay: video.autoplay,
          }, true);
          firehoseClient.putRecord(
            'analysis-events',
            {
              study: 'instructions-resources-tab-wip-v1',
              study_group: 'resources-tab',
              event: 'tab-video-click',
              data_json: JSON.stringify(this.props.logText),
            }
          );
        }
        }
      >
        <img
          style={styles.videoThumbnail}
          src={video.thumbnail}
          alt={video.name}
        />
        <span>{video.name}</span>
      </a>
    );
  }
}
