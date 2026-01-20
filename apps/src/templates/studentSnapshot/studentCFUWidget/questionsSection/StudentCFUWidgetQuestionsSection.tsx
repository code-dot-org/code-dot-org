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
}> = ({level, response, statusBucket}) => (
  <div className={styles.cfuQuestionWrapper}>
    <div className={styles.cfuQuestionContainer}>
      <div className={styles.cfuQuestionLeftPart}>
        <div className={styles.levelNumber}>{1}</div>
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
        <IconButton>
          <FontAwesomeV6Icon iconName="angle-down" />
        </IconButton>
      </div>
    </div>
  </div>
);

const CfuQuestionsSections: React.FC<CfuQuestionsSectionsProps> = ({
  cfuLevels,
  cfuResponses,
  statusBuckets,
}) => {
  console.log(cfuLevels);
  console.log(cfuResponses);
  console.log(statusBuckets);
  return cfuLevels.length ? (
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
          />
        ))}
      </div>
    </div>
  ) : null;
};

export default CfuQuestionsSections;
