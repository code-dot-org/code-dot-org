import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '../../redux';
import {personalProjectDataPropType} from './projectConstants';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import ContentContainer from '../ContentContainer.jsx';
import i18n from "@cdo/locale";

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
  },

  statics: {
    setupProjectWidget() {
      $.ajax({
        method: 'GET',
        url: `/v3/channels`,
        dataType: 'json'
      }).done(projectLists => {
        const widget = document.getElementById('projects-widget');
        projectLists.sort((a, b) => {
          if (a.updatedAt < b.updatedAt) {
            return 1;
          } else {
            return -1;
          }
        });
        projectLists = projectLists.filter(project => {
          return !project.hidden;
        });
        projectLists = projectLists.slice(0,4);
        let convertedProjectList = [];
        for (let i = 0; i < projectLists.length; i++){
          let convertedProject = {
            name: projectLists[i].name,
            channel: projectLists[i].id,
            thumbnailUrl: projectLists[i].thumbnailUrl,
            type: projectLists[i].projectType,
            updatedAt: projectLists[i].updatedAt
          };
          convertedProjectList.push(convertedProject);
        }
        ReactDOM.render(
          <Provider store={getStore()}>
            <ProjectWidget projectList={convertedProjectList}/>
          </Provider>,
          widget
        );
      });
    }
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
        <NewProjectButtons/>
      </ContentContainer>
    );
  }
});

export default ProjectWidget;
