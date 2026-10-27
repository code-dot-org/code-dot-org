import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {PromptType} from '@cdo/apps/p5lab/redux/spritelabInput';
import {SpritelabPrompt} from '@cdo/apps/types/redux';

import styles from './prompt-bar.module.scss';

interface PromptBarProps {
  /** The question at the head of the queue, if any. */
  prompt?: SpritelabPrompt;
  onAnswer: (variableName: string, value: string) => void;
}

/** The answer box for the "prompt user for variable" block. */
const PromptBar: React.FunctionComponent<PromptBarProps> = ({
  prompt,
  onAnswer,
}) => {
  const [answer, setAnswer] = useState('');
  const textPrompt = prompt?.promptType === PromptType.TEXT ? prompt : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!textPrompt) {
      return;
    }
    onAnswer(textPrompt.variableName, answer);
    setAnswer('');
  };

  return (
    <>
      {/* Mounted before any question, so each new one is announced; focus
          stays on the game. */}
      <span className={styles.srOnly} aria-live="polite">
        {textPrompt?.promptText}
      </span>
      {textPrompt && (
        <form className={styles.promptBar} onSubmit={handleSubmit}>
          <TextField
            name="spritelabPromptAnswer"
            label={textPrompt.promptText}
            size="s"
            className={styles.answerField}
            value={answer}
            autoComplete="off"
            onChange={event => setAnswer(event.target.value)}
          />
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            className={styles.submitButton}
          >
            Submit
          </MuiButton>
        </form>
      )}
    </>
  );
};

export default PromptBar;
