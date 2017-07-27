import React from 'react';
import ProjectWidget from '@cdo/apps/templates/projects/ProjectWidget';
import $ from 'jquery';

const ProjectWidgetWithData = React.createClass({
  propTypes: {
    projectTypes: React.PropTypes.arrayOf(React.PropTypes.string),
    projectList: React.PropTypes.array
  },

  getInitialState() {
    return {
      isLoading: true,
      projectList: this.props.projectList || []
    };
  },

  componentWillMount() {
    if (this.state.projectList.length === 0) {
      $.ajax({
        method: 'GET',
        url: `/v3/channels`,
        dataType: 'json'
      }).done(projectList => {
        this.setState({isLoading: false, projectList: projectList});
      });
    } else {
      this.setState({isLoading: false});
    }
  },

  render() {
    return (
      <ProjectWidget
        projectList={this.state.projectList}
        projectTypes={this.props.projectTypes}
        isLoading={this.state.isLoading}
      />
    );
  }
});

export default ProjectWidgetWithData;
