import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {videoDataShape} from '../types';
import VideoThumbnail from '../VideoThumbnail';

import NetworkResourceLink from './NetworkResourceLink';

export default class HelpTabContents extends Component {
  static propTypes = {
    videoData: videoDataShape,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array,
    openReferenceLinksInNewTab: PropTypes.bool,
  };

  render() {
    return (
      <div style={styles.referenceArea}>
        {this.props.videoData && (
          <VideoThumbnail
            video={this.props.videoData}
            openInNewTab={this.props.openReferenceLinksInNewTab}
          />
        )}
        {this.props.mapReference && (
          <NetworkResourceLink
            highlight
            icon="map"
            reference={this.props.mapReference}
            openReferenceInNewTab={this.props.openReferenceLinksInNewTab}
          />
        )}
        {this.props.referenceLinks &&
          this.props.referenceLinks.map((link, index) => (
            <NetworkResourceLink
              key={index}
              icon="book"
              reference={link}
              openReferenceInNewTab={this.props.openReferenceLinksInNewTab}
            />
          ))}
      </div>
    );
  }
}

const styles = {
  referenceArea: {
    marginTop: 20,
  },
};
