import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import {ALL_STUDENT_FILTER} from './sectionAssessmentsRedux';

import styles from '@cdo/apps/templates/sectionProgress/unit-selector.module.scss';

export default class StudentSelector extends Component {
  static propTypes = {
    studentList: PropTypes.array.isRequired,
    studentId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const {studentList, studentId, onChange} = this.props;

    return (
      <div>
        <select
          value={studentId}
          onChange={event => onChange(parseInt(event.target.value))}
          className={styles.dropdown}
        >
          <option key={ALL_STUDENT_FILTER} value={ALL_STUDENT_FILTER}>
            {i18n.allStudents()}
          </option>
          {Object.values(studentList).map((student, index) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
