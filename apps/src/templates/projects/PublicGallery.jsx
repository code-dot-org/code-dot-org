import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ProjectCardGrid from './ProjectCardGrid';

export const publishedProjectPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired
});

class PublicGallery extends Component {
  static propTypes = {
    // Controls hiding/showing view more links for App Lab and Game Lab.
    limitedGallery: PropTypes.bool,
    includeDanceParty: PropTypes.bool,

    // Provided by Redux
    projectLists: PropTypes.shape({
      special_topic: PropTypes.arrayOf(publishedProjectPropType),
      applab: PropTypes.arrayOf(publishedProjectPropType),
      spritelab: PropTypes.arrayOf(publishedProjectPropType),
      gamelab: PropTypes.arrayOf(publishedProjectPropType),
      playlab: PropTypes.arrayOf(publishedProjectPropType),
      artist: PropTypes.arrayOf(publishedProjectPropType),
      minecraft: PropTypes.arrayOf(publishedProjectPropType),
      dance: PropTypes.arrayOf(publishedProjectPropType)
    })
  };

  /**
   * Transform the projectLists data from the format expected by the
   * PublicGallery to the format expected by the ProjectCardGrid.
   * See the PropTypes of each component for a definition of each format.
   */
  mapProjectData(projectLists) {
    return _.mapValues(projectLists, projectList => {
      return projectList.map(projectData => {
        return {
          projectData: {
            ...projectData,
            publishedToPublic: true,
            publishedToClass: false
          },
          currentGallery: 'public'
        };
      });
    });
  }

  render() {
    const {projectLists, limitedGallery, includeDanceParty} = this.props;

    return (
      <div id="uitest-public-projects">
        <ProjectCardGrid
          projectLists={this.mapProjectData(projectLists)}
          galleryType="public"
          limitedGallery={limitedGallery}
          includeDanceParty={includeDanceParty}
        />
        <div style={styles.clear} />
        <div style={styles.linkBox}>
          <a
            href="https://support.code.org/hc/en-us/articles/360001143952"
            style={styles.link}
          >
            <h3>{i18n.reportAbuse()}</h3>
          </a>
        </div>
      </div>
    );
  }
}

const styles = {
  clear: {
    clear: 'both'
  },
  linkBox: {
    textAlign: 'center',
    width: '100%',
    marginTop: 10
  },
  link: {
    display: 'inline-block'
  }
};
export default connect(state => ({
  projectLists: state.projects.projectLists
}))(PublicGallery);
