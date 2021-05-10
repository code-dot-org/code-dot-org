import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from './resourceType';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape),
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    studentResources: PropTypes.arrayOf(migratedResourceShape),
    showAssignButton: PropTypes.bool,
    useMigratedResources: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool
  };

  render() {
    const {
      id,
      teacherResources,
      migratedTeacherResources,
      studentResources,
      showAssignButton,
      sectionsForDropdown,
      useMigratedResources,
      isTeacher
    } = this.props;

    return (
      <div style={styles.main} className="course-overview-top-row">
        {isTeacher &&
          ((useMigratedResources && migratedTeacherResources.length > 0) ||
            (!useMigratedResources && teacherResources.length > 0)) && (
            <ResourcesDropdown
              resources={teacherResources}
              migratedResources={migratedTeacherResources}
              unitGroupId={id}
              useMigratedResources={useMigratedResources}
            />
          )}
        {isTeacher && (
          <SectionAssigner
            sections={sectionsForDropdown}
            showAssignButton={showAssignButton}
            courseId={id}
          />
        )}
        {!isTeacher && studentResources && studentResources.length > 0 && (
          <ResourcesDropdown
            migratedResources={studentResources}
            unitGroupId={id}
            useMigratedResources
            studentFacing
          />
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    marginBottom: 10,
    position: 'relative'
  },
  dropdown: {
    display: 'inline-block'
  }
};
