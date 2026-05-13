import {Typography} from '@mui/material';
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
      <Typography className={styles.labelText} variant="body3" gutterBottom>
        {labelText}
      </Typography>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  itemType: ITEM_TYPE_SHAPE,
};
