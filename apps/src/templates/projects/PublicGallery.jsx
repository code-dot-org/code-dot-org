import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ProjectCardGrid from './ProjectCardGrid';
import Button from '../Button';
import {publishedFeaturedProjectPropType} from './projectConstants';

class PublicGallery extends Component {
  static propTypes = {
    // Controls hiding/showing view more links for App Lab and Game Lab.
    limitedGallery: PropTypes.bool,
    includeDanceParty: PropTypes.bool,

    // Provided by Redux
    projectLists: PropTypes.shape({
      special_topic: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      applab: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      spritelab: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      gamelab: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      playlab: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      artist: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      minecraft: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      dance: PropTypes.arrayOf(publishedFeaturedProjectPropType),
      poetry: PropTypes.arrayOf(publishedFeaturedProjectPropType),
    }),
  };

  /**
   * Transform the projectLists data from the format expected by the
   * PublicGallery to the format expected by the ProjectCardGrid.
   * See the PropTypes of each component for a definition of each format.
   */
  mapProjectData(projectLists) {
    let allFeaturedProjects = [];
    for (const projectListName in projectLists) {
      projectLists[projectListName].forEach(projectData => {
        allFeaturedProjects.push({
          projectData: {
            ...projectData,
            publishedToPublic: true,
            publishedToClass: false,
          },
          currentGallery: 'public',
        });
      });
    }
    return {
      featured: _.shuffle(allFeaturedProjects),
    };
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
        <div style={styles.bottomButton}>
          <Button
            __useDeprecatedTag
            href="https://support.code.org/hc/en-us/articles/360001143952"
            color={Button.ButtonColor.neutralDark}
            text={i18n.reportAbuse()}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  bottomButton: {
    marginTop: '38px',
    marginBottom: '15px',
    textAlign: 'center',
  },
};
export default connect(state => ({
  projectLists: state.projects.projectLists,
}))(PublicGallery);
