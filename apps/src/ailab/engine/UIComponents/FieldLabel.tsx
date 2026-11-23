/* Visible label for a Train panel field, with an info tooltip. */
import {Typography} from '@mui/material';
import React from 'react';

import InfoButton from './InfoButton';

import styles from './fieldLabel.module.scss';

interface FieldLabelProps {
  text: string;
  tooltip: string;
}

const FieldLabel = ({text, tooltip}: FieldLabelProps) => (
  <div className={styles.fieldLabel}>
    <Typography
      component="span"
      variant="body4"
      className={styles.text}
      aria-hidden="true"
    >
      {text}
    </Typography>
    <InfoButton about={text} tooltip={tooltip} />
  </div>
);

export default FieldLabel;
