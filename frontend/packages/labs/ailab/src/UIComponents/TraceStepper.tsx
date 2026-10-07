/* Steps through a prediction's path through the decision tree. */
import {IconButton} from '@mui/material';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useAppDispatch, useAppSelector} from '../hooks';
import {setPredictionStep} from '../redux';
import {getPredictionStep} from '../selectors/visualizationSelectors';

import appStyles from '../app.module.scss';
import styles from './traceStepper.module.scss';

interface TraceStepperProps {
  stepLabels: string[];
}

const TraceStepper = ({stepLabels}: TraceStepperProps) => {
  const dispatch = useAppDispatch();
  const step = useAppSelector(getPredictionStep);
  const lastStep = stepLabels.length - 1;

  const goTo = (index: number) => {
    dispatch(setPredictionStep(index));
  };

  return (
    <div className={styles.stepper}>
      <div role="group" aria-label="Steps" className={styles.controls}>
        <IconButton
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
      <span className={appStyles.visuallyHidden}>
        {`Step ${step + 1} of ${stepLabels.length}: ${stepLabels[step]}`}
      </span>
    </div>
  );
};

export default TraceStepper;
