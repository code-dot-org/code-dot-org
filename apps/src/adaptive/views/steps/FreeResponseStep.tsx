// Displays a prompt and collects a free-text response from the student.
// Saves the response to StepContext before advancing to the next step.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

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
  const {stepContextMap, updateStepContext} = usePathwayContext();
  const saved = stepContextMap[step.id]?.freeResponse ?? '';
  const [text, setText] = useState(saved);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    updateStepContext(step.id, {freeResponse: text});
    onComplete();
  };

  return (
    <div className={styles.freeResponseStep}>
      <MuiTypography variant="h2" tabIndex={-1} ref={headingRef}>
        {step.title}
      </MuiTypography>
      <div className={styles.freeResponseBody}>
        <MuiTypography variant="body1">{step.prompt}</MuiTypography>
        <textarea
          className={styles.freeResponseTextarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={step.placeholder}
          aria-label={step.prompt}
        />
      </div>
      <div className={styles.freeResponseActions}>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
          disabled={text.trim().length === 0}
          onClick={handleSubmit}
        >
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

export default FreeResponseStep;
