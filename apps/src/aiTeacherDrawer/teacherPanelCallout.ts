import {offset} from '@floating-ui/dom';
import {type StepOptions, type Tour} from 'shepherd.js';

import {doneButton} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import HttpClient from '@cdo/apps/util/HttpClient';

/**
 * One-time callout telling teachers where the teacher panel went. It shows
 * wherever the teacher panel handle does.
 *
 * Seen-ness lives on the user, not the browser: teacher_panel_v2_seen is a
 * serialized_attr on User, so a teacher who has dismissed this on one machine
 * does not meet it again on another. useProductTour still wants a localStorage
 * key, which serves as a same-browser backstop if the POST below never lands.
 */
export const TEACHER_PANEL_CALLOUT_SEEN_URL =
  '/api/v1/users/teacher_panel_v2_seen';

export const TEACHER_PANEL_CALLOUT_SEEN_LOCAL_KEY =
  'teacherPanelMovedToTaCalloutSeen';

export const TEACHER_PANEL_CALLOUT_TEXT =
  'The Teacher Panel is now part of Teaching Assistant! Open TA and go to ' +
  'Roster to see a list of students in your class section and view their work.';

/** Records the callout as seen for this teacher, on every device. */
export function recordTeacherPanelCalloutSeen(): void {
  HttpClient.post(TEACHER_PANEL_CALLOUT_SEEN_URL, undefined, true).catch(
    error =>
      console.error('Error recording teacher panel callout as seen:', error)
  );
}

export const createTeacherPanelCalloutSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'teacher-panel-moved-to-ta',
    attachTo: {element: '.teacher-panel .show-handle', on: 'left'},
    text: TEACHER_PANEL_CALLOUT_TEXT,
    buttons: [doneButton(tour)],
    floatingUIOptions: {
      middleware: [offset(12)],
    },
  },
];
