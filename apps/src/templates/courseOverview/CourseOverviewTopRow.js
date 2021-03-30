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
    migratedResources: PropTypes.arrayOf(PropTypes.object).isRequired,
    showAssignButton: PropTypes.bool,
    useMigratedResources: PropTypes.bool.isRequired
  };

  render() {
    const {
      id,
      resources,
      migratedResources,
      showAssignButton,
      sectionsForDropdown,
      useMigratedResources
    } = this.props;

    return (
      <div style={styles.main} className="course-overview-top-row">
        {resources.length > 0 && (
          <TeacherResourcesDropdown
            resources={resources}
            migratedResources={migratedResources}
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
