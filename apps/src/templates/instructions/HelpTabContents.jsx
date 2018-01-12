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
    scriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    logText: PropTypes.string,
    videoData: videoDataShape,
  };

  render() {
    return (
      <div style={styles.referenceArea}>
        {this.props.videoData &&
          <VideoThumbnail
            scriptId={this.props.scriptId}
            serverLevelId={this.props.serverLevelId}
            logText={this.props.logText}
            video={this.props.videoData}
          />
        }
      </div>
    );
  }
}
