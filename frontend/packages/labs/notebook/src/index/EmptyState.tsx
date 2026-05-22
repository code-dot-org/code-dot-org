/**
 * EmptyState — shown when seeding failed or the library is empty.
 *
 * Renders a centered message in a Box container.  The message defaults to
 * "Your notebooks will appear here." but can be overridden via props.
 */

import {Box, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default message shown when no custom message is provided. */
const DEFAULT_MESSAGE = 'Your notebooks will appear here.';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for EmptyState. */
export interface EmptyStateProps {
  /** Optional override for the displayed message. */
  message?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a centered empty-state message.
 * Used when seeding failed or the notebook library contains no records.
 */
export function EmptyState({message}: EmptyStateProps): React.ReactElement {
  const displayMessage = message ?? DEFAULT_MESSAGE;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {displayMessage}
      </Typography>
    </Box>
  );
}
