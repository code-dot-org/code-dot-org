/**
 * ChatPlaceholder — stub renderer for chat-format raw cells.
 *
 * AI chat features are not implemented in v1 of the Notebook Lab.  Any raw
 * cell tagged as a chat cell renders this component so the notebook displays
 * a readable notice rather than an empty region.
 */

import {Box, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ChatPlaceholder. */
export interface ChatPlaceholderProps {
  /**
   * Optional override message.
   * Defaults to the standard "not available in this version" notice.
   */
  message?: string;
}

// ---------------------------------------------------------------------------
// String constants
// ---------------------------------------------------------------------------

/** Default notice rendered when no custom message is provided. */
const DEFAULT_MESSAGE =
  'AI chat features are not available in this version.';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a muted notice in place of an unimplemented chat cell.
 * Matches the visual weight of other placeholder cells in CellList.
 */
export function ChatPlaceholder({
  message = DEFAULT_MESSAGE,
}: ChatPlaceholderProps): React.ReactElement {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.disabled" fontStyle="italic">
        {message}
      </Typography>
    </Box>
  );
}
