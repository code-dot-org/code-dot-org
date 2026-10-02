import {Box} from '@mui/material';
import type {PropsWithChildren} from 'react';

/**
 * Full-height flex column for a lab route: fills below the header (offset
 * mirrors the root shell's header-height reserve) so the lab and its
 * navigation share the viewport, independent of the shared root layout
 * (which stays block so other routes, e.g. centered forms, are unaffected).
 */
export default function FullHeightLabFrame({children}: PropsWithChildren) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 50px)',
        // A `@code-dot-org/lab` lab renders inside ThemeProvider's
        // `<div data-theme>`, which would otherwise size to its content and
        // leave a full-height lab nothing to fill.
        '& > [data-theme]': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {children}
    </Box>
  );
}
