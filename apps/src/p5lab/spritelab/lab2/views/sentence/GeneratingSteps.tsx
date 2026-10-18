// What the model is doing while a picture is made: three steps that appear
// one after another, each ticked a moment later. The last tick waits for
// the picture.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import styles from './generating-steps.module.scss';

export const GENERATING_STEPS = [
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
}

const GeneratingSteps: React.FunctionComponent<GeneratingStepsProps> = ({
  done,
}) => (
  <ol className={styles.steps} aria-label="What the AI is doing">
    {GENERATING_STEPS.map((text, i) => {
      const last = i === GENERATING_STEPS.length - 1;
      const ticked = !last || done;
      return (
        <li
          key={text}
          className={styles.step}
          style={{animationDelay: `${i * STEP_DELAY_S}s`}}
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
                    : {animationDelay: `${i * STEP_DELAY_S + TICK_DELAY_S}s`}
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

export default GeneratingSteps;
