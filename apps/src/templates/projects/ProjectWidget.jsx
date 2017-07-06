import React, {PropTypes} from 'react';
import {personalProjectDataPropType} from './projectConstants';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import ContentContainer from '../ContentContainer.jsx';
import i18n from "@cdo/locale";

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
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
          <PersonalRecentProjects projectList={this.props.projectList} />
        }
        <NewProjectButtons />
      </ContentContainer>
    );
  }
});

export default ProjectWidget;
