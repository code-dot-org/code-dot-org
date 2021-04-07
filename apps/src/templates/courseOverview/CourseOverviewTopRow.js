import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from './resourceType';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
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
    teacherResources: PropTypes.arrayOf(resourceShape),
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    showAssignButton: PropTypes.bool,
    useMigratedResources: PropTypes.bool.isRequired
  };

  render() {
    const {
      id,
      teacherResources,
      migratedTeacherResources,
      showAssignButton,
      sectionsForDropdown,
      useMigratedResources
    } = this.props;

    return (
      <div style={styles.main} className="course-overview-top-row">
        {((useMigratedResources && migratedTeacherResources.length > 0) ||
          (!useMigratedResources && teacherResources.length > 0)) && (
          <TeacherResourcesDropdown
            teacherResources={teacherResources}
            migratedTeacherResources={migratedTeacherResources}
            unitGroupId={id}
            useMigratedResources={useMigratedResources}
          />
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
