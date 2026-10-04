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
  // A drawer Lab2 hosts is laid out beside the lab, so unlike one that covers
  // the page it never reaches this handle, which is fixed to the viewport.
  const drawerIsInline = useAppSelector(
    state => !!state.aiDiffChat.hostedDrawerConfig
  );

  // An open drawer either covers the handle or, laid out inline, would leave it
  // stranded on top of the drawer; hide it in the second case. Either way it
  // stops being a way in, so it leaves the accessibility tree.
  const stranded = chatIsOpen && drawerIsInline;

  return (
    <div
      className="teacher-panel hidden"
      aria-hidden={chatIsOpen}
      style={stranded ? {visibility: 'hidden'} : undefined}
    >
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
