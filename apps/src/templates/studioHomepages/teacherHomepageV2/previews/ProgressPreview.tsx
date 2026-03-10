import React from 'react';

import styles from '../sectionPreview.module.scss';

const FAKE_STUDENTS = [
  'Alex Johnson',
  'Maria Garcia',
  'James Chen',
  'Sophia Williams',
  'Liam Patel',
];

// Each row is an array of color keys for the bubbles: 'green' | 'yellow' | 'gray'
type BubbleColor = 'green' | 'yellow' | 'gray';

const FAKE_PROGRESS: BubbleColor[][] = [
  ['green', 'green', 'green', 'yellow', 'green', 'gray', 'gray', 'gray'],
  ['green', 'green', 'yellow', 'green', 'gray', 'gray', 'gray', 'gray'],
  ['green', 'green', 'green', 'green', 'green', 'yellow', 'gray', 'gray'],
  ['green', 'yellow', 'green', 'gray', 'gray', 'gray', 'gray', 'gray'],
  ['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'gray'],
];

const LESSON_COUNT = 8;

const BUBBLE_STYLE_MAP: Record<BubbleColor, string> = {
  green: styles.bubbleGreen,
  yellow: styles.bubbleYellow,
  gray: styles.bubbleGray,
};

const ProgressPreview: React.FC = () => {
  return (
    <div className={styles.progressTable}>
      <div className={styles.studentColumn}>
        <div className={styles.studentHeader}>Students</div>
        <div className={styles.studentGrid}>
          {FAKE_STUDENTS.map(name => (
            <div key={name} className={styles.studentCell}>
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.lessonsArea}>
        <div className={styles.lessonsGrid}>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            {Array.from({length: LESSON_COUNT}, (_, i) => (
              <div key={i} className={styles.lessonHeader}>
                {i + 1}
              </div>
            ))}
          </div>
          {FAKE_STUDENTS.map((name, studentIdx) => (
            <div key={name} style={{display: 'flex', flexDirection: 'row'}}>
              {FAKE_PROGRESS[studentIdx].map((color, lessonIdx) => (
                <div key={lessonIdx} className={styles.lessonCell}>
                  <div
                    className={`${styles.progressBubble} ${BUBBLE_STYLE_MAP[color]}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPreview;
