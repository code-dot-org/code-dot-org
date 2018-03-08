import React, {PropTypes, Component} from 'react';
import VideoThumbnail from '../VideoThumbnail';
import {videoDataShape} from '../types';
import ResourceLink from './ResourceLink';
import experiments from '@cdo/apps/util/experiments';

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
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array
  };

  render() {
    const displayReferenceLinks = experiments.isEnabled('additionalResources') &&
          this.props.referenceLinks;
    const displayMapLinks = experiments.isEnabled('additionalResources') &&
          this.props.mapReference;
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
        {displayMapLinks &&
          <ResourceLink
            map={true}
            reference={this.props.mapReference}
          />
        }
        {displayReferenceLinks &&
          this.props.referenceLinks.map((link, index) => (
            <ResourceLink
              key={index}
              map={false}
              reference={link}
            />
          ))
        }
      </div>
    );
  }
}
