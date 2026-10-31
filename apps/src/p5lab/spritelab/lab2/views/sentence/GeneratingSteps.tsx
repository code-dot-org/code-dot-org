// What the model is doing while a picture is made: three steps that appear
// one after another, each ticked a moment later. The last tick waits for
// the picture.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import styles from './generating-steps.module.scss';

const GENERATING_STEPS = [
  'Reading your prompt',
  'Using patterns in training data',
  'Predicting',
] as const;

// Seconds between one step appearing and the next.
const STEP_DELAY_S = 1.4;
// Seconds after a step appears before its tick.
const TICK_DELAY_S = 1;

interface GeneratingStepsProps {
  /** The picture is back: the last step gets its tick. */
  done: boolean;
  /** One step at a time, each replacing the last, instead of a growing
      list. */
  single?: boolean;
}

const LAST_STEP = GENERATING_STEPS.length - 1;

const GeneratingSteps: React.FunctionComponent<GeneratingStepsProps> = ({
  done,
  single,
}) => {
  // Single mode: the step on show moves on by the clock, and to the last
  // step as soon as the picture is back.
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!single || current >= LAST_STEP) {
      return;
    }
    const timer = setTimeout(() => setCurrent(c => c + 1), STEP_DELAY_S * 1000);
    return () => clearTimeout(timer);
  }, [single, current]);
  const shown = single
    ? [done ? LAST_STEP : current]
    : [...GENERATING_STEPS.keys()];
  return (
    <ol className={styles.steps} aria-label="What the AI is doing">
      {shown.map(i => {
        const text = GENERATING_STEPS[i];
        const last = i === LAST_STEP;
        const ticked = !last || done;
        return (
          <li
            key={text}
            className={styles.step}
            style={
              single ? undefined : {animationDelay: `${i * STEP_DELAY_S}s`}
            }
          >
            <span className={styles.mark}>
              {ticked && (
                <FontAwesomeV6Icon
                  iconName="check"
                  iconStyle="solid"
                  className={classNames(styles.check, last && styles.checkNow)}
                  style={
                    last
                      ? undefined
                      : {
                          animationDelay: `${
                            (single ? 0 : i * STEP_DELAY_S) + TICK_DELAY_S
                          }s`,
                        }
                  }
                  aria-hidden
                />
              )}
            </span>
            {text}
            {ticked && <span className={styles.srOnly}> (done)</span>}
          </li>
        );
      })}
    </ol>
  );
};

export default GeneratingSteps;
