import React, { Component, PropTypes } from 'react';
import { dropdownStyles } from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import { ALL_STUDENT_FILTER } from './sectionAssessmentsRedux';

export default class StudentSelector extends Component {
  static propTypes = {
    studentList: PropTypes.array.isRequired,
    studentId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { studentList, studentId, onChange } = this.props;

    return (
      <div>
        <select
          value={studentId}
          onChange={event => onChange(parseInt(event.target.value))}
          style={dropdownStyles.dropdown}
        >
          <option
            key={ALL_STUDENT_FILTER}
            value={ALL_STUDENT_FILTER}
          >
            {"All students"}
          </option>
          {Object.values(studentList).map((student, index) => (
            <option
              key={student.id}
              value={student.id}
            >
              {student.name}
            </option>
            ))
          }
        </select>
      </div>
    );
  }
}
