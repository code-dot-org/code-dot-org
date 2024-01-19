import React from 'react';
import i18n from '@cdo/locale';
import LegendItem, {ITEM_TYPE} from './LegendItem';
import styles from './section-progress-refresh.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function LevelTypesBox() {
  return (
    <div className={styles.legend}>
      <StrongText className={styles.headerContainer}>
        {i18n.levelTypes()}
      </StrongText>
      <div className={styles.icons}>
        <div>
          <LegendItem
            itemType={ITEM_TYPE.ASSESSMENT_LEVEL}
            labelText={i18n.assessmentLevel()}
          />
        </div>
        <div>
          <LegendItem
            itemType={ITEM_TYPE.CHOICE_LEVEL}
            labelText={i18n.choiceLevel()}
          />
        </div>
      </div>
    </div>
  );
}
