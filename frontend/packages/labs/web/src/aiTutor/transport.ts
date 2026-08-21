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

export const tutorTransport = (): TutorTransport =>
  recorded ?? new DashboardTransport();
