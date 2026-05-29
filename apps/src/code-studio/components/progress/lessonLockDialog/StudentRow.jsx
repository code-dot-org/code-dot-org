import PropTypes from 'prop-types';
import React from 'react';

import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import DemoChip from '@cdo/apps/templates/DemoChip';
import color from '@cdo/apps/util/color';

const StudentRow = ({
  index,
  name,
  lockStatus,
  isDemoStudent,
  handleRadioChange,
}) => {
  const radioChangeEvent = event => {
    const modifiedIndex = parseInt(event.target.name, 10);
    const lockStatus = event.target.value;
    handleRadioChange(modifiedIndex, lockStatus);
  };

  return (
    <tr>
      <td style={styles.tableCell}>
        {name}
        {isDemoStudent && <DemoChip />}
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Locked && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.Locked}
          checked={lockStatus === LockStatus.Locked}
          onChange={radioChangeEvent}
          disabled={isDemoStudent}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Editable && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.Editable}
          checked={lockStatus === LockStatus.Editable}
          onChange={radioChangeEvent}
          disabled={isDemoStudent}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.ReadonlyAnswers && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index}
          value={LockStatus.ReadonlyAnswers}
          checked={lockStatus === LockStatus.ReadonlyAnswers}
          onChange={radioChangeEvent}
          disabled={isDemoStudent}
        />
      </td>
    </tr>
  );
};

StudentRow.propTypes = {
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  lockStatus: PropTypes.oneOf(Object.values(LockStatus)).isRequired,
  isDemoStudent: PropTypes.bool,
  handleRadioChange: PropTypes.func.isRequired,
};

const styles = {
  tableCell: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10,
  },
  radioCell: {
    textAlign: 'center',
  },
  selectedCell: {
    backgroundColor: color.lightest_teal,
  },
};

export default StudentRow;
