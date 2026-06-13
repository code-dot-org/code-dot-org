import {Box} from '@mui/material';
import type {ReactNode} from 'react';

// Comfortable cap for a single form field on tablet/desktop — wide enough for
// long names and emails, full-width on mobile.
const FIELD_MAX_WIDTH = '30rem'; // 480px

/**
 * Wraps a DSCO form field so it fills its column up to a readable max width
 * (full-width on mobile, capped above). DSCO fields are otherwise a fixed
 * 300px; `&&&` outweighs the component's own width class, and `minWidth: 0`
 * lets the field shrink below 300px on small screens.
 */
export default function Field({children}: {children: ReactNode}) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: FIELD_MAX_WIDTH,
        // Stretch the field wrapper AND the inner control: a TextField's <input>
        // keeps a fixed width otherwise, while a dropdown's <select> already
        // fills — so without this the two render at different widths.
        '&&& > *': {width: '100%', minWidth: 0},
        '&&& input': {width: '100%'},
      }}
    >
      {children}
    </Box>
  );
}
