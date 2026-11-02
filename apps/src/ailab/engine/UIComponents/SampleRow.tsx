/* The first row of the selected dataset, one column per line. */
import {Typography} from '@mui/material';
import React from 'react';

import {useAppSelector} from '../hooks';
import {getData} from '../selectors';

import styles from './sampleRow.module.scss';

const SampleRow = () => {
  const row = useAppSelector(state => getData(state)[0]);

  return (
    <div className={styles.card}>
      <Typography component="h5" variant="label3" className={styles.heading}>
        Sample row
      </Typography>
      <dl className={styles.row}>
        {Object.entries(row).map(([column, value]) => (
          <div key={column} className={styles.cell}>
            <Typography component="dt" variant="body3">
              {column}
            </Typography>
            <Typography component="dd" variant="body3" className={styles.value}>
              {value}
            </Typography>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default SampleRow;
