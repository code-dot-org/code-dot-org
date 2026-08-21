// The demo page: pick a transcript, talk to it.
//
// Two panes, because the interesting part of a fixture-driven panel is the
// fixture. Seeing the transcript beside the conversation it produces is what
// makes a hand-written fixture reviewable — and writing one is how a lab team
// will describe the tutor behaviour they want before any of it exists.

import {useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AiTutorPanel} from '../components/AiTutorPanel';
import conversation from '../fixtures/conversation.json';
import failures from '../fixtures/failures.json';
import {promptsFor} from '../prompts/suggestedPrompts';
import {conversationCleared} from '../session/slice';
import {TutorProvider} from '../session/TutorContext';
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

export const Demo = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState('conversation');

  // A new transport per transcript, so switching starts the conversation over
  // rather than resuming one recording at another's turn count.
  const transport = useMemo(
    () => new FixtureTransport(parseTranscript(TRANSCRIPTS[name])),
    [name],
  );

  const choose = (next: string) => {
    setName(next);
    dispatch(conversationCleared());
  };

  return (
    <div className={moduleStyles.page}>
      <aside className={moduleStyles.side}>
        <h1 className={moduleStyles.title}>AI Tutor</h1>
        <p className={moduleStyles.note}>
          No server, no key. Every answer below comes from the transcript.
        </p>
        <div className={moduleStyles.picker}>
          {Object.keys(TRANSCRIPTS).map(key => (
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
          {JSON.stringify(TRANSCRIPTS[name], null, 2)}
        </pre>
      </aside>
      <main className={moduleStyles.panel}>
        <TutorProvider
          transport={transport}
          context={() => PRETEND_PROJECT}
          prompts={promptsFor('level')}
        >
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
