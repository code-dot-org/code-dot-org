import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import {stringForType, resourceShape} from './resourceType';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import i18n from '@cdo/locale';
import DropdownButton from '@cdo/apps/templates/DropdownButton';

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
          <div style={styles.dropdown}>
            <DropdownButton
              text={i18n.teacherResources()}
              color={Button.ButtonColor.blue}
            >
              {resources.map(({type, link}, index) => (
                <a key={index} href={link} target="_blank">
                  {stringForType[type]}
                </a>
              ))}
            </DropdownButton>
          </div>
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
