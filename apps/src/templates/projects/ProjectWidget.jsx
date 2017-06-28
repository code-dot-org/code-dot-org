import React, {PropTypes} from 'react';
import {projectDataPropType2} from './projectConstants';
import PersonalRecentProjects from './PersonalRecentProjects.jsx';
import NewProjectButtons from './NewProjectButtons.jsx';

const ProjectWidget = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(projectDataPropType2).isRequired
  },

  render() {
    return (
      <div>
        <h2>Projects</h2>
        {this.props.projectList.length > 0 &&
          <PersonalRecentProjects projectList={this.props.projectList} />
        }
        <NewProjectButtons />
      </div>
    );
  }
});

export default ProjectWidget;
