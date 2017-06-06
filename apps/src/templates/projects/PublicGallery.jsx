import React, {Component, PropTypes} from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';

export const publishedProjectPropType = PropTypes.shape({
  channel: PropTypes.string.isRequired,
  name: PropTypes.string,
  studentName: PropTypes.string,
  studentAgeRange: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  type: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
});

export const MAX_PROJECTS_PER_CATEGORY = 100;

class PublicGallery extends Component {
  static propTypes = {
    initialProjectLists: PropTypes.shape({
      applab: PropTypes.arrayOf(publishedProjectPropType),
      gamelab: PropTypes.arrayOf(publishedProjectPropType),
      playlab: PropTypes.arrayOf(publishedProjectPropType),
      artist: PropTypes.arrayOf(publishedProjectPropType),
    }),
  }

  constructor(props) {
    super(props);

    this.fetchOlderProjects = this.fetchOlderProjects.bind(this);

    this.state = {
      projectLists: props.initialProjectLists,

      // Whether there are more projects of each type on the server which are
      // older than the ones we have on the client.
      hasOlderProjects: {
        applab: true,
        gamelab: true,
        playlab: true,
        artist: true,
      }
    };
  }

  /**
   * Fetch additional projects of the specified type which were published
   * earlier than the oldest published project currently in our list.
   * @param {string} type Project type: applab, gamelab, playlab or artist.
   * @param {function} callback Callback to call after network request completes.
   */
  fetchOlderProjects(type, callback) {
    const projectList = this.state.projectLists[type];
    const oldestProject = projectList[projectList.length - 1];
    const oldestPublishedAt = oldestProject && oldestProject.publishedAt;

    $.ajax({
      method: 'GET',
      url: `/api/v1/projects/gallery/public/${type}/${MAX_PROJECTS_PER_CATEGORY}/${oldestPublishedAt}`,
      dataType: 'json'
    }).done(data => {
      // olderProjects all have an older publishedAt date than oldestProject.
      const olderProjects = data[type];

      const {hasOlderProjects, projectLists} = this.state;

      // Don't try to fetch projects of this type again in the future if we
      // received fewer than we asked for this time.
      if (olderProjects.length < MAX_PROJECTS_PER_CATEGORY) {
        hasOlderProjects[type] = false;
      }

      // Append any projects we just received to the appropriate list,
      // ignoring any duplicates.
      projectLists[type] = _.unionBy(projectLists[type], olderProjects, 'channel');

      // Only call setState once. React won't combine multiple calls to setState
      // here because we are in an ajax callback.
      this.setState({hasOlderProjects, projectLists});
    }).always(callback);
  }

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
    const {projectLists} = this.state;
    return (
      <div>
        <ProjectCardGrid
          projectLists={this.mapProjectData(projectLists)}
          galleryType="public"
          hasOlderProjects={this.state.hasOlderProjects}
          fetchOlderProjects={this.fetchOlderProjects}
        />
      </div>
    );
  }
}
export default PublicGallery;
