import {Button, IconButton, iconButtonClasses} from '@mui/material';
import classNames from 'classnames';
import {useCallback, useEffect, useLayoutEffect} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {prefersReducedMotion} from '../helpers/utils';
import {useAppDispatch, useAppSelector} from '../hooks';
import {
  playPredictionStep,
  setPredictionPlaying,
  stepPredictionByHand,
} from '../redux';

import styles from './traceStepper.module.scss';

export const STEP_INTERVAL_MS = 1000;

interface TraceStepperProps {
  step: number;
  stepCount: number;
  onReplay: () => void;
}

const TraceStepper = ({step, stepCount, onReplay}: TraceStepperProps) => {
  const dispatch = useAppDispatch();
  const playing = useAppSelector(state => state.predictionPlaying);
  const lastStep = stepCount - 1;
  // aria-disabled, not disabled, so a button that reaches an end keeps focus.
  const atStart = step <= 0;
  const atEnd = step >= lastStep;

  const play = useCallback(() => {
    dispatch(playPredictionStep(0));
    dispatch(setPredictionPlaying(true));
  }, [dispatch]);

  useLayoutEffect(() => {
    if (!prefersReducedMotion()) {
      play();
    }
  }, [play]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    let next = 0;
    const timer = window.setInterval(() => {
      next++;
      dispatch(playPredictionStep(next));
      if (next >= lastStep) {
        dispatch(setPredictionPlaying(false));
      }
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, lastStep, playing]);

  const replay = () => {
    onReplay();
    if (prefersReducedMotion()) {
      dispatch(stepPredictionByHand(0));
    } else {
      play();
    }
  };

  const skip = () => {
    dispatch(setPredictionPlaying(false));
    dispatch(playPredictionStep(lastStep));
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < stepCount) {
      dispatch(stepPredictionByHand(index));
    }
  };

  return (
    <div className={styles.stepper}>
      {playing ? (
        <Button
          variant="outlined"
          color="secondary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="forward-step" aria-hidden="true" />}
          aria-label="Skip to the answer"
          onClick={skip}
        >
          Skip
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="play" aria-hidden="true" />}
          aria-label="Replay from the start"
          onClick={replay}
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
