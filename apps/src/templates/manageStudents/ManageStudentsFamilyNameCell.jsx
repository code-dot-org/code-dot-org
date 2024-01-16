import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {editStudent} from './manageStudentsRedux';
import {
  tableLayoutStyles,
  NAME_CELL_INPUT_WIDTH,
} from '../tables/tableConstants';

export default function ManageStudentFamilyNameCell({
  id,
  familyName,
  isEditing,
  editedValue,
  inputDisabled,
}) {
  const dispatch = useDispatch();

  const onChangeName = e => {
    // Avoid saving empty string to database; convert back to null if necessary
    const newValue = e.target.value || null;
    dispatch(editStudent(id, {familyName: newValue}));
  };

  // When the cell is disabled (i.e. for teacher accounts), the tooltip appears
  const tooltipId = inputDisabled ? _.uniqueId() : '';

  return (
    <div style={tableLayoutStyles.tableText}>
      {!isEditing && <div>{familyName}</div>}
      {isEditing && (
        <div>
          <span data-for={tooltipId} data-tip>
            <input
              name="uitest-family-name"
              style={styles.inputBox}
              // Because familyName is optional, allow empty string
              value={editedValue || ''}
              onChange={onChangeName}
              placeholder={i18n.familyName()}
              aria-label={i18n.familyName()}
              disabled={inputDisabled}
            />
            <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
              <div>{i18n.disabledForTeacherAccountsTooltip()}</div>
            </ReactTooltip>
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  inputBox: {
    width: NAME_CELL_INPUT_WIDTH,
  },
};

ManageStudentFamilyNameCell.propTypes = {
  id: PropTypes.number.isRequired,
  familyName: PropTypes.string,
  isEditing: PropTypes.bool,
  editedValue: PropTypes.string,
  inputDisabled: PropTypes.bool,
};
