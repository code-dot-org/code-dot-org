import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponse, StatusBucket} from './../types';
import CFUQuestion from './CFUQuestion';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CfuQuestionsSectionsProps {
  cfuLevels: CFULevel[];
  cfuResponses: CFULevelResponse[];
  statusBuckets: StatusBucket[];
}

const CfuQuestionsSections: React.FC<CfuQuestionsSectionsProps> = ({
  cfuLevels,
  cfuResponses,
  statusBuckets,
}) => {
  const [openLevelId, setOpenLevelId] = React.useState<number | null>(null);

  const handleToggleLevel = (levelId: number) => {
    setOpenLevelId(prev => (prev === levelId ? null : levelId));
  };

  return (
    <div className={styles.studentCFUWidgetQuestionsSectionContainer}>
      <div className={styles.heading}>
        <Typography variant="body2">
          <strong>Level Details</strong>
        </Typography>
      </div>
      <div className={styles.questionsList}>
        {cfuLevels.map((level, i) => (
          <CFUQuestion
            level={level}
            key={level.id}
            response={cfuResponses[i]}
            statusBucket={statusBuckets[i]}
            isOpen={openLevelId === level.id}
            onToggle={() => handleToggleLevel(level.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CfuQuestionsSections;
