import {showVideoDialog} from '@cdo/apps/code-studio/videos';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {videoDataShape} from './types';

export default class VideoThumbnail extends Component {
  static propTypes = {
    video: videoDataShape,
    onClick: PropTypes.func
  };

  render() {
    const video = this.props.video;
    return (
      <a
        style={styles.videoLink}
        onClick={() => {
          this.props.onClick && this.props.onClick();
          showVideoDialog(
            {
              src: video.src,
              name: video.name,
              key: video.key,
              download: video.download,
              thumbnail: video.thumbnail,
              enable_fallback: video.enable_fallback,
              autoplay: video.autoplay
            },
            true
          );
        }}
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

const styles = {
  videoLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
    cursor: 'pointer'
  },
  videoThumbnail: {
    borderRadius: 5,
    height: 40,
    width: 'auto',
    marginRight: 8
  }
};
