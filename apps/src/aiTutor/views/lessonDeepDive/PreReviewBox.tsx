import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './pre-review-box.module.scss';

interface PreReviewBoxProps {
  focusTopic?: string;
  onNext: () => void;
}

const PreReviewBox: FC<PreReviewBoxProps> = ({focusTopic, onNext}) => (
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
