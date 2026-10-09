import {IconButton, iconButtonClasses} from '@mui/material';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useAppDispatch} from '../hooks';
import {setPredictionStep} from '../redux';

import styles from './traceStepper.module.scss';

interface TraceStepperProps {
  step: number;
  stepCount: number;
}

const TraceStepper = ({step, stepCount}: TraceStepperProps) => {
  const dispatch = useAppDispatch();
  // aria-disabled, not disabled, so a button that reaches an end keeps focus.
  const atStart = step <= 0;
  const atEnd = step >= stepCount - 1;

  const goTo = (index: number) => {
    if (index >= 0 && index < stepCount) {
      dispatch(setPredictionStep(index));
    }
  };

  return (
    <div className={styles.stepper}>
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
