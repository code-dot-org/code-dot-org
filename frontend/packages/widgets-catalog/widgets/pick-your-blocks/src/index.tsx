import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GenericButton} from '@code-dot-org/component-library/button';
import Alert from '@code-dot-org/component-library/alert';
import {ITEMS, TOOLS, TAKEAWAY, ScenarioItem, ToolOption} from './data';
import {isToolCorrect} from './logic';
import './styles.css';

declare global {
  interface Window {
    McpApp?: {
      on: (event: string, handler: (input: any) => void) => void;
      connect: () => Promise<void>;
      reportSize: () => void;
      updateModelContext: (payload: {
        structuredContent: Record<string, unknown>;
      }) => void;
    };
  }
}

function reportSize() {
  if (window.McpApp?.reportSize) {
    window.requestAnimationFrame(() => window.McpApp!.reportSize());
  }
}

interface Answered {
  choice: ToolOption['id'];
  correct: boolean;
}

function App() {
  const [title, setTitle] = useState('Pick Your Blocks');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answered>>({});
  const [done, setDone] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const nextRowRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const completedFired = useRef(false);

  useEffect(() => {
    if (!window.McpApp) return;
    window.McpApp.on('toolInput', (input: any) => {
      setTitle((input && input.title) || title);
      restart();
    });
    window.McpApp.connect().then(() => reportSize());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reportSize();
    if (nextRowRef.current) {
      nextRowRef.current.querySelector('button')?.focus();
    } else if (choicesRef.current) {
      choicesRef.current.querySelector('button')?.focus();
    }
  }, [index, answers, done]);

  useEffect(() => {
    if (done && !completedFired.current) {
      completedFired.current = true;
      window.McpApp?.updateModelContext({
        structuredContent: {event: 'completed'},
      });
      announceLater('Activity complete.');
    }
  }, [done]);

  function announceLater(msg: string) {
    setLiveMessage('');
    window.setTimeout(() => setLiveMessage(msg), 30);
  }

  function restart() {
    setIndex(0);
    setAnswers({});
    setDone(false);
    completedFired.current = false;
  }

  function pick(item: ScenarioItem, choice: ToolOption['id']) {
    if (answers[item.id]) return;
    const correct = isToolCorrect(item, choice);
    setAnswers(prev => ({...prev, [item.id]: {choice, correct}}));
    window.McpApp?.updateModelContext({
      structuredContent: {
        event: 'answered',
        itemId: item.id,
        choice,
        correctAnswer: item.answer,
        correct,
        index,
        total: ITEMS.length,
      },
    });
    announceLater(correct ? 'Correct.' : 'Not quite.');
  }

  function goNext() {
    if (index < ITEMS.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  }

  const item = ITEMS[index];
  const answered = answers[item.id];

  return (
    <div className="pyb-wrap">
      <h1 className="pyb-title">{title}</h1>
      <p className="pyb-subtitle">Which tool fits the job?</p>
      <div
        className="pyb-progress-row"
        role="img"
        aria-label={`Progress: ${Object.keys(answers).length} of ${ITEMS.length} answered`}
      >
        {ITEMS.map(it => (
          <div
            key={it.id}
            className={'pyb-dot' + (answers[it.id] ? ' done' : '')}
          />
        ))}
      </div>

      {!done ? (
        <div className="pyb-card">
          <div className="pyb-emoji" aria-hidden="true">
            {item.emoji}
          </div>
          <p className="pyb-prompt">{item.text}</p>
          <div
            className="pyb-choices"
            role="group"
            aria-label="Pick a programming tool"
            ref={answered ? undefined : choicesRef}
          >
            {TOOLS.map(tool => (
              <GenericButton
                key={tool.id}
                text={`${tool.icon} ${tool.label}`}
                type={
                  answered && answered.choice === tool.id
                    ? 'primary'
                    : 'secondary'
                }
                onClick={() => pick(item, tool.id)}
              />
            ))}
          </div>
          {answered && (
            <>
              <div className="pyb-feedback-row">
                <span aria-hidden="true">{answered.correct ? '✅' : '🤔'}</span>
                <Alert
                  text={
                    answered.correct
                      ? item.feedbackCorrect
                      : item.feedbackIncorrect
                  }
                />
              </div>
              <div className="pyb-next-row" ref={nextRowRef}>
                <GenericButton
                  text={index === ITEMS.length - 1 ? 'See takeaway' : 'Next'}
                  type="primary"
                  onClick={goNext}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="pyb-card">
          <div className="pyb-takeaway-emoji" aria-hidden="true">
            🧰
          </div>
          <p className="pyb-takeaway-title">Nice picking!</p>
          <p className="pyb-takeaway-text">{TAKEAWAY}</p>
        </div>
      )}

      <div aria-live="polite" className="pyb-sr-only">
        {liveMessage}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
