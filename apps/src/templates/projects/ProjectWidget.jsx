import React, {PropTypes} from 'react';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import ContentContainer from '../ContentContainer.jsx';
import i18n from "@cdo/locale";
import _ from 'lodash';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.array.isRequired,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isLoading: PropTypes.bool,
    isRtl: PropTypes.bool
  },

  render() {
    const convertedProjects = convertChannelsToProjectData(this.props.projectList);
    const { isRtl } = this.props;

    return (
      <ContentContainer
        heading={i18n.projects()}
        linkText={i18n.projectsViewProjectGallery()}
        link="/projects"
        isRtl={isRtl}
      >
        {this.props.isLoading &&
          <div style={{height: 280, textAlign: 'center'}}>
            <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>
          </div>
        }
        {convertedProjects.length > 0 &&
          <PersonalRecentProjects
            projectList={convertedProjects}
            isRtl={isRtl}
          />
        }
        <NewProjectButtons
          projectTypes={this.props.projectTypes}
          isRtl={isRtl}
        />
      </ContentContainer>
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
      updatedAt: projectLists[i].updatedAt
    }
  ));
};

export default ProjectWidget;
