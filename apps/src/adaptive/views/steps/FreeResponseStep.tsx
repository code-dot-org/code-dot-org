// Displays a prompt and collects a free-text response from the student.
// Drafts are auto-saved to the progress store (localStorage) while typing,
// so a navigation or connection loss does not lose the student's work.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import AttemptCard from '../../../quiz/attempt/AttemptCard';
import {FreeResponseStep as FreeResponseStepContent} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import styles from './stepPlayer.module.scss';

interface FreeResponseStepProps {
  step: FreeResponseStepContent;
  continueLabel: string;
  onComplete: () => void;
}

const FreeResponseStep: React.FunctionComponent<FreeResponseStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const {stepContextMap, saveAnswers} = usePathwayContext();
  const saved = stepContextMap[step.id]?.answers?.[0]?.at(-1)?.text ?? '';
  const [text, setText] = useState(saved);
  const [submitted, setSubmitted] = useState(false);

  // Persist draft after 500 ms of inactivity. Skip the write when the text
  // matches what is already in the store so a mount with a restored value
  // does not write back unnecessarily.
  const persistedRef = useRef(saved);
  useEffect(() => {
    if (text === persistedRef.current) return;
    const timer = setTimeout(() => {
      saveAnswers(step.id, 0, [{answerId: '', text}]);
      persistedRef.current = text;
    }, 500);
    return () => clearTimeout(timer);
  }, [text, step.id, saveAnswers]);

  const handleSubmit = () => {
    // Flush the draft immediately rather than waiting for the debounce.
    saveAnswers(step.id, 0, [{answerId: '', text}]);
    persistedRef.current = text;
    setSubmitted(true);
    onComplete();
  };

  return (
    <div className={styles.freeResponseStep}>
      <MuiTypography variant="h2" className={styles.freeResponseHeading}>
        {step.title}
      </MuiTypography>
      <AttemptCard title={step.prompt}>
        <textarea
          className={styles.freeResponseTextarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={step.placeholder}
        />
      </AttemptCard>
      <div className={styles.freeResponseActions}>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
          disabled={text.trim().length === 0 || submitted}
          onClick={handleSubmit}
        >
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

export default FreeResponseStep;
