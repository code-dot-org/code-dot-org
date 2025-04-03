import Button from '@code-dot-org/component-library/button';
import {Heading6} from '@code-dot-org/component-library/typography';
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
      <Heading6 className={styles.aiAnalysisNameColumn}>
        {i18n.loginExportHeader_studentName()}
      </Heading6>
      <Heading6 className={styles.aiAnalysisResponseColumn}>
        {i18n.studentResponse()}
      </Heading6>
      <Heading6 className={styles.aiAnalysisTagColumn}>
        {i18n.aiAnalysis()}
      </Heading6>
      <Heading6 className={styles.aiAnalysisReasoningColumn}>
        {i18n.details()}
      </Heading6>
      <Button
        onClick={() => {
          closeStudentResponses();
        }}
        color="white"
        size="xs"
        isIconOnly
        icon={{
          iconStyle: 'regular',
          iconName: 'xmark',
        }}
        type="primary"
      />
    </div>
  );
};

export default FreeResponseAiStudentResponseHeader;
