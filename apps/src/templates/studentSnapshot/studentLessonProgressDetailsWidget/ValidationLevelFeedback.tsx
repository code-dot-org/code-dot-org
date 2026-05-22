import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './studentLessonProgressDetailsWidget.module.scss';

const ValidationLevelFeedback: React.FC<{
  numUnpassedValidationLevels: number;
}> = ({numUnpassedValidationLevels}) => (
  <div className={styles.lessonDetail}>
    <div className={styles.validationLevelFeedback}>
      {numUnpassedValidationLevels > 0 && (
        <div className={styles.validationLevelCount}>
          <FontAwesomeV6Icon
            iconName={'triangle-exclamation'}
            iconStyle={'solid'}
          />
          <Typography variant="body3">{`${numUnpassedValidationLevels} ${
            numUnpassedValidationLevels > 1 ? 'tests' : 'test'
          } not passed`}</Typography>
        </div>
      )}
      <Typography variant="body4">
        {numUnpassedValidationLevels === 0
          ? 'There were no failed tests in this lesson.'
          : 'The app structure is correct, but key validation rules (e.g., form completion, value limits) were not implemented.'}
      </Typography>
    </div>
  </div>
);

export default ValidationLevelFeedback;
