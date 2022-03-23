import PropTypes from 'prop-types';
import React from 'react';
import ProjectWidget from '@cdo/apps/templates/projects/ProjectWidget';
import $ from 'jquery';

class ProjectWidgetWithData extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    projectList: PropTypes.array,
    canViewFullList: PropTypes.bool,
    canViewAdvancedTools: PropTypes.bool // Default: true
  };

  state = {
    isLoading: true,
    projectList: this.props.projectList || []
  };

  UNSAFE_componentWillMount() {
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
  }

  render() {
    const {canViewAdvancedTools, canViewFullList} = this.props;

    return (
      <ProjectWidget
        projectList={this.state.projectList}
        projectTypes={this.props.projectTypes}
        isLoading={this.state.isLoading}
        canViewFullList={canViewFullList}
        canViewAdvancedTools={canViewAdvancedTools}
      />
    );
  }
}

export default ProjectWidgetWithData;
