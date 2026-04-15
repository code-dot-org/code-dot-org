import {Typography} from '@mui/material';
import React, {FC} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import styles from './lesson-summary-box.module.scss';

interface LessonSummaryBoxProps {
  lessonName: string;
  lessonSummary: string;
  levelsTotalCount: number;
}

const LessonSummaryBox: FC<LessonSummaryBoxProps> = ({
  lessonName,
  lessonSummary,
  levelsTotalCount,
}) => (
  <div className={styles.container}>
    <Typography
      variant="h2"
      sx={{fontSize: {xs: '1.5rem', sm: '2rem'}, color: '#ffffff'}}
    >
      {lessonName}
    </Typography>
    <br />
    <SafeMarkdown markdown={lessonSummary} />
    <div className={styles.levelCountSection}>
      <div
        className={styles.levelNumber}
        style={{'--target-count': levelsTotalCount} as React.CSSProperties}
      />
      <div className={styles.levelLabel}>levels in this lesson</div>
      <div className={styles.bubblesRow}>
        {Array.from({length: levelsTotalCount}, (_, i) => (
          <div
            key={i}
            className={styles.bubble}
            style={{animationDelay: `${0.8 + i * 0.05}s`}}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LessonSummaryBox;
