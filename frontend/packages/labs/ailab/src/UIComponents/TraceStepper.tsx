import {Button, IconButton, iconButtonClasses} from '@mui/material';
import classNames from 'classnames';
import {useCallback, useLayoutEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {prefersReducedMotion} from '../helpers/utils';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setPredictionStep} from '../redux';
import {getPredictionTrace} from '../selectors/visualizationSelectors';

import styles from './traceStepper.module.scss';

export const STEP_INTERVAL_MS = 1000;

interface TraceStepperProps {
  step: number;
  stepCount: number;
}

const TraceStepper = ({step, stepCount}: TraceStepperProps) => {
  const dispatch = useAppDispatch();
  const trace = useAppSelector(getPredictionTrace);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number>();
  const lastStep = stepCount - 1;
  // aria-disabled, not disabled, so a button that reaches an end keeps focus.
  const atStart = step <= 0;
  const atEnd = step >= lastStep;

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = undefined;
    setPlaying(false);
  }, []);

  const playFromStart = useCallback(() => {
    stop();
    dispatch(setPredictionStep(0));
    if (prefersReducedMotion()) {
      return;
    }
    setPlaying(true);
    let next = 0;
    timerRef.current = window.setInterval(() => {
      next++;
      dispatch(setPredictionStep(next));
      if (next >= lastStep) {
        stop();
      }
    }, STEP_INTERVAL_MS);
  }, [dispatch, lastStep, stop]);

  // Each new prediction plays its path; under reduced motion it shows the path whole.
  useLayoutEffect(() => {
    if (!prefersReducedMotion()) {
      playFromStart();
    }
    return stop;
  }, [trace, playFromStart, stop]);

  const goTo = (index: number) => {
    if (index >= 0 && index < stepCount) {
      stop();
      dispatch(setPredictionStep(index));
    }
  };

  return (
    <div className={styles.stepper}>
      {playing ? (
        <Button
          variant="outlined"
          color="secondary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="forward-step" />}
          aria-label="Skip to the answer"
          onClick={() => goTo(lastStep)}
        >
          Skip
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="play" />}
          aria-label="Replay from the start"
          onClick={playFromStart}
        >
          Replay
        </Button>
      )}
      <div role="group" aria-label="Steps" className={styles.controls}>
        <IconButton
          variant="outlined"
          color="secondary"
          size="extraSmall"
          aria-label="Previous step"
          aria-disabled={atStart}
          className={classNames({[iconButtonClasses.disabled]: atStart})}
          onClick={() => goTo(step - 1)}
        >
          <FontAwesomeV6Icon iconName="chevron-left" aria-hidden="true" />
        </IconButton>
        <span aria-hidden="true" className={styles.dots}>
          {Array.from({length: stepCount}, (_, index) => (
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
          variant="outlined"
          color="secondary"
          size="extraSmall"
          aria-label="Next step"
          aria-disabled={atEnd}
          className={classNames({[iconButtonClasses.disabled]: atEnd})}
          onClick={() => goTo(step + 1)}
        >
          <FontAwesomeV6Icon iconName="chevron-right" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
};

export default TraceStepper;
