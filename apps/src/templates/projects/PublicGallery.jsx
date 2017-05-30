import React, {Component, PropTypes} from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';
import i18n from "@cdo/locale";
import color from "../../util/color";

export const publishedProjectPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
});

const styles = {
  link: {
    color: color.light_teal,
    paddingLeft: 30
  }
};

class PublicGallery extends Component {
  static propTypes = {
    projectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(publishedProjectPropType),
      gamelab: PropTypes.arrayOf(publishedProjectPropType),
      playlab: PropTypes.arrayOf(publishedProjectPropType),
      artist: PropTypes.arrayOf(publishedProjectPropType),
    }),
  }

  /**
   * Transform the projectsLists data from the format expected by the
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
        <a href="/gallery" style={styles.link}>{i18n.projectsViewOldGallery()}</a>
      </div>
    );
  }
}
export default PublicGallery;
