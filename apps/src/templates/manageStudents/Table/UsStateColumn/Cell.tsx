import React from 'react';
import {connect} from 'react-redux';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {editStudent} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {RootState} from '@cdo/apps/types/redux';

import {CellProps} from './interface';

const Cell: React.FC<CellProps> = ({
  studentId,
  value,
  editedValue = '',
  isEditing = false,
  // Provided by redux
  currentUser,
  section,
  editStudent,
}) => {
  const handleChange = (event: {target: {value: string}}) => {
    const selectedUsState = event.target.value || null;

    editStudent(studentId, {usState: selectedUsState});

    analyticsReporter.sendEvent(
      EVENTS.SECTION_STUDENTS_TABLE_US_STATE_SET,
      {
        studentId: studentId || null,
        sectionId: section.id,
        sectionLoginType: section.loginType,
        teacherUsState: currentUser?.usStateCode,
        originalUsState: value,
        selectedUsState,
      },
      PLATFORMS.STATSIG
    );
  };

  return (
    <>
      {isEditing ? (
        <select
          style={{width: 60, margin: 0}}
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

export default connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    section: selectedSectionSelector(state),
  }),
  dispatch => ({
    editStudent(id: number, studentData: {usState: string | null}) {
      dispatch(editStudent(id, studentData));
    },
  })
)(Cell);
