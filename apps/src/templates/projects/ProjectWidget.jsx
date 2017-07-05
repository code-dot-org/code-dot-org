import React, {PropTypes} from 'react';
import {personalProjectDataPropType} from './projectConstants';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';
import i18n from "@cdo/locale";

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
  },

  render() {
    return (
      <div>
        <h2>{i18n.projects()}</h2>
        {this.props.projectList.length > 0 &&
          <PersonalRecentProjects projectList={this.props.projectList} />
        }
        <NewProjectButtons />
      </div>
    );
  }
});

export default ProjectWidget;
