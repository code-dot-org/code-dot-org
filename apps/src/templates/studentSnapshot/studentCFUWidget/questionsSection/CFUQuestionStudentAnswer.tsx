import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CFULevel, CFULevelResponse, CFULevelType} from './../types';
import CFUFreeResponseAnswer from './answers/CFUFreeResponseAnswer';
import CFUMatchAnswer from './answers/CFUMatchAnswer';
import CFUMultiAnswer from './answers/CFUMultiAnswer';

import styles from './studentCFUWidgetQuestionsSection.module.scss';

interface CFUQuestionStudentAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
  isOpen: boolean;
  questionText?: string;
}

const CFUQuestionStudentAnswer: React.FC<CFUQuestionStudentAnswerProps> = ({
  level,
  response,
  isOpen,
  questionText,
}) => {
  const renderStudentAnswerByType = (type: CFULevelType) => {
    switch (type) {
      case 'Multi':
        return <CFUMultiAnswer level={level} response={response} />;
      case 'Match':
        return <CFUMatchAnswer level={level} response={response} />;
      case 'FreeResponse':
        return <CFUFreeResponseAnswer level={level} response={response} />;
      default:
        return (
          <Typography variant="body4">
            {/* TODO: Handle additional CFU level type: {type} */}"{type}
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
            {renderStudentAnswerByType(level.type)}
          </div>
        </>
      )}
    </div>
  );
};

export default CFUQuestionStudentAnswer;
