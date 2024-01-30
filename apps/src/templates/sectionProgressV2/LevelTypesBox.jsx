import React from 'react';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import {ICON_TYPE} from './IconType';
import styles from './progress-table-legend.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function LevelTypesBox() {
  return (
    <div className={styles.legend}>
      <StrongText className={styles.headerContainer}>
        {i18n.levelTypes()}
      </StrongText>
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ICON_TYPE.ASSESSMENT_LEVEL}
            labelText={i18n.assessmentLevel()}
          />
          <LegendItem
            itemType={ICON_TYPE.CHOICE_LEVEL}
            labelText={i18n.choiceLevel()}
          />
        </div>
      </div>
    </div>
  );
}
