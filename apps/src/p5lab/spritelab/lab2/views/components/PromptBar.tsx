import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {ActivePrompt} from '../../redux/spriteLab2Redux';

import styles from './prompt-bar.module.scss';

const ANSWER_ID = 'spritelab2-prompt-answer';
const QUESTION_ID = 'spritelab2-prompt-question';

interface PromptBarProps {
  prompt: ActivePrompt | null;
  onAnswer: (variableName: string, value: string) => void;
  disabled?: boolean;
}

const PromptBar: React.FunctionComponent<PromptBarProps> = ({
  prompt,
  onAnswer,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');
  const lastPrompt = useRef(prompt);

  // Clear the answer if the prompt changes to a different question or variable.
  useEffect(() => {
    if (!prompt) {
      return;
    }
    const last = lastPrompt.current;
    lastPrompt.current = prompt;
    if (
      last?.promptText !== prompt.promptText ||
      last?.variableName !== prompt.variableName
    ) {
      setAnswer('');
    }
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
      {prompt?.choices && (
        <div
          role="group"
          aria-labelledby={QUESTION_ID}
          className={styles.promptBar}
        >
          <span id={QUESTION_ID} className={styles.question}>
            {prompt.promptText}
          </span>
          <div className={styles.choices}>
            {prompt.choices.map((choice, index) => (
              <MuiButton
                key={`${index}-${choice}`}
                type="button"
                variant="contained"
                color="primary"
                size="small"
                className={styles.choiceButton}
                disabled={disabled}
                onClick={() => onAnswer(prompt.variableName, choice)}
              >
                {choice}
              </MuiButton>
            ))}
          </div>
        </div>
      )}
      {prompt && !prompt.choices && (
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
            Send
          </MuiButton>
        </form>
      )}
    </>
  );
};

export default PromptBar;
