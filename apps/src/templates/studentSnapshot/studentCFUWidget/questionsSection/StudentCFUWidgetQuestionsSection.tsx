import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {IconButton, Typography} from '@mui/material';
import React from 'react';

import {statusBucketsMap} from './../common';
import {
  CFULevel,
  CFULevelResponse,
  CFULevelType,
  StatusBucket,
} from './../types';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CfuQuestionsSectionsProps {
  cfuLevels: CFULevel[];
  cfuResponses: CFULevelResponse[];
  statusBuckets: StatusBucket[];
}

const questionTypeMap: Record<CFULevelType, string> = {
  Match: 'Matching',
  Multi: 'Multiple Choice',
  FreeResponse: 'Free Response',
};

const CFUQuestion: React.FC<{
  level: CFULevel;
  response: CFULevelResponse;
  statusBucket: StatusBucket;
  isOpen: boolean;
  onToggle: () => void;
}> = ({level, response, statusBucket, isOpen, onToggle}) => (
  <div className={styles.cfuQuestionWrapper}>
    <div className={styles.cfuQuestionContainer}>
      <div className={styles.cfuQuestionLeftPart}>
        <div className={styles.levelNumber}>{level.level_position}</div>
        <div className={styles.cfuQuestionTypeContainer}>
          <Typography
            variant="overline3"
            className={styles.cfuQuestionAssessmentType}
          >
            Formative
          </Typography>
          <Typography variant="body2">
            {questionTypeMap[level.type] || level.type}
          </Typography>
        </div>
      </div>
      <div className={styles.cfuQuestionRightPart}>
        <Tags
          className={styles[`cfuStatusBucketTags-${statusBucket}`]}
          tagsList={[
            {
              label: statusBucketsMap[statusBucket].label,
              icon: {
                iconName: statusBucketsMap[statusBucket].iconName,
                placement: 'left',
              },
            },
          ]}
        />
        <IconButton size="small" onClick={onToggle}>
          <FontAwesomeV6Icon iconName={isOpen ? 'angle-up' : 'angle-down'} />
        </IconButton>
      </div>
    </div>
    {isOpen && (
      <div className={styles.cfuQuestionStudentAnswer}>
        <div>
          <Typography variant="body3">Question</Typography>
          <Typography variant="body4">{level.question_text}</Typography>
        </div>
        <div>
          <Typography variant="body3">Student Answer</Typography>
          <Typography variant="body4">
            {response?.response
              ? JSON.stringify(response.response.student_result)
              : 'No response submitted'}
          </Typography>
        </div>
      </div>
    )}
  </div>
);

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
