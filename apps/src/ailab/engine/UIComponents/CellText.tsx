import {Typography} from '@mui/material';
import React, {type ReactNode} from 'react';

import tableStyles from './dataTable.module.scss';

const CellText = ({children}: {children: ReactNode}) => (
  <Typography component="span" variant="body4" className={tableStyles.cellText}>
    {children}
  </Typography>
);

export default CellText;
