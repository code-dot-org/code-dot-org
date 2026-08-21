// The demo page: pick a transcript, talk to it.
//
// Two panes, because the interesting part of a fixture-driven panel is the
// fixture. Seeing the transcript beside the conversation it produces is what
// makes a hand-written fixture reviewable — and writing one is how a lab team
// will describe the tutor behaviour they want before any of it exists.

import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AiTutorPanel} from '../components/AiTutorPanel';
import {TutorHeaderButtons} from '../components/TutorHeaderButtons';
import type {ProxyStatus} from '../dev/protocol';
import conversation from '../fixtures/conversation.json';
import failures from '../fixtures/failures.json';
import {promptsFor} from '../prompts/suggestedPrompts';
import {conversationCleared} from '../session/slice';
import {TutorProvider} from '../session/TutorContext';
import {
  DirectTransport,
  proxyStatus,
} from '../transport/direct/DirectTransport';
import {FixtureTransport} from '../transport/fixture/FixtureTransport';
import {parseTranscript} from '../transport/fixture/transcript';

import moduleStyles from './demo.module.scss';

const TRANSCRIPTS: Record<string, unknown> = {conversation, failures};

/** A project, stood in for. A real host would ask its editor. */
const PRETEND_PROJECT = {
  sourceCode: 'let x = 10;\ncircle(x, 50, 10);',
  longInstructions: 'Draw a row of circles.',
  hasRun: false,
};

/**
 * What this pretend lab can apply.
 *
 * A real host declares this from what its projects are made of; the demo
 * declares it so the accept/reject flow is reachable — the `conversation`
 * transcript's last turn is a rewrite of `main.js`.
 */
const PROPOSALS = {
  answerTypes: ['buildJavaScript', 'buildHTML', 'buildCSS', 'buildJSON'],
  fileTypes: ['js', 'html', 'css', 'json'],
};

/** The live option, listed beside the recordings when a key is present. */
const LIVE = 'live';

export const Demo = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState('conversation');

  // Asked once, before anything is sent. A live transport that fails on first
  // use looks like a broken tutor; a missing key should look like a missing
  // key (specs/PLAN.md §7).
  const [proxy, setProxy] = useState<ProxyStatus>();
  useEffect(() => {
    void proxyStatus().then(setProxy);
  }, []);

  // A new transport per choice, so switching starts the conversation over
  // rather than resuming one recording at another's turn count.
  const transport = useMemo(
    () =>
      name === LIVE
        ? new DirectTransport()
        : new FixtureTransport(parseTranscript(TRANSCRIPTS[name])),
    [name],
  );

  const choose = (next: string) => {
    setName(next);
    dispatch(conversationCleared());
  };

  // A real host would replace its project sources here and go read-only. The
  // demo has no project, so it says what it would have done.
  const [applied, setApplied] = useState<string>();

  const choices = [
    ...Object.keys(TRANSCRIPTS),
    ...(proxy?.available ? [LIVE] : []),
  ];

  return (
    <div className={moduleStyles.page}>
      <aside className={moduleStyles.side}>
        <h1 className={moduleStyles.title}>AI Tutor</h1>
        <p className={moduleStyles.note}>
          {name === LIVE
            ? `Live: ${proxy?.model} through the dev proxy. None of the
               moderation the dashboard applies is running.`
            : 'No server, no key. Every answer below comes from the transcript.'}
        </p>
        <div className={moduleStyles.picker}>
          {choices.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              className={key === name ? moduleStyles.chosen : undefined}
            >
              {key}
            </button>
          ))}
        </div>
        <pre className={moduleStyles.transcript}>
          {name === LIVE
            ? 'Answers come from the model. Nothing is scripted.'
            : JSON.stringify(TRANSCRIPTS[name], null, 2)}
        </pre>
        {applied && <p className={moduleStyles.note}>Host: {applied}</p>}
        {!proxy?.available && (
          <p className={moduleStyles.note}>
            Live answers: set <code>ANTHROPIC_API_KEY</code> and restart{' '}
            <code>yarn dev</code>.{proxy?.reason ? ` (${proxy.reason})` : ''}
          </p>
        )}
      </aside>
      <main className={moduleStyles.panel}>
        <TutorProvider
          transport={transport}
          context={() => PRETEND_PROJECT}
          prompts={promptsFor('level')}
          proposals={{
            ...PROPOSALS,
            onPropose: p =>
              setApplied(`applied ${p.files.map(f => f.path).join(', ')}`),
            onAccept: (p, description) =>
              setApplied(`kept ${p.files.length} file(s) as "${description}"`),
            onReject: () => setApplied('put the project back'),
          }}
        >
          {/*
            Where a lab puts them: the resource panel's header, beside the tab
            title. Here they sit above the panel so the demo exercises them.
          */}
          <div className={moduleStyles.header}>
            <TutorHeaderButtons />
          </div>
          <AiTutorPanel
            emptyState={
              <p className={moduleStyles.empty}>
                Ask something. The <code>failures</code> transcript answers to
                the words <code>profanity</code>, <code>pii</code>,{' '}
                <code>too large</code>, <code>timeout</code>, <code>rate</code>,{' '}
                <code>error</code> and <code>hang</code>.
              </p>
            }
          />
        </TutorProvider>
      </main>
    </div>
  );
};

export default Demo;
