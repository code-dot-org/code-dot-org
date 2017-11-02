import {showVideoDialog} from "../../code-studio/videos";
import React, {Component, PropTypes} from 'react';

const styles = {
  referenceArea: {
    marginTop: 20,
  },
  videoLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
  },
  videoThumbnail: {
    borderRadius: 5,
    height: 40,
    width: 'auto',
    marginRight: 8
  }
};

export default class HelpTabContents extends Component {
  static propTypes = {
    videoData: PropTypes.shape({
      src: PropTypes.string.isRequired,
      name: PropTypes.string,
      key: PropTypes.string,
      download: PropTypes.string,
      thumbnail: PropTypes.string,
      enable_fallback: PropTypes.bool,
      autoplay: PropTypes.bool,
    })
  };

  render() {
    const videoData = this.props.videoData;
    return (
      <div style={styles.referenceArea}>
        {videoData &&
          <a
            style={styles.videoLink}
            onClick={() => {
              showVideoDialog({
                src: videoData.src,
                name: videoData.name,
                key: videoData.key,
                download: videoData.download,
                thumbnail: videoData.thumbnail,
                enable_fallback: videoData.enable_fallback,
                autoplay: videoData.autoplay
              },
              true);
            }
            }
          >
            <img
              style={styles.videoThumbnail}
              src={videoData.thumbnail}
              alt={videoData.name}
            />
            <span>{videoData.name}</span>
          </a>
        }
      </div>
    );
  }
}
