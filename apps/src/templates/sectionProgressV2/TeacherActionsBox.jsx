import React from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import {ITEM_TYPE} from './ItemType';
import LegendItem from './LegendItem';

import styles from './progress-table-legend.module.scss';

export default function TeacherActionsBox() {
  const legendIcons = () => (
    <div className={styles.icons}>
      <div className={styles.legendColumn}>
        <LegendItem
          itemType={ITEM_TYPE.NEEDS_FEEDBACK}
          labelText={i18n.needsFeedback()}
        />
        <LegendItem
          itemType={ITEM_TYPE.FEEDBACK_GIVEN}
          labelText={i18n.feedbackGiven()}
        />
      </div>
      <div className={styles.legendColumn}>
        <LegendItem
          itemType={ITEM_TYPE.KEEP_WORKING}
          labelText={i18n.markedAsKeepWorking()}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.legend}>
      <StrongText className={styles.headerContainer}>
        {i18n.teacherActions()}
      </StrongText>
      {legendIcons()}
    </div>
  );
}
