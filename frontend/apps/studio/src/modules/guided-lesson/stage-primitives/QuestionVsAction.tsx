import {useState} from 'react';

import styles from './stagePrimitives.module.scss';

/**
 * Misconception attacked: kids confuse the *question* block (`if path ahead`)
 * with the *action* block (`move forward`) — both look like blocks, so both
 * feel like "things the pegman does."
 *
 * Visualization: two blocks side-by-side with different SHAPES. The question
 * is an orange speech-bubble; the action is a teal arrow. The question
 * "speaks" yes/no. The action "moves." Student can hit Ask or Do to pull
 * the two jobs apart on demand.
 */

type Mode = 'idle' | 'ask' | 'do';
type Answer = 'yes' | 'no';

const QuestionVsAction = () => {
  const [mode, setMode] = useState<Mode>('idle');
  const [forcedAnswer, setForcedAnswer] = useState<Answer>('yes');

  const ask = () => {
    setMode('ask');
    setForcedAnswer(a => (a === 'yes' ? 'no' : 'yes'));
  };
  const doIt = () => setMode('do');
  const reset = () => setMode('idle');

  const showBubble = mode === 'ask' || mode === 'idle';
  const showAction = mode === 'do';
  const askMuted = mode === 'do';
  const doMuted = mode === 'ask';

  return (
    <div className={styles.host}>
      <h2 className={styles.headline}>One asks. One does.</h2>
      <p className={styles.subhead}>
        Look at the shapes. The orange block is a <strong>question</strong>.
        The teal block is an <strong>action</strong>.
      </p>

      <div className={styles.qaRow}>
        <div style={{position: 'relative'}}>
          <div
            className={`${styles.qaBubble} ${
              showBubble ? styles.qaBubbleVisible : ''
            }`}
          >
            {forcedAnswer.toUpperCase()}
          </div>
          <div
            className={`${styles.qaBlock} ${styles.qaAsk} ${
              askMuted ? styles.qaBlockMuted : ''
            } ${mode === 'ask' ? styles.qaBlockTilt : ''}`}
          >
            path ahead?
          </div>
          <div className={styles.qaLabel}>asks</div>
        </div>

        <div>
          <div
            className={`${styles.qaBlock} ${styles.qaDo} ${
              doMuted ? styles.qaBlockMuted : ''
            } ${showAction ? styles.qaBlockBoot : ''}`}
          >
            move forward
          </div>
          <div className={styles.qaLabel}>does</div>
        </div>
      </div>

      <div className={styles.controlRow}>
        <button type="button" className={styles.ctrlButton} onClick={ask}>
          Ask
        </button>
        <button type="button" className={styles.ctrlButton} onClick={doIt}>
          Do
        </button>
        <button type="button" className={styles.ctrlButton} onClick={reset}>
          Reset
        </button>
      </div>

      <div className={styles.controlRow} role="group" aria-label="Answer">
        <span className={styles.qaLabel} style={{margin: 0}}>
          Answer
        </span>
        <div className={styles.chipGroup}>
          {(['yes', 'no'] as const).map(v => (
            <button
              key={v}
              type="button"
              className={styles.chipBtn}
              aria-pressed={forcedAnswer === v}
              onClick={() => {
                setForcedAnswer(v);
                setMode('ask');
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionVsAction;
