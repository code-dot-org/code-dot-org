import React, {PropTypes} from 'react';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import ContentContainer from '../ContentContainer.jsx';
import i18n from "@cdo/locale";

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.array,
    projectTypes: PropTypes.arrayOf(PropTypes.string)
  },

  render() {
    return (
      <ContentContainer
        heading={i18n.projects()}
        linkText={i18n.projectsViewProjectGallery()}
        link="/projects"
        showLink={true}
        isRtl={false}
      >
        {this.props.projectList.length > 0 &&
          <PersonalRecentProjects
            projectList={convertChannelsToProjectData(this.props.projectList)}
          />
        }
        <NewProjectButtons projectTypes={this.props.projectTypes}/>
      </ContentContainer>
    );
  }
});

// The project widget uses the channels API to populate the personal projects
// and the data needs to be converted to match the format of the project cards
// before passing it to PersonalRecentProjects.
const convertChannelsToProjectData = function (projectLists) {
  // Sort by most recently updated.
  projectLists.sort((a, b) => {
    if (a.updatedAt < b.updatedAt) {
      return 1;
    } else {
      return -1;
    }
  });

  // Get the first 4 that aren't hidden, and have a type and id.
  projectLists = projectLists.filter(project => !project.hidden && project.id && project.projectType);
  projectLists = projectLists.slice(0,4);

  // Map feild names.
  const converted = projectLists.map(projectList => ({
    name: projectList.name,
    channel: projectList.id,
    thumbnailUrl: projectList.thumbnailUrl,
    type: projectList.projectType,
    updatedAt: projectList.updatedAt
  }));
  return converted;
};

export default ProjectWidget;
