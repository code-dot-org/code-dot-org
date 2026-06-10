import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './pre-review-box.module.scss';

interface PreReviewBoxProps {
  focusTopic?: string;
  // When the student rated every objective "Got it", they branch to the
  // challenge path instead of the practice path: different copy, and the button
  // sends them to the "Are you feeling..." challenge picker.
  allObjectivesConfident?: boolean;
  onNext: () => void;
}

const PreReviewBox: FC<PreReviewBoxProps> = ({
  focusTopic,
  allObjectivesConfident,
  onNext,
}) =>
  allObjectivesConfident ? (
    <div className={styles.container}>
      <h2 className={styles.heading}>{'Nice work.'}</h2>
      <p className={styles.body}>
        {"You've got every objective down. Ready to push further?"}
      </p>
      <button type="button" className={styles.button} onClick={onNext}>
        Choose a challenge
        <FontAwesomeV6Icon iconName="arrow-right" />
      </button>
    </div>
  ) : (
    <div className={styles.container}>
      <h2 className={styles.heading}>{"Let's get to work."}</h2>
      <p className={styles.body}>
        {focusTopic ? (
          <>
            {"Based on your reflection, we'll start with "}
            <strong>{focusTopic}</strong>
            {' You can explore any way you like from here.'}
          </>
        ) : (
          'You can explore any way you like from here.'
        )}
      </p>
      <button type="button" className={styles.button} onClick={onNext}>
        Choose how to practice
        <FontAwesomeV6Icon iconName="arrow-right" />
      </button>
    </div>
  );

export default PreReviewBox;
