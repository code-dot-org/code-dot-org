import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import i18n from '@cdo/locale';

import ProjectCardGrid from './ProjectCardGrid';
import {publishedFeaturedProjectPropType} from './projectConstants';

class PublicGallery extends Component {
  static propTypes = {
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
      music: PropTypes.arrayOf(publishedFeaturedProjectPropType),
    }),
  };

  /**
   * Transform the projectLists data from the format expected by the
   * PublicGallery to the format expected by the ProjectCardGrid.
   * See the PropTypes of each component for a definition of each format.
   * Note that the updated public gallery now displays only featured projects selected by
   * a project validator. There is now only one section 'Featured Projects' which
   * contains a mix of all project types.
   * In the future, we plan to implement a public gallery with sections for each project type.
   * For now, the public gallery displays one section of mixed project types so that we convert
   * projectLists (an object with key project type (e.g. 'applab' and value an array of project data objects
   * (e.g., [{name: 'My Project', channel: 'abc1--def234', ...}, {...}])
   * to an object with a single key 'featured' and value an array of modified project data
   * objects with different project types.
   */
  mapProjectData(projectLists) {
    // allProjectData is an array of project data objects with all lab types.
    const allProjectData = Object.values(projectLists).flat();
    // Update each project data object to format expected by ProjectCardGrid
    const updatedAllProjectData = allProjectData.map(data => ({
      projectData: {
        ...data,
        publishedToPublic: true,
        publishedToClass: false,
      },
      currentGallery: 'public',
    }));
    return {
      featured: _.shuffle(updatedAllProjectData),
    };
  }

  render() {
    const {projectLists} = this.props;

    return (
      <div id="uitest-public-projects">
        <ProjectCardGrid
          projectLists={this.mapProjectData(projectLists)}
          galleryType="public"
        />
        <div style={styles.bottomButton}>
          <Button
            useAsLink={true}
            ariaLabel={i18n.reportAbuse()}
            href="https://support.code.org/hc/en-us/articles/360001143952"
            color={buttonColors.gray}
            text={i18n.reportAbuse()}
            type="secondary"
            size="s"
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
