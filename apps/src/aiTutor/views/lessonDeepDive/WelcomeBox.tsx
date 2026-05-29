import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './welcome-box.module.scss';

interface WelcomeBoxProps {
  onNext?: () => void;
}

const WelcomeBox: FC<WelcomeBoxProps> = ({onNext}) => (
  <div className={styles.container}>
    <div className={styles.headline}>
      <span>{"Let's see how you"}</span>
      <div className={styles.wordWindow}>
        <div className={styles.wordTrack}>
          <div className={`${styles.word} ${styles.wordCoded}`}>coded</div>
          <div className={`${styles.word} ${styles.wordPrompted}`}>
            prompted
          </div>
          <div className={`${styles.word} ${styles.wordDebugged}`}>
            debugged
          </div>
          <div className={`${styles.word} ${styles.wordCreated}`}>created</div>
          <div className={`${styles.word} ${styles.wordPersisted}`}>
            persisted
          </div>
        </div>
      </div>
      <div className={styles.todayLine}>
        <span>today</span>
        <FontAwesomeV6Icon iconName={'sparkle'} />
      </div>
    </div>
    {onNext && (
      <button type="button" className={styles.letsGoButton} onClick={onNext}>
        {"Let's go"}
        <FontAwesomeV6Icon iconName={'arrow-right'} />
      </button>
    )}
  </div>
);

export default WelcomeBox;
