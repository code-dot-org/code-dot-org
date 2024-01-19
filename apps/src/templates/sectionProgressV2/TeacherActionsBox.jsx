import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem, {ITEM_TYPE} from './LegendItem';
import styles from './section-progress-refresh.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function TeacherActionsBox({isViewingLevelProgress}) {
  const legendIcons = () => {
    if (isViewingLevelProgress) {
      return (
        <div className={styles.icons}>
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
              <LegendItem
                itemType={ITEM_TYPE.NEEDS_FEEDBACK}
                labelText={i18n.needsFeedback()}
              />
            </div>
            <div className={styles.legendItemContainer}>
              <LegendItem
                itemType={ITEM_TYPE.VIEWED}
                labelText={i18n.viewed()}
              />
            </div>
          </div>
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
              <LegendItem
                itemType={ITEM_TYPE.FEEDBACK_GIVEN}
                labelText={i18n.feedbackGiven()}
              />
            </div>
            <div className={styles.legendItemContainer}>
              <LegendItem
                itemType={ITEM_TYPE.KEEP_WORKING}
                labelText={i18n.markedAsKeepWorking()}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="icons">
          <div>
            <div>
              <LegendItem
                itemType={ITEM_TYPE.NEEDS_FEEDBACK}
                labelText={i18n.needsFeedback()}
              />
            </div>
          </div>
        </div>
      );
    }
  };

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
