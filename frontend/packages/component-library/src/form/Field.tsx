import {Box} from '@mui/material';
import type {ReactNode} from 'react';

import moduleStyles from './field.module.scss';

/**
 * Layout wrapper for a single form control: fills the column up to a readable
 * cap and stretches the wrapped DSCO control (which is otherwise a fixed width)
 * to match. Purely presentational — pass any control as children.
 */
export default function Field({children}: {children: ReactNode}) {
  return <Box className={moduleStyles.field}>{children}</Box>;
}
