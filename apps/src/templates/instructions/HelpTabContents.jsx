import React, {PropTypes, Component} from 'react';
import VideoThumbnail from '../VideoThumbnail';
import {videoDataShape} from '../types';

const styles = {
  referenceArea: {
    marginTop: 20,
  },
};

export default class HelpTabContents extends Component {
  static propTypes = {
    logText: PropTypes.string,
    videoData: videoDataShape,
  };

  render() {
    return (
      <div style={styles.referenceArea}>
        {this.props.videoData &&
          <VideoThumbnail
            logText={this.props.logText}
            video={this.props.videoData}
          />
        }
      </div>
    );
  }
}
