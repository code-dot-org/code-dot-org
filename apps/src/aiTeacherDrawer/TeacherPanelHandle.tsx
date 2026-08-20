import React from 'react';

import {openDrawerToNav} from '@cdo/apps/aiTeacherDrawer/redux';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

// Renders a fixed-position blue tab (matching the teacher panel's show-handle)
// that opens the TA drawer to the Teacher Panel tab when clicked.
// Shown in place of the floating teacher panel when the ta-teacher-panel
// experiment is active.
const TeacherPanelHandle: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="teacher-panel hidden">
      <div
        className="show-handle"
        onClick={() => dispatch(openDrawerToNav('Teacher Panel'))}
      >
        <FontAwesome
          icon="chevron-left"
          className=""
          title="Open teacher panel"
        />
      </div>
    </div>
  );
};

export default TeacherPanelHandle;
