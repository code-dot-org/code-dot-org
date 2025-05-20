import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import color from '../../../../util/color';

import ModuleAssignment from './ModuleAssignment';

export default class EnrollmentUnitAssignment extends React.Component {
  static propTypes = {
    courseUnitData: PropTypes.object,
  };

  renderModuleAssignments() {
    if (this.props.courseUnitData.status === 'start_blocked') {
      return <div style={styles.comingSoonMessage}>Coming soon!</div>;
    } else {
      const moduleAssignments = this.props.courseUnitData.moduleAssignments.map(
        (moduleAssignment, i) => {
          return (
            <ModuleAssignment moduleAssignmentData={moduleAssignment} key={i} />
          );
        }
      );

      return <div>{moduleAssignments}</div>;
    }
  }

  render() {
    return (
      <div style={styles.courseUnitSection} className="course_unit_section">
        <a href={this.props.courseUnitData.link} className="course_unit_title">
          <div style={styles.courseUnitSectionHeader}>
            {this.props.courseUnitData['unitName']}
          </div>
        </a>
        {this.renderModuleAssignments()}
      </div>
    );
  }
}

const styles = {
  courseUnitSection: {
    border: '1px solid #bbbbbb',
    borderRadius: '5px',
    margin: '1em',
    padding: '1em',
    width: '400px',
  },
  courseUnitSectionHeader: {
    color: color.dark_charcoal,
    ...fontConstants['main-font-regular'],
    fontSize: '18px',
  },
  comingSoonMessage: {
    textAlign: 'center',
    fontSize: '16px',
    paddingTop: '20px',
    color: color.dark_charcoal,
  },
};
