import {Typography} from '@mui/material';
import React from 'react';

import {selectedAnswerLabel} from '../utils';

import styles from './free-response-answer.module.scss';

const FreeResponseAnswer: React.FunctionComponent<{
  answerText: string | null;
  isViewingStudent?: boolean;
}> = ({answerText, isViewingStudent}) => (
  <div className={styles.freeResponseAnswer}>
    <Typography variant="overline2" className={styles.freeResponseLabel}>
      {selectedAnswerLabel(isViewingStudent)}
    </Typography>
    {answerText ? (
      <Typography variant="body2" className={styles.freeResponseText}>
        {answerText}
      </Typography>
    ) : (
      <Typography variant="body2" className={styles.freeResponseEmpty}>
        No answer
      </Typography>
    )}
  </div>
);

export default FreeResponseAnswer;
