import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem, {ITEM_TYPE} from './LegendItem';
import styles from './section-progress-refresh.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function AssignmentCompletionStatesBox({
  isViewingLevelProgress,
  hasValidatedLevels,
}) {
  // TO-DO (TEACH-800): Fix spacing on validated levels once width on page is set
  const legendIcons = () => {
    return (
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <div className={styles.legendItemContainer}>
            <LegendItem
              itemType={ITEM_TYPE.NOT_STARTED}
              labelText={i18n.notStarted()}
            />
          </div>
          <div className={styles.legendItemContainer}>
            <LegendItem
              itemType={ITEM_TYPE.NO_ONLINE_WORK}
              labelText={i18n.noOnlineWork()}
            />
          </div>
        </div>
        <div className={styles.legendColumn}>
          <div className={styles.legendItemContainer}>
            <LegendItem
              itemType={ITEM_TYPE.IN_PROGRESS}
              labelText={i18n.inProgress()}
            />
          </div>
          <div className={styles.legendItemContainer}>
            <LegendItem
              itemType={ITEM_TYPE.SUBMITTED}
              labelText={i18n.submitted()}
            />
          </div>
        </div>
        {isViewingLevelProgress && hasValidatedLevels && (
          <div className={styles.legendColumn}>
            <div className={styles.legendItemContainer}>
              <LegendItem
                itemType={ITEM_TYPE.VALIDATED}
                labelText={i18n.validated()}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.legend}>
      <StrongText className={styles.headerContainer}>
        {i18n.assignmentCompletionStates()}
      </StrongText>
      {legendIcons()}
    </div>
  );
}

AssignmentCompletionStatesBox.propTypes = {
  isViewingLevelProgress: PropTypes.bool,
  hasValidatedLevels: PropTypes.bool,
};
