import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {ActivePrompt} from '../../redux/spriteLab2Redux';

import styles from './prompt-bar.module.scss';

const ANSWER_ID = 'spritelab2-prompt-answer';

interface PromptBarProps {
  prompt: ActivePrompt | null;
  onAnswer: (variableName: string, value: string) => void;
  disabled?: boolean;
}

/** The answer box for the "prompt user for variable" block. */
const PromptBar: React.FunctionComponent<PromptBarProps> = ({
  prompt,
  onAnswer,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');

  // If a new prompt comes in, clear the current answer, as it was meant for the previous question.
  useEffect(() => {
    setAnswer('');
  }, [prompt]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt || disabled) {
      return;
    }
    onAnswer(prompt.variableName, answer);
    setAnswer('');
  };

  return (
    <>
      {/* Mounted before any question, so each new one is announced; focus
          stays on the game. */}
      <span className={styles.srOnly} aria-live="polite">
        {prompt?.promptText}
      </span>
      {prompt && (
        <form className={styles.promptBar} onSubmit={handleSubmit}>
          {/* Use a manual label here so it doesn't get greyed out while disabled. */}
          <label htmlFor={ANSWER_ID} className={styles.question}>
            {prompt.promptText}
          </label>
          <TextField
            id={ANSWER_ID}
            name="spritelabPromptAnswer"
            size="s"
            className={styles.answerField}
            value={answer}
            autoComplete="off"
            disabled={disabled}
            onChange={event => setAnswer(event.target.value)}
          />
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            className={styles.submitButton}
            disabled={disabled}
          >
            Submit
          </MuiButton>
        </form>
      )}
    </>
  );
};

export default PromptBar;
