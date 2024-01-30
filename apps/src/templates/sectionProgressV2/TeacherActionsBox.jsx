import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import {ICON_TYPE} from './IconType';
import styles from './progress-table-legend.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function TeacherActionsBox({isViewingLevelProgress}) {
  const legendIcons = () =>
    isViewingLevelProgress ? (
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ICON_TYPE.NEEDS_FEEDBACK}
            labelText={i18n.needsFeedback()}
          />
          <LegendItem
            itemType={ICON_TYPE.FEEDBACK_GIVEN}
            labelText={i18n.feedbackGiven()}
          />
        </div>
        <div className={styles.legendColumn}>
          <LegendItem itemType={ICON_TYPE.VIEWED} labelText={i18n.viewed()} />
          <LegendItem
            itemType={ICON_TYPE.KEEP_WORKING}
            labelText={i18n.markedAsKeepWorking()}
          />
        </div>
      </div>
    ) : (
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ICON_TYPE.NEEDS_FEEDBACK}
            labelText={i18n.needsFeedback()}
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

TeacherActionsBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
};
