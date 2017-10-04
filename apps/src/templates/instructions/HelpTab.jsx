import {showVideoDialog} from "../../code-studio/videos";
import React, {PropTypes} from 'react';

var styles = {
  referenceArea: {
    marginTop: 20,
  },
  videoLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 25 + 'px',
  },
  videoThumbnail: {
    borderRadius: 5,
    height: 40,
    width: 'auto',
    marginRight: 8
  }
};

const HelpTab = React.createClass({
  propTypes: {
    videoData: PropTypes.object
  },

  render(){
    const videoData = this.props.videoData;
    return (
      <div style={styles.referenceArea}>
        <a
          style={styles.videoLink}
          onClick={() => {
            showVideoDialog(
              {src: videoData.src,
                name: videoData.name,
                key: videoData.key,
                download: videoData.download,
                thumbnail: videoData.thumbnail,
                enable_fallback: true,
                autoplay: true},
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
      </div>
    );
  }
});

export default HelpTab;
