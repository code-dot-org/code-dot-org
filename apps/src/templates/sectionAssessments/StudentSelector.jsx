import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import {ALL_STUDENT_FILTER} from './sectionAssessmentsRedux';

import styles from './studentSelector.module.scss';

export default class StudentSelector extends Component {
  static propTypes = {
    studentList: PropTypes.array.isRequired,
    studentId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const {studentList, studentId, onChange} = this.props;

    // Convert studentList to SimpleDropdown format
    const dropdownItems = [
      {
        value: ALL_STUDENT_FILTER.toString(),
        text: i18n.allStudents(),
      },
      ...Object.values(studentList).map(student => ({
        value: student.id.toString(),
        text: student.name,
      })),
    ];

    return (
      <SimpleDropdown
        id="student-selector"
        name="student-selector"
        labelText={i18n.selectStudent()}
        isLabelVisible={false}
        selectedValue={studentId?.toString()}
        onChange={event => onChange(parseInt(event.target.value))}
        items={dropdownItems}
        size="s"
        className={styles.studentSelector}
        dropdownTextThickness="thin"
        color="gray"
      />
    );
  }
}
