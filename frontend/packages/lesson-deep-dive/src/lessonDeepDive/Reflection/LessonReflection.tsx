import React, {FC} from 'react';

import styles from './reflection.module.scss';

interface LessonReflectionProps {
  success: string;
  struggle: string;
  onSuccessChange: (value: string) => void;
  onStruggleChange: (value: string) => void;
}

const LessonReflection: FC<LessonReflectionProps> = ({
  success,
  struggle,
  onSuccessChange,
  onStruggleChange,
}) => (
  <div className={styles.anythingElse}>
    <p className={styles.anythingElseLabel}>Anything else?</p>
    <div className={styles.textAreaGroup}>
      <div>
        <p className={styles.textAreaLabel}>
          A moment I felt successful today...
        </p>
        <textarea
          id="reflection-success"
          className={styles.textArea}
          placeholder="Optional"
          value={success}
          onChange={e => onSuccessChange(e.target.value)}
        />
      </div>
      <div>
        <p className={styles.textAreaLabel}>
          Something I&apos;m still confused about or working on...
        </p>
        <textarea
          id="reflection-struggle"
          className={styles.textArea}
          placeholder="Optional"
          value={struggle}
          onChange={e => onStruggleChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default LessonReflection;
