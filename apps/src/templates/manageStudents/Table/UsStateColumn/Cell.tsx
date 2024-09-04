import React from 'react';
import {connect} from 'react-redux';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {editStudent} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

interface CellProps {
  id: number;
  value: string;
  editedValue: string;
  isEditing?: boolean;
  editStudent: (id: number, studentData: {usState: string | null}) => void;
}

const Cell: React.FC<CellProps> = ({
  id,
  value,
  editedValue = '',
  isEditing = false,
  // Provided by redux
  editStudent,
}) => {
  const handleChange = (event: {target: {value: string}}) => {
    editStudent(id, {usState: event.target.value || null});
  };

  return (
    <>
      {isEditing ? (
        <select
          style={{width: '100%', marginBottom: 0}}
          name="usState"
          value={editedValue}
          onChange={handleChange}
        >
          <option value="" />
          {STATE_CODES.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      ) : (
        value
      )}
    </>
  );
};

export default connect(null, dispatch => ({
  editStudent(id: number, studentData: {usState: string | null}) {
    dispatch(editStudent(id, studentData));
  },
}))(Cell);
