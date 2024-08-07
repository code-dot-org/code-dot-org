import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {dropdownStyles} from '@cdo/apps/templates/sectionProgress/UnitSelector';
import i18n from '@cdo/locale';

import {ALL_STUDENT_FILTER} from './sectionAssessmentsRedux';

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
          style={dropdownStyles.dropdown}
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
