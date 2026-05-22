/**
 * UnsupportedCell — fallback renderer for unrecognised cell types.
 *
 * CellList renders this for any cell_type not in the dispatch table and for
 * raw cells with an unrecognised format tag.  Surfacing the type string makes
 * it easier for curriculum authors to spot notebook format mismatches.
 */

import {Box, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for UnsupportedCell. */
export interface UnsupportedCellProps {
  /**
   * The cell_type value (or raw format tag) that was not recognised.
   * Displayed verbatim in the notice so authors can diagnose mismatches.
   */
  cellType: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a muted notice identifying the unrecognised cell type.
 * Matches the visual style of other placeholder cells in CellList so the
 * notebook layout is not disrupted by an unknown cell.
 */
export function UnsupportedCell({
  cellType,
}: UnsupportedCellProps): React.ReactElement {
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
      <Typography variant="body2" color="text.disabled">
        Unsupported cell type: {cellType}
      </Typography>
    </Box>
  );
}
