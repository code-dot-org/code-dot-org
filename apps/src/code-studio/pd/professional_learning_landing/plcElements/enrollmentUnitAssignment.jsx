import React from 'react';
import color from '../../../../util/color';
import ModuleAssignment from './moduleAssignment'

const styles = {
  courseUnitSection: {
    border: '1px solid #bbbbbb',
    borderRadius: '5px',
    margin: '1em',
    padding: '1em',
    width: '400px'
  },
  courseUnitSectionHeader: {
    color: color.dark_charcoal,
    fontFamily: '"Gotham 4r"',
    fontSize: '18px'
  }
}

const EnrollmentUnitAssignment = React.createClass({
  propTypes: {
    courseUnitData: React.PropTypes.object
  },

  renderModuleAssignments() {
    const moduleAssignments = this.props.courseUnitData['moduleAssignments'].map((moduleAssignment, i) => {
      return (
        <ModuleAssignment
          moduleAssignmentData={moduleAssignment}
          key={i}
        />
      )
    });

    return (
      <div>
        {moduleAssignments}
      </div>
    );
  },

  render() {
    return (
      <div style={styles.courseUnitSection}>
        <a href={this.props.courseUnitData.link}>
          <div style={styles.courseUnitSectionHeader}>
            {this.props.courseUnitData['unitName']}
          </div>
        </a>
        {this.renderModuleAssignments()}
      </div>
    )
  }
});

export default EnrollmentUnitAssignment;
