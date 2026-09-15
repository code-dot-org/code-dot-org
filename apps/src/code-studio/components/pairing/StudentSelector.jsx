import Chips from '@code-dot-org/component-library/chips';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {studentsShape} from './types';

import moduleStyles from './pairing.module.scss';

/**
 * A component for selecting one or more students in a section.
 */
export default function StudentSelector({
  students,
  selectedStudentIds,
  onSelectionChange,
  maxSelections,
}) {
  if (!students) {
    return null;
  }
  if (students.length === 0) {
    return <span>{i18n.noStudentsInSection()}</span>;
  }

  const options = students.map(student => ({
    value: String(student.id),
    label: student.name,
  }));

  const values = selectedStudentIds.map(String);

  return (
    <Chips
      name="pairingStudents"
      className={moduleStyles.studentChips}
      options={options}
      values={values}
      setValues={newValues => {
        if (newValues.length > maxSelections) return;
        onSelectionChange(newValues.map(Number));
      }}
    />
  );
}

StudentSelector.propTypes = {
  students: studentsShape,
  selectedStudentIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  maxSelections: PropTypes.number.isRequired,
};
