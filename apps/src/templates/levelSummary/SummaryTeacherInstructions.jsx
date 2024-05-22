import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from './summary.module.scss';

const SummaryTeacherInstructions = ({scriptData}) => {
  const teacherMarkdown = scriptData.teacher_markdown;

  return (
    <div className={styles.summaryContainer}>
      {/* Teacher Instructions */}
      {teacherMarkdown && (
        <div>
          <h2>{i18n.forTeachersOnly()}</h2>

          <SafeMarkdown
            className={styles.markdown}
            markdown={teacherMarkdown}
          />
        </div>
      )}
    </div>
  );
};

SummaryTeacherInstructions.propTypes = {
  scriptData: PropTypes.object,
};

export default SummaryTeacherInstructions;
