import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import {editStudent} from './manageStudentsRedux';

function ManageStudentFamilyNameCell({id, familyName, isEditing, editedValue}) {
  const dispatch = useDispatch();

  const onChangeName = e => {
    // Avoid saving empty string to database; convert back to null if necessary
    const newValue = e.target.value || null;
    dispatch(editStudent(id, {familyName: newValue}));
  };

  return (
    <div>
      {!isEditing && <div>{familyName}</div>}
      {isEditing && (
        <div>
          <input
            id="uitest-family-name"
            style={styles.inputBox}
            // Because familyName is optional, allow empty string
            value={editedValue || ''}
            onChange={onChangeName}
            placeholder={i18n.familyName()}
            aria-label={i18n.familyName()}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  inputBox: {
    width: 225,
  },
};

ManageStudentFamilyNameCell.propTypes = {
  id: PropTypes.number.isRequired,
  familyName: PropTypes.string,
  isEditing: PropTypes.bool,
  editedValue: PropTypes.string,
};

export default ManageStudentFamilyNameCell;
