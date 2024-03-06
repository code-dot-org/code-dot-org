import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-legend.module.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import {ITEM_TYPE_SHAPE} from './ItemType';
import ProgressIcon from './ProgressIcon';

export default function LegendItem({itemType, labelText, colorOverride}) {
  return (
    <div className={styles.legendItem}>
      <div className={styles.legendIcon}>
        <ProgressIcon itemType={itemType} colorOverride={colorOverride} />
      </div>
      <BodyThreeText className={styles.labelText}>{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  itemType: ITEM_TYPE_SHAPE,
};
