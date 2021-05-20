import PropTypes from 'prop-types';
import React from 'react';
import color from '../../../../util/color';
import EnrollmentUnitAssignment from './EnrollmentUnitAssignment';

export default class PlcEnrollment extends React.Component {
  static propTypes = {
    plcData: PropTypes.object
  };

  renderEnrollmentUnitAssignments() {
    const courseUnits = this.props.plcData['courseUnits'].map(
      (courseUnit, i) => {
        return <EnrollmentUnitAssignment key={i} courseUnitData={courseUnit} />;
      }
    );

    return <div style={styles.courseSection}>{courseUnits}</div>;
  }

  render() {
    return (
      <div>
        <a href={this.props.plcData['link']}>
          <div style={styles.courseSectionHeader}>
            {this.props.plcData['courseName']}
          </div>
        </a>
        {this.renderEnrollmentUnitAssignments()}
        <hr />
      </div>
    );
  }
}

const styles = {
  courseSection: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  courseSectionHeader: {
    color: color.dark_charcoal,
    fontFamily: '"Gotham 4r"',
    fontSize: '18px'
  }
};
