import React from 'react';

import {openDrawerToNav} from '@cdo/apps/aiTeacherDrawer/redux';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  createTeacherPanelCalloutSteps,
  recordTeacherPanelCalloutSeen,
  TEACHER_PANEL_CALLOUT_SEEN_LOCAL_KEY,
} from './teacherPanelCallout';

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
  const teacherPanelV2Seen = useAppSelector(
    state => state.currentUser.teacherPanelV2Seen
  );

  // An open drawer either covers the handle or, laid out inline, would leave it
  // stranded on top of the drawer; hide it in the second case. Either way it
  // stops being a way in, so it leaves the accessibility tree.
  const stranded = chatIsOpen && drawerIsInline;

  // Strictly false, not merely falsy: the flag is undefined until
  // /api/v1/users/current resolves, and showing a one-time callout before we
  // know whether it has already been seen would spend it. The drawer must also
  // not already be open over the handle the callout points at.
  const calloutAvailable = teacherPanelV2Seen === false && !chatIsOpen;

  const {tour} = useProductTour({
    getSteps: createTeacherPanelCalloutSteps,
    localStorageKey: TEACHER_PANEL_CALLOUT_SEEN_LOCAL_KEY,
    tourAvailable: calloutAvailable,
    onStart: recordTeacherPanelCalloutSeen,
  });
  useStartTourWhenAvailable(tour);

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
