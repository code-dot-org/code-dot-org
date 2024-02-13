import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import {ITEM_TYPE} from './ItemType';
import styles from './progress-table-legend.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function AssignmentCompletionStatesBox({
  hasValidatedLevels,
}) {
  // TO-DO (TEACH-800): Fix spacing on validated levels once width on page is set
  const legendIcons = () => {
    return (
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ITEM_TYPE.NOT_STARTED}
            labelText={i18n.notStarted()}
          />
          <LegendItem
            itemType={ITEM_TYPE.NO_ONLINE_WORK}
            labelText={i18n.noOnlineWork()}
          />
        </div>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ITEM_TYPE.IN_PROGRESS}
            labelText={i18n.inProgress()}
          />
          <LegendItem
            itemType={ITEM_TYPE.SUBMITTED}
            labelText={i18n.submitted()}
          />
        </div>
        {hasValidatedLevels && (
          <div className={styles.legendColumn}>
            <LegendItem
              itemType={ITEM_TYPE.VALIDATED}
              labelText={i18n.validated()}
            />
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
  hasValidatedLevels: PropTypes.bool,
};
