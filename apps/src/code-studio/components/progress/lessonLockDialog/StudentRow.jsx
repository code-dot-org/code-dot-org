import {RadioButton} from '@code-dot-org/component-library/radioButton';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import DemoChip from '@cdo/apps/templates/DemoChip';
import i18n from '@cdo/locale';

import styles from './student-row.module.scss';

// Accessible names for the radios; match the column headers rendered by
// LessonLockDialog.
const statusLabel = {
  [LockStatus.Locked]: () => i18n.locked(),
  [LockStatus.Editable]: () => i18n.editable(),
  [LockStatus.ReadonlyAnswers]: () => i18n.answersVisible(),
};

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

  const radioCell = status => (
    <td
      className={classNames(
        styles.tableCell,
        styles.radioCell,
        lockStatus === status && styles.selectedCell
      )}
    >
      <RadioButton
        className={styles.radio}
        name={String(index)}
        value={status}
        checked={lockStatus === status}
        onChange={radioChangeEvent}
        disabled={isDemoStudent}
        ariaLabel={statusLabel[status]()}
        size="s"
      />
    </td>
  );

  return (
    <tr>
      <td className={styles.tableCell}>
        {name}
        {isDemoStudent && <DemoChip />}
      </td>
      {radioCell(LockStatus.Locked)}
      {radioCell(LockStatus.Editable)}
      {radioCell(LockStatus.ReadonlyAnswers)}
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

export default StudentRow;
