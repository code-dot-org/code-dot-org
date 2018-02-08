import React, {Component, PropTypes} from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';
import {connect} from 'react-redux';

export const publishedProjectPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
});

class PublicGallery extends Component {
  static propTypes = {
    // from redux state
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(publishedProjectPropType),
      gamelab: PropTypes.arrayOf(publishedProjectPropType),
      playlab: PropTypes.arrayOf(publishedProjectPropType),
      artist: PropTypes.arrayOf(publishedProjectPropType),
      minecraft: PropTypes.arrayOf(publishedProjectPropType),
    }),
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
            publishedToClass: false,
          },
          currentGallery: "public",
        };
      });
    });
  }

  render() {
    const {projectLists} = this.props;
    return (
      <div>
        <ProjectCardGrid
          projectLists={this.mapProjectData(projectLists)}
          galleryType="public"
        />
      </div>
    );
  }
}
export default connect(state => ({
  projectLists: state.projects.projectLists,
}))(PublicGallery);
