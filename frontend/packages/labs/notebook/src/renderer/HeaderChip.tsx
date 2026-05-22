/**
 * HeaderChip — save-status indicator for the notebook header.
 *
 * Idle state renders nothing. All other states display a small chip
 * that shows the current autosave status. The chip vanishes automatically
 * when the parent resets status back to 'idle' (no internal timer here).
 *
 * Reduced-motion: the `@media (prefers-reduced-motion: reduce)` rule in the sx
 * prop suppresses MUI transitions as a belt-and-suspenders measure on top of
 * MUI's built-in reduced-motion support.
 */

import {Box, Chip, CircularProgress} from '@mui/material';

import type {SaveStatus} from './useAutoSave';

/** Props for HeaderChip. */
interface HeaderChipProps {
  /** Current save status from useAutoSave. */
  status: SaveStatus;
}

/**
 * Renders the appropriate save-status chip for the given status.
 * Returns null when status is 'idle' so the chip takes no space.
 */
export function HeaderChip({status}: HeaderChipProps): React.ReactElement | null {
  if (status === 'idle') {
    return null;
  }

  if (status === 'saving') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <CircularProgress size={12} />
        <Box component="span" sx={{fontSize: '0.75rem'}}>
          Saving...
        </Box>
      </Box>
    );
  }

  if (status === 'saved') {
    return (
      <Chip
        label="Saved ✓"
        size="small"
        sx={{
          color: 'success.main',
          borderColor: 'success.main',
          fontSize: '0.75rem',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
        variant="outlined"
      />
    );
  }

  // status === 'error'
  return (
    <Chip
      label="Save error"
      size="small"
      sx={{
        color: 'error.main',
        borderColor: 'error.main',
        fontSize: '0.75rem',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
      variant="outlined"
    />
  );
}
