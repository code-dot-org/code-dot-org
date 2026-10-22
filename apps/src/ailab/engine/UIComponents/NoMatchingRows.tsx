import {Typography} from '@mui/material';
import React from 'react';

import tableStyles from './dataTable.module.scss';

const NoMatchingRows = () => (
  <Typography variant="body4" component="p" className={tableStyles.emptyNote}>
    No rows match this filter.
  </Typography>
);

export default NoMatchingRows;
