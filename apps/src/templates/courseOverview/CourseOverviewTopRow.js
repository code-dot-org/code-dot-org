import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape),
    showAssignButton: PropTypes.bool,
    isInstructor: PropTypes.bool
  };

  render() {
    const {
      id,
      courseOfferingId,
      courseVersionId,
      teacherResources,
      studentResources,
      showAssignButton,
      sectionsForDropdown,
      isInstructor
    } = this.props;

    return (
      <div style={styles.main} className="course-overview-top-row">
        {isInstructor && teacherResources.length > 0 && (
          <ResourcesDropdown resources={teacherResources} unitGroupId={id} />
        )}
        {isInstructor && (
          <SectionAssigner
            sections={sectionsForDropdown}
            showAssignButton={showAssignButton}
            courseId={id}
            buttonLocationAnalytics={'course-overview-top'}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
          />
        )}
        {!isInstructor && studentResources && studentResources.length > 0 && (
          <ResourcesDropdown
            resources={studentResources}
            unitGroupId={id}
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
