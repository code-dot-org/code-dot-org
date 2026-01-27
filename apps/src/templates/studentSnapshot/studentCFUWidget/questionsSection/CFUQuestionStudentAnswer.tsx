import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CFULevel, CFULevelResponse, CFUMultipleLevelAnswer} from './../types';
import CFUFreeResponseAnswer from './answers/CFUFreeResponseAnswer';
import CFUMatchAnswer from './answers/CFUMatchAnswer';
import CFUMultiAnswer from './answers/CFUMultiAnswer';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CFUQuestionStudentAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
  isOpen: boolean;
  isLevelGroupAnswer?: boolean;
  levelGroupLevelIndex?: number;
  questionText?: string;
}

const CFUQuestionStudentAnswer: React.FC<CFUQuestionStudentAnswerProps> = ({
  level,
  response,
  isOpen,
  isLevelGroupAnswer,
  levelGroupLevelIndex = 0,
  questionText,
}) => {
  const renderStudentAnswerByType = (level: CFULevel) => {
    let levelGroupResponseResponse;
    if (isLevelGroupAnswer) {
      const levelResults = response?.response?.level_results;
      if (
        Array.isArray(levelResults) &&
        levelGroupLevelIndex >= 0 &&
        levelGroupLevelIndex < levelResults.length
      ) {
        levelGroupResponseResponse = levelResults[levelGroupLevelIndex];
      }
    }
    const levelType =
      isLevelGroupAnswer && levelGroupResponseResponse
        ? levelGroupResponseResponse.type
        : level.type;

    const studentResponse =
      isLevelGroupAnswer && levelGroupResponseResponse
        ? levelGroupResponseResponse
        : response?.response;

    console.log(studentResponse);

    switch (levelType) {
      case 'Multi':
        return (
          <CFUMultiAnswer
            answers={
              (isLevelGroupAnswer
                ? level.answers?.[levelGroupLevelIndex]
                : level.answers || []) as CFUMultipleLevelAnswer[]
            }
            level={level}
            response={studentResponse}
          />
        );
      case 'Match':
        return <CFUMatchAnswer level={level} response={studentResponse} />;
      case 'FreeResponse':
        return <CFUFreeResponseAnswer response={studentResponse} />;
      default:
        return (
          <Typography variant="body4">
            {/* TODO: Handle additional CFU level type: {levelType} */}"
            {levelType}
            "&nbsp;Student answer placeholder
          </Typography>
        );
    }
  };

  return (
    <div className={styles.cfuQuestionStudentAnswer}>
      {isOpen && (
        <>
          <div className={styles.cfuQuestionStudentAnswerQuestion}>
            <Typography variant="body3">
              <strong>Question</strong>
            </Typography>
            <SafeMarkdown markdown={questionText} />
          </div>
          <div className={styles.cfuQuestionStudentAnswerContent}>
            <Typography variant="body3">
              <strong>Student Answer</strong>
            </Typography>
            {renderStudentAnswerByType(level)}
          </div>
        </>
      )}
    </div>
  );
};

export default CFUQuestionStudentAnswer;
