import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-legend.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import {ITEM_TYPE_SHAPE} from './ItemType';
import ProgressIcon from './ProgressIcon';

export default function LegendItem({itemType, labelText}) {
  return (
    <div className={styles.legendItem}>
      <ProgressIcon itemType={itemType} />
      <BodyThreeText className={styles.labelText}>{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  itemType: ITEM_TYPE_SHAPE,
};
