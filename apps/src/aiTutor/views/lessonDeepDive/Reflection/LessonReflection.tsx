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
  <>
    <p className={styles.optionalLabel}>Optional</p>
    <div className={styles.freeResponseItem}>
      <p className={styles.questionLabel}>
        A moment I felt successful today...
      </p>
      <textarea
        id="reflection-success"
        className={styles.textArea}
        placeholder="Write something"
        value={success}
        onChange={e => onSuccessChange(e.target.value)}
      />
    </div>
    <div className={styles.freeResponseItem}>
      <p className={styles.questionLabel}>
        Something I&apos;m still confused about or working on...
      </p>
      <textarea
        id="reflection-struggle"
        className={styles.textArea}
        placeholder="Write something"
        value={struggle}
        onChange={e => onStruggleChange(e.target.value)}
      />
    </div>
  </>
);

export default LessonReflection;
