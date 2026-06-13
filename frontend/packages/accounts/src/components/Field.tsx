import {Box} from '@mui/material';
import type {ReactNode} from 'react';

const FIELD_MAX_WIDTH = '30rem'; // 480px — readable cap; full-width on mobile

/** Fills the column up to a readable cap (DSCO fields are otherwise fixed at 300px). */
export default function Field({children}: {children: ReactNode}) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: FIELD_MAX_WIDTH,
        // Stretch the wrapper and the inner <input>: a TextField's input keeps a
        // fixed width otherwise, so it wouldn't match a dropdown's <select>.
        '&&& > *': {width: '100%', minWidth: 0},
        '&&& input': {width: '100%'},
      }}
    >
      {children}
    </Box>
  );
}
