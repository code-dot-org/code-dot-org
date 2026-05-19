import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './pre-skills-check.module.scss';

interface PreSkillsCheckProps {
  onKeepPracticing: () => void;
  onTestSkills: () => void;
}

const PreSkillsCheck: FC<PreSkillsCheckProps> = ({
  onKeepPracticing,
  onTestSkills,
}) => (
  <div className={styles.container}>
    <h2 className={styles.heading}>High five!</h2>
    <p className={styles.body}>
      {
        "You're well on your way to leveling up. Finish strong with a quick skill challenge to see what you learned."
      }
    </p>
    <div className={styles.buttons}>
      <button
        type="button"
        className={styles.outlineButton}
        onClick={onKeepPracticing}
      >
        Keep practicing
      </button>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={onTestSkills}
      >
        Test your skills
        <FontAwesomeV6Icon iconName="arrow-right" />
      </button>
    </div>
  </div>
);

export default PreSkillsCheck;
