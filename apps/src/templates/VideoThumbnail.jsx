import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {showVideoDialog} from '@cdo/apps/code-studio/videos';

import {videoDataShape} from './types';

export default class VideoThumbnail extends Component {
  static propTypes = {
    video: videoDataShape,
    onClick: PropTypes.func,
    openInNewTab: PropTypes.bool,
  };

  onThumbnailClick = () => {
    const video = this.props.video;
    this.props.onClick && this.props.onClick();
    if (this.props.openInNewTab) {
      window.open(video.src, '_blank', 'noopener,noreferrer');
    } else {
      showVideoDialog(
        {
          src: video.src,
          name: video.name,
          key: video.key,
          download: video.download,
          thumbnail: video.thumbnail,
          enable_fallback: video.enable_fallback,
          autoplay: video.autoplay,
        },
        true
      );
    }
  };

  render() {
    const video = this.props.video;
    return (
      <a style={styles.videoLink} onClick={this.onThumbnailClick}>
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
    cursor: 'pointer',
  },
  videoThumbnail: {
    borderRadius: 5,
    height: 40,
    width: 'auto',
    marginRight: 8,
  },
};
