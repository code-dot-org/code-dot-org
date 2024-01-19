import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import styles from './section-progress-refresh.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import {VIEWED, NEEDS_FEEDBACK, FEEDBACK_GIVEN} from './IconKey';

export default function TeacherActionsBox({isViewingLevelProgress}) {
  const legendIcons = () => {
    if (isViewingLevelProgress) {
      return (
        <div className={styles.icons}>
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
              <LegendItem
                stateDescription={NEEDS_FEEDBACK}
                labelText={i18n.needsFeedback()}
              />
            </div>
            <div className={styles.legendItemContainer}>
              <LegendItem stateDescription={VIEWED} labelText={i18n.viewed()} />
            </div>
          </div>
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
              <LegendItem
                stateDescription={FEEDBACK_GIVEN}
                labelText={i18n.feedbackGiven()}
              />
            </div>
            <div className={styles.legendItemContainer}>
              <LegendItem
                fontAwesomeId="rotate-left"
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
                stateDescription={NEEDS_FEEDBACK}
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
      <div className={styles.headerContainer}>
        <StrongText>{i18n.teacherActions()}</StrongText>
      </div>
      <div>{legendIcons()}</div>
    </div>
  );
}

TeacherActionsBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
};
