import {BodyThreeText} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React from 'react';

import {ITEM_TYPE_SHAPE} from './ItemType';
import ProgressIcon from './ProgressIcon';

import styles from './progress-table-legend.module.scss';

export default function LegendItem({itemType, labelText}) {
  return (
    <div className={styles.legendItem}>
      <div className={styles.legendIcon}>
        <ProgressIcon itemType={itemType} />
      </div>
      <BodyThreeText className={styles.labelText}>{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  itemType: ITEM_TYPE_SHAPE,
};
