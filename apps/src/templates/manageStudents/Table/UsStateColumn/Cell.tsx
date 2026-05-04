import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import React, {useCallback} from 'react';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {editStudent} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {CellProps} from './interface';

const Cell: React.FC<CellProps> = ({
  studentId,
  value,
  editedValue = '',
  isEditing = false,
}) => {
  const currentUser = useAppSelector(state => state.currentUser);
  const section = useAppSelector(state => selectedSectionSelector(state));
  const dispatch = useAppDispatch();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedUsState = event.target.value || null;

      dispatch(editStudent(studentId, {usState: selectedUsState}));

      analyticsReporter.sendEvent(EVENTS.SECTION_STUDENTS_TABLE_US_STATE_SET, {
        studentId: studentId || null,
        sectionId: section.id,
        sectionLoginType: section.loginType,
        teacherUsState: currentUser?.usStateCode,
        originalUsState: value,
        selectedUsState,
      });
    },
    [
      currentUser?.usStateCode,
      dispatch,
      section.id,
      section.loginType,
      studentId,
      value,
    ]
  );

  const items = [
    {value: '', text: ''},
    ...STATE_CODES.map(code => ({value: code, text: code})),
  ];

  return (
    <>
      {isEditing ? (
        <SimpleDropdown
          name="usState"
          labelText={i18n.usState()}
          isLabelVisible={false}
          size="s"
          items={items}
          selectedValue={editedValue}
          onChange={handleChange}
        />
      ) : (
        value
      )}
    </>
  );
};

export default Cell;
