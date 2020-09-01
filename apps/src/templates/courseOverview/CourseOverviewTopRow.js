import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from './resourceType';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import TeacherResourcesDropdown from '@cdo/apps/code-studio/components/progress/TeacherResourcesDropdown';

const styles = {
  main: {
    marginBottom: 10,
    position: 'relative'
  },
  dropdown: {
    display: 'inline-block'
  }
};

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    showAssignButton: PropTypes.bool
  };

  render() {
    const {id, resources, showAssignButton, sectionsForDropdown} = this.props;

    return (
      <div style={styles.main}>
        {resources.length > 0 && (
          <TeacherResourcesDropdown resources={resources} courseId={id} />
        )}
        <SectionAssigner
          sections={sectionsForDropdown}
          showAssignButton={showAssignButton}
          courseId={id}
        />
      </div>
    );
  }
}
