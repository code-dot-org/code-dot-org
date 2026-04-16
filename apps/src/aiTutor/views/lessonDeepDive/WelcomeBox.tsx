import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './welcome-box.module.scss';

const WelcomeBox: FC = () => (
  <div className={styles.container}>
    <p className={styles.sentence}>
      {"Let's see how you "}
      <span className={styles.wordWindow}>
        <span className={styles.wordTrack}>
          <span className={`${styles.word} ${styles.wordCoded}`}>coded</span>
          <span className={`${styles.word} ${styles.wordPrompted}`}>
            prompted
          </span>
          <span className={`${styles.word} ${styles.wordDesigned}`}>
            designed
          </span>
          <span className={`${styles.word} ${styles.wordDebated}`}>
            debated
          </span>
          <span className={`${styles.word} ${styles.wordCreated}`}>
            created
          </span>
          <span className={`${styles.word} ${styles.wordDebugged}`}>
            debugged
          </span>
          <span className={`${styles.word} ${styles.wordProblemSolved}`}>
            problem solved
          </span>
        </span>
      </span>
      <span className={styles.todayLine}>
        today
        <FontAwesomeV6Icon iconName={'sparkle'} />
      </span>
    </p>
  </div>
);

export default WelcomeBox;
