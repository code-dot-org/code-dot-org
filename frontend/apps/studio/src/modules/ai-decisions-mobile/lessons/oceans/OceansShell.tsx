/**
 * OceansShell — mobile container for the @code-dot-org/oceans-lab component.
 *
 * The oceans-lab renders a fixed 1024×576 canvas.  This shell wraps it in a
 * Box that scales the canvas to fit 360pt mobile viewports via CSS max-width.
 */

import {Box} from '@mui/material';
import {type ComponentProps} from 'react';

import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

/** Prop types inferred from the OceansLab component. */
type OceansLabProps = ComponentProps<typeof OceansLab>;

export interface OceansShellProps extends OceansLabProps {
  /** CSS height for the container. Defaults to filling available space. */
  height?: string | number;
}

/**
 * Scales the OceansLab canvas to fit narrow viewports without overflow.
 */
export function OceansShell({
  height = '100%',
  ...oceansProps
}: OceansShellProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d47a1',
        '& canvas': {
          maxWidth: '100%',
          height: 'auto',
        },
      }}
    >
      <OceansLab {...oceansProps} />
    </Box>
  );
}
