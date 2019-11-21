import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import {stringForType, resourceShape} from './resourceType';
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
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    showAssignButton: PropTypes.bool
  };

  render() {
    const {id, resources, showAssignButton, sectionsForDropdown} = this.props;

    return (
      <div style={styles.main}>
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
        <SectionAssigner
          sections={sectionsForDropdown}
          showAssignButton={showAssignButton}
          courseId={id}
        />
      </div>
    );
  }
}
