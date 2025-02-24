import {StrongText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {ITEM_TYPE} from './ItemType';
import LegendItem from './LegendItem';

import styles from './progress-table-legend.module.scss';

export default function AssignmentCompletionStatesBox() {
  const legendIcons = () => {
    return (
      <div className={styles.icons}>
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
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ITEM_TYPE.VALIDATED}
            labelText={i18n.validated()}
          />
          <LegendItem
            itemType={ITEM_TYPE.NO_ONLINE_WORK}
            labelText={i18n.noOnlineWork()}
          />
        </div>
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
