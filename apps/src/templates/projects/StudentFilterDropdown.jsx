import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import commonMsg from '@cdo/locale';

export const ALL_STUDENTS = '_all_students';

class StudentFilterDropdown extends Component {
  static propTypes = {
    onChangeStudent: PropTypes.func.isRequired,
    selectedStudent: PropTypes.string.isRequired,
    studentNames: PropTypes.array.isRequired,
    style: PropTypes.object
  };

  onChange(event) {
    const selectedStudent = event.target.value;
    this.props.onChangeStudent(selectedStudent);
  }

  render() {
    return (
      <span style={[styles.filterWrapper, this.props.style]}>
        <span style={styles.filterText}>{commonMsg.filterByStudent()}</span>
        &nbsp;
        <select
          value={this.props.selectedStudent}
          onChange={this.onChange.bind(this)}
          style={styles.filterSelect}
        >
          <option value={ALL_STUDENTS} key={ALL_STUDENTS}>
            {commonMsg.allStudents()}
          </option>
          {this.props.studentNames.map(studentName => (
            <option value={studentName} key={studentName}>
              {studentName}
            </option>
          ))}
        </select>
      </span>
    );
  }
}

const styles = {
  filterWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 14
  },
  filterSelect: {
    margin: 0,
    color: 'dimgray'
  },
  filterText: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

export default Radium(StudentFilterDropdown);
