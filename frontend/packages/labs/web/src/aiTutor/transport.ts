// Which transport answers the tutor.
//
// The dashboard's, unless the harness says otherwise. `main.tsx` — the
// standalone dev harness, which is not part of the library build — calls
// `useRecordedTutor()` before rendering, because it has started a mock API and
// there is no `/aichat_request` behind it.
//
// DECLARED RATHER THAN SNIFFED. The obvious alternative is to read
// `import.meta.env.VITE_API_MODE`, and it is wrong twice over: Vite does not
// expose shell variables there without a `.env` file, and whatever value it did
// have would be INLINED when this library is built — baking a decision about
// one build into every consumer of it. The harness is the thing that knows, so
// the harness is the thing that says.

import {
  DashboardTransport,
  FixtureTransport,
  parseTranscript,
  type TutorTransport,
} from '@code-dot-org/aitutor';
import {
  currentUserActions,
  type CurrentUserDefinition,
} from '@code-dot-org/users';

import demoTranscript from './demoTranscript.json';

let recorded: TutorTransport | undefined;

/**
 * Answer from the recording in `demoTranscript.json` instead of the dashboard.
 *
 * For a harness with no Rails behind it. The recording is written against the
 * demo project (`constants.DEFAULT_PROJECT`), so the accept/reject flow works
 * on real files: ask it to colour the heading and it rewrites `styles.css`.
 */
export const useRecordedTutor = (): void => {
  recorded = new FixtureTransport(parseTranscript(demoTranscript));
};

/**
 * Stand in for the signed-in student a dashboard would have described.
 *
 * The mock API has no users handler, so `currentUser` is empty and the tutor's
 * access rules read that — correctly — as no permission: the tab appears and
 * says a teacher has not enabled it. True to production and useless as a
 * harness, so the harness says who is looking.
 *
 * SEPARATE FROM THE TRANSPORT ON PURPOSE, though both are the same pretence.
 * A transport that also quietly granted access would be an access decision
 * hidden inside a network choice, and this is the one rule in the package worth
 * being unable to change by accident.
 */
export const pretendSignedInWithAiEnabled = (
  dispatch: (action: unknown) => void,
): void => {
  dispatch(
    currentUserActions.setInitialData({
      ai_chat_access_level: 'enabled',
    } as CurrentUserDefinition),
  );
};

export const tutorTransport = (): TutorTransport =>
  recorded ?? new DashboardTransport();
