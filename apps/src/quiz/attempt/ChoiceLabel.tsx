import {Typography} from '@mui/material';
import React from 'react';

import {formatChoiceLetter} from '../utils';

import styles from './choice-label.module.scss';

// A choice's letter and text, e.g. "B. A variable".
const ChoiceLabel: React.FunctionComponent<{
  index: number;
  text: string;
  className?: string;
}> = ({index, text, className}) => (
  <Typography variant="body2" component="span" className={className}>
    <span className={styles.letter}>{formatChoiceLetter(index)}.</span> {text}
  </Typography>
);

export default ChoiceLabel;
