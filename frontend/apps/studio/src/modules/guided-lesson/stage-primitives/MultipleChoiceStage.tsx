import Markdown from 'markdown-to-jsx';
import {useEffect, useState} from 'react';

import {MARKDOWN_OPTIONS} from '@code-dot-org/ai-tutor';

import styles from './stagePrimitives.module.scss';

/**
 * The Big Question — quiz step rendered prominently on the stage instead of
 * cramped as chips inside the chat. Each option is a tall, tappable card
 * that students can read from across the room. After a pick, the option
 * highlights green/red and we call `onChoose` so the host can log turns and
 * (if correct) advance the lesson.
 *
 * Internal state tracks which ids have been picked so wrong picks
 * persistently mute and can't be re-picked, but right picks lock the row.
 * Resets whenever the *identity* of `options` changes (i.e., new step).
 */

export interface MultipleChoiceStageOption {
  id: string;
  label: string;
  isCorrect?: boolean;
}

interface Props {
  question: string;
  options: MultipleChoiceStageOption[];
  onChoose: (option: MultipleChoiceStageOption) => void;
}

const MultipleChoiceStage = ({question, options, onChoose}: Props) => {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setPicked(new Set());
    setResolved(false);
  }, [options]);

  const handleClick = (option: MultipleChoiceStageOption) => {
    if (resolved || picked.has(option.id)) return;
    setPicked(prev => new Set(prev).add(option.id));
    if (option.isCorrect) setResolved(true);
    onChoose(option);
  };

  return (
    <div className={styles.host}>
      <div className={styles.mcQuestionCard}>
        <span className={styles.mcEyebrow}>Quick check</span>
        <h2 className={styles.mcQuestion}>
          <Markdown options={MARKDOWN_OPTIONS}>{question}</Markdown>
        </h2>
      </div>

      <div className={styles.mcOptionList}>
        {options.map((option, idx) => {
          const isPicked = picked.has(option.id);
          const showCorrect = isPicked && option.isCorrect;
          const showWrong = isPicked && option.isCorrect === false;
          const disabled = resolved || isPicked;
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.mcOption} ${
                showCorrect ? styles.mcOptionCorrect : ''
              } ${showWrong ? styles.mcOptionWrong : ''}`}
              disabled={disabled}
              onClick={() => handleClick(option)}
            >
              <span className={styles.mcOptionMarker}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className={styles.mcOptionLabel}>
                <Markdown options={MARKDOWN_OPTIONS}>{option.label}</Markdown>
              </span>
            </button>
          );
        })}
      </div>

      {resolved && (
        <p className={styles.mcResolvedHint}>
          Nice! Read the chat for what comes next.
        </p>
      )}
    </div>
  );
};

export default MultipleChoiceStage;
