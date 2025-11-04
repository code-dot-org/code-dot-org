import CloseButton from '@code-dot-org/component-library/closeButton';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './summary.module.scss';

interface FreeResponseAiStudentResponseHeaderProps {
  closeStudentResponses: () => void;
}

const FreeResponseAiStudentResponseHeader: React.FC<
  FreeResponseAiStudentResponseHeaderProps
> = ({closeStudentResponses}) => {
  return (
    <div className={styles.headerRow}>
      <Typography
        className={styles.aiAnalysisNameColumn}
        variant="h6"
        gutterBottom
      >
        {i18n.studentName()}
      </Typography>
      <Typography
        className={styles.aiAnalysisResponseColumn}
        variant="h6"
        gutterBottom
      >
        {i18n.studentResponse()}
      </Typography>
      <Typography
        className={styles.aiAnalysisTagColumn}
        variant="h6"
        gutterBottom
      >
        {i18n.aiAnalysis()}
      </Typography>
      <Typography
        className={styles.aiAnalysisReasoningColumn}
        variant="h6"
        gutterBottom
      >
        {i18n.details()}
      </Typography>
      <CloseButton
        id="ui-close-student-table"
        aria-label={i18n.closeTable()}
        onClick={closeStudentResponses}
      />
    </div>
  );
};

export default FreeResponseAiStudentResponseHeader;
