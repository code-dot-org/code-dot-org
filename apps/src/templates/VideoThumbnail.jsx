import {showVideoDialog} from "@cdo/apps/code-studio/videos";
import React, {Component, PropTypes} from 'react';
import {videoDataShape} from './types';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import experiments from '@cdo/apps/util/experiments';

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
    scriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    video: videoDataShape,
    onClick: PropTypes.func,
  };

  render() {
    const video = this.props.video;
    return (
      <a
        style={styles.videoLink}
        onClick={() => {
          this.props.onClick && this.props.onClick();
          showVideoDialog({
            src: video.src,
            name: video.name,
            key: video.key,
            download: video.download,
            thumbnail: video.thumbnail,
            enable_fallback: video.enable_fallback,
            autoplay: video.autoplay,
          }, true);
          if ((experiments.isEnabled('resources_tab') || experiments.isEnabled('resourcesTab')) && this.props.logText){
            firehoseClient.putRecord(
              'analysis-events',
              {
                study: 'instructions-resources-tab-wip-v2',
                study_group: 'resources-tab',
                event: 'tab-video-click',
                script_id: this.props.scriptId,
                level_id: this.props.serverLevelId,
                data_json: this.props.logText,
              }
            );
          }
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
