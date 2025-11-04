import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import {ITEM_TYPE} from './ItemType';
import LegendItem from './LegendItem';

import styles from './progress-table-legend.module.scss';

export default function LevelTypesBox() {
  return (
    <div className={classNames(styles.legend, styles.levelTypes)}>
      <Typography className={styles.headerContainer} variant="strong">
        {i18n.levelTypes()}
      </Typography>
      <div className={styles.icons}>
        <div className={styles.legendColumn}>
          <LegendItem
            itemType={ITEM_TYPE.ASSESSMENT_LEVEL}
            labelText={i18n.assessmentLevel()}
          />
          <LegendItem
            itemType={ITEM_TYPE.CHOICE_LEVEL}
            labelText={i18n.choiceLevel()}
          />
        </div>
      </div>
    </div>
  );
}
