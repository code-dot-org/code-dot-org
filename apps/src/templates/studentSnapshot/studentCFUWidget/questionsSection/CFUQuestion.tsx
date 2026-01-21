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
import CFUQuestionStudentAnswer from './CFUQuestionStudentAnswer';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

const questionTypeMap: Record<CFULevelType, string> = {
  Match: 'Matching',
  Multi: 'Multiple Choice',
  FreeResponse: 'Free Response',
};

interface CFUQuestionProps {
  level: CFULevel;
  response: CFULevelResponse;
  statusBucket: StatusBucket;
  isOpen: boolean;
  onToggle: () => void;
}

const CFUQuestion: React.FC<CFUQuestionProps> = ({
  level,
  response,
  statusBucket,
  isOpen,
  onToggle,
}) => (
  <div
    className={`${styles.cfuQuestionWrapper} ${
      isOpen ? styles.cfuQuestionWrapperOpen : ''
    }`}
  >
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
          <FontAwesomeV6Icon
            className={styles.cfuQuestionExpandIcon}
            iconName="angle-down"
          />
        </IconButton>
      </div>
    </div>
    {Array.isArray(level.question_text) ? (
      <>
        {level.question_text.map(questionText => (
          <CFUQuestionStudentAnswer
            key={questionText}
            level={level}
            response={response}
            questionText={questionText}
            isOpen={isOpen}
          />
        ))}
      </>
    ) : (
      <CFUQuestionStudentAnswer
        level={level}
        response={response}
        questionText={level.question_text || ''}
        isOpen={isOpen}
      />
    )}
  </div>
);

export default CFUQuestion;
