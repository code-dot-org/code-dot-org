import {IconButton} from '@mui/material';
import classNames from 'classnames';
import {type ReactNode, useRef} from 'react';
import {flushSync} from 'react-dom';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useAppDispatch, useAppSelector} from '../hooks';
import {setPredictionStep} from '../redux';

import appStyles from '../app.module.scss';
import styles from './traceStepper.module.scss';

interface TraceStepperProps {
  step: number;
  stepLabels: ReactNode[];
}

const TraceStepper = ({step, stepLabels}: TraceStepperProps) => {
  const dispatch = useAppDispatch();
  const isStepping = useAppSelector(
    state => state.predictionStep !== undefined,
  );
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const lastStep = stepLabels.length - 1;

  // A button disabled while focused drops focus to the page, so hand it to the other one.
  const goTo = (index: number) => {
    flushSync(() => dispatch(setPredictionStep(index)));
    if (index === 0) {
      nextRef.current!.focus();
    } else if (index === lastStep) {
      previousRef.current!.focus();
    }
  };

  return (
    <div className={styles.stepper}>
      <div role="group" aria-label="Steps" className={styles.controls}>
        <IconButton
          ref={previousRef}
          variant="outlined"
          color="secondary"
          size="extraSmall"
          aria-label="Previous step"
          disabled={step <= 0}
          onClick={() => goTo(step - 1)}
        >
          <FontAwesomeV6Icon iconName="chevron-left" aria-hidden="true" />
        </IconButton>
        <span aria-hidden="true" className={styles.dots}>
          {stepLabels.map((_, index) => (
            <span
              key={index}
              className={classNames(styles.dot, {
                [styles.reachedDot]: index < step,
                [styles.currentDot]: index === step,
              })}
            />
          ))}
        </span>
        <IconButton
          ref={nextRef}
          variant="outlined"
          color="secondary"
          size="extraSmall"
          aria-label="Next step"
          disabled={step >= lastStep}
          onClick={() => goTo(step + 1)}
        >
          <FontAwesomeV6Icon iconName="chevron-right" aria-hidden="true" />
        </IconButton>
      </div>
      <span role="status" className={appStyles.visuallyHidden}>
        {isStepping && (
          <>
            Step {step + 1} of {stepLabels.length}: {stepLabels[step]}
          </>
        )}
      </span>
    </div>
  );
};

export default TraceStepper;
