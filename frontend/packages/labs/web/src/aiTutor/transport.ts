// Which transport answers the tutor.
//
// The dashboard's, unless the harness says otherwise. `main.tsx` — the
// standalone dev harness, which is not part of the library build — picks one
// before rendering, because it has started a mock API and there is no
// `/aichat_request` behind it.
//
// DECLARED RATHER THAN SNIFFED. The obvious alternative is to read
// `import.meta.env.VITE_API_MODE`, and it is wrong twice over: Vite does not
// expose shell variables there without a `.env` file, and whatever value it did
// have would be INLINED when this library is built — baking a decision about
// one build into every consumer of it. The harness is the thing that knows, so
// the harness is the thing that says.

import {
  DashboardTransport,
  DirectTransport,
  FixtureTransport,
  parseTranscript,
  proxyStatus,
  type TutorTransport,
} from '@code-dot-org/aitutor';

import demoTranscript from './demoTranscript.json';

let override: TutorTransport | undefined;

/** What the harness settled on, for it to say so on the page. */
export type HarnessTutor =
  | {kind: 'live'; model?: string}
  | {kind: 'recorded'; reason?: string};

/**
 * Pick a transport for a harness that has no Rails behind it.
 *
 * A real model when there is a key to reach one, and the recording otherwise.
 * Asked BEFORE anything renders, so the panel never offers a conversation it
 * cannot have — a tutor that fails on the first question looks broken, and a
 * missing key should look like a missing key.
 *
 * The key itself never reaches this file, or any file the browser loads: it
 * lives in the Vite dev server's node process, and `DirectTransport` posts to
 * that server's own origin (`@code-dot-org/aitutor/dev`). Start the harness
 * with one and the tutor answers for real:
 *
 *     ANTHROPIC_API_KEY=sk-... yarn dev
 */
export const chooseHarnessTutor = async (): Promise<HarnessTutor> => {
  const proxy = await proxyStatus();
  if (proxy.available) {
    override = new DirectTransport();
    return {kind: 'live', model: proxy.model};
  }
  // The recording is written against the demo project
  // (`constants.DEFAULT_PROJECT`), so the accept/reject flow still works on
  // real files: ask it to colour the heading and it rewrites `styles.css`.
  override = new FixtureTransport(parseTranscript(demoTranscript));
  return {kind: 'recorded', reason: proxy.reason};
};

export const tutorTransport = (): TutorTransport =>
  override ?? new DashboardTransport();
