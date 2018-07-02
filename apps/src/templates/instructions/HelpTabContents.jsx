import React, {PropTypes, Component} from 'react';
import VideoThumbnail from '../VideoThumbnail';
import {videoDataShape} from '../types';
import NetworkResourceLink from './NetworkResourceLink';

const styles = {
  referenceArea: {
    marginTop: 20,
  },
};

export default class HelpTabContents extends Component {
  static propTypes = {
    videoData: videoDataShape,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array
  };

  render() {
    return (
      <div style={styles.referenceArea}>
        {this.props.videoData &&
          <VideoThumbnail
            video={this.props.videoData}
          />
        }
        {this.props.mapReference &&
          <NetworkResourceLink
            highlight
            icon="map"
            reference={this.props.mapReference}
          />
        }
        {this.props.referenceLinks &&
          this.props.referenceLinks.map((link, index) => (
            <NetworkResourceLink
              key={index}
              icon="book"
              reference={link}
            />
          ))
        }
      </div>
    );
  }
}
