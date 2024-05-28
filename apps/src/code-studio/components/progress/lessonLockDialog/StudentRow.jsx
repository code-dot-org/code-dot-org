import PropTypes from 'prop-types';
import React from 'react';

import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import color from '@cdo/apps/util/color';

const StudentRow = ({index, name, lockStatus, handleRadioChange}) => {
  const radioChangeEvent = event => {
    const modifiedIndex = parseInt(event.target.name, 10);
    const lockStatus = event.target.value;
    handleRadioChange(modifiedIndex, lockStatus);
  };

  return (
    <tr>
      <td style={styles.tableCell}>{name}</td>
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
        />
      </td>
    </tr>
  );
};

StudentRow.propTypes = {
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  lockStatus: PropTypes.oneOf(Object.values(LockStatus)).isRequired,
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
