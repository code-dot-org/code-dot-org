import React, {PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const styles = {
  publishedCell: {
    textAlign: 'center'
  },
  actionCell: {
    textAlign: 'center'
  },
  thumbnail: {
    width: 70,
    height: 70,
    float: 'left'
  },
  table: {
    border: '1px solid black',
    width: 970
  },
  tr: {
    border: '1px solid black'
  }
};

const PersonalProjectsTable = React.createClass({
  propTypes: {
    projectList: PropTypes.array.isRequired
  },

  render() {
    const projectList = convertChannelsToProjectData(this.props.projectList);
    return (
      <table style={styles.table}>
        <tbody>
          <tr style={styles.tr}>
            <th>Project Name</th>
            <th>App Type</th>
            <th>Last Edited</th>
            <th>Public Gallery</th>
            <th>Quick Options</th>
          </tr>
          {
            projectList && projectList.map((project, index) => (
              <tr key={index} style={styles.tr}>
                <td>
                  <img
                    src={project.thumbnailUrl || PROJECT_DEFAULT_IMAGE}
                    style={styles.thumbnail}
                  />
                  {project.name}
                </td>
                <td>{project.type}</td>
                <td>{project.updatedAt}</td>
                <td style={styles.publishedCell}>
                  {project.isPublished && <FontAwesome icon="circle"/>}
                </td>
                <td style={styles.actionCell}>
                  <FontAwesome icon="angle-down"/>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
});

// The project widget uses the channels API to populate the personal projects
// and the data needs to be converted to match the format of the project cards
// before passing it to PersonalRecentProjects.
const convertChannelsToProjectData = function (projects) {
  // Sort by most recently updated.
  let projectLists = _.sortBy(projects, 'updatedAt').reverse();

  // Get the ones that aren't hidden, and have a type and id.
  projectLists = projectLists.filter(project => !project.hidden && project.id && project.projectType);
  const numProjects = Math.min(4, projectLists.length);
  return _.range(numProjects).map(i => (
    {
      name: projectLists[i].name,
      channel: projectLists[i].id,
      thumbnailUrl: projectLists[i].thumbnailUrl,
      type: projectLists[i].projectType,
      isPublished: projectLists[i].isPublished,
      updatedAt: projectLists[i].updatedAt
    }
  ));
};

export default PersonalProjectsTable;
