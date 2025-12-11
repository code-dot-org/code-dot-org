import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import commonMsg from '@cdo/locale';

import styles from './StudentFilterDropdown.module.scss';
import classNames from 'classnames';

export const ALL_STUDENTS = '_all_students';

class StudentFilterDropdown extends Component {
  static propTypes = {
    onChangeStudent: PropTypes.func.isRequired,
    selectedStudent: PropTypes.string.isRequired,
    studentNames: PropTypes.array.isRequired,
    style: PropTypes.object,
  };

  onChange(event) {
    const selectedStudent = event.target.value;
    this.props.onChangeStudent(selectedStudent);
  }

  render() {
    return (
      <span className={styles.filterWrapper} style={this.props.style}>
        <span className={styles.filterLabel}>
          <p className={styles.filterLabelText}>
            {commonMsg.filterByStudent()}
          </p>
        </span>
        <SimpleDropdown
          isLabelVisible={false}
          aria-label={commonMsg.filterByStudent()}
          dropdownTextThickness="thin"
          selectedValue={this.props.selectedStudent}
          onChange={this.onChange.bind(this)}
          size="s"
          name="students"
          items={[
            {
              value: ALL_STUDENTS,
              text: commonMsg.allStudents(),
            },
            ...this.props.studentNames.map(studentName => ({
              value: studentName,
              text: studentName,
            })),
          ]}
        />
      </span>
    );
  }
}

export default StudentFilterDropdown;
