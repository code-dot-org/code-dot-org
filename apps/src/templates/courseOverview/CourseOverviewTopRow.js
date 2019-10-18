import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AssignToSection from './AssignToSection';
import Button from '@cdo/apps/templates/Button';
import {stringForType, resourceShape} from './resourceType';
import experiments from '@cdo/apps/util/experiments';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';

const styles = {
  main: {
    marginBottom: 10,
    position: 'relative'
  }
};

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsInfo: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    showAssignButton: PropTypes.bool
  };

  render() {
    const {sectionsInfo, id, title, resources, showAssignButton} = this.props;

    return (
      <div style={styles.main}>
        {!experiments.isEnabled(experiments.ASSIGNMENT_UPDATES) &&
          showAssignButton && (
            <AssignToSection
              sectionsInfo={sectionsInfo}
              courseId={id}
              assignmentName={title}
            />
          )}
        {resources.map(({type, link}) => (
          <Button
            key={type}
            style={{marginRight: 10}}
            text={stringForType[type]}
            href={link}
            target="blank"
            color={Button.ButtonColor.blue}
          />
        ))}
        {experiments.isEnabled(experiments.ASSIGNMENT_UPDATES) && (
          <SectionAssigner
            sections={sectionsInfo}
            showAssignButton={showAssignButton}
          />
        )}
      </div>
    );
  }
}
