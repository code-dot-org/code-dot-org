import React from 'react';

import {openDrawerToNav} from '@cdo/apps/aiTeacherDrawer/redux';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// Renders a fixed-position blue tab (matching the teacher panel's show-handle)
// that opens the TA drawer to the Teacher Panel tab when clicked.
// Shown in place of the floating teacher panel when the ta-teacher-panel
// experiment is active.
const TeacherPanelHandle: React.FC = () => {
  const dispatch = useAppDispatch();
  const chatIsOpen = useAppSelector(state => state.aiDiffChat.chatIsOpen);

  // The open drawer covers the handle rather than displacing it, which is what
  // makes it look slid over. Stay mounted so that reads as an animation, but
  // leave the accessibility tree, since a covered handle is not a way in.
  return (
    <div className="teacher-panel hidden" aria-hidden={chatIsOpen}>
      <div
        className="show-handle"
        onClick={() => dispatch(openDrawerToNav('Roster'))}
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
