/**
 * ContinueRow — shows the three most-recently modified notebooks.
 *
 * Filters the full record list to the top 3 by `lastModified` descending and
 * renders a "Continue" section heading followed by one card per notebook.
 * Renders nothing when no records are provided.
 */

import {Box, Button, Card, CardContent, Typography} from '@mui/material';

import type {NotebookRecord} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ContinueRow. */
export interface ContinueRowProps {
  /** Full list of the session's notebook records. */
  records: NotebookRecord[];
  /** Called with the notebookId when the user presses "Continue". */
  onOpen: (notebookId: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of recent notebooks shown in the Continue strip. */
const MAX_RECENT = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Selects the top N most-recently-modified records, sorted descending by
 * `lastModified`.
 *
 * @param records - Full record list to filter and sort.
 * @param limit - Maximum number of records to return.
 * @returns Sliced array of the most-recently-modified records.
 */
function topRecent(records: NotebookRecord[], limit: number): NotebookRecord[] {
  return [...records]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, limit);
}

/**
 * Resolves the display title for a notebook record, falling back to
 * 'Untitled' when metadata carries no title.
 *
 * @param record - The notebook record to inspect.
 * @returns Human-readable title string.
 */
function resolveTitle(record: NotebookRecord): string {
  return record.notebook.metadata.title ?? 'Untitled';
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

/** Props for a single continue card entry. */
interface ContinueCardProps {
  /** Notebook record to display. */
  record: NotebookRecord;
  /** Propagated from ContinueRow. */
  onOpen: (notebookId: string) => void;
}

/**
 * Renders a single notebook card with a title and Continue button.
 */
function ContinueCard({record, onOpen}: ContinueCardProps): React.ReactElement {
  /** Handles the Continue button click by forwarding the notebookId. */
  function handleClick(): void {
    onOpen(record.notebookId);
  }

  return (
    <Card variant="outlined" sx={{minWidth: 200, flex: '0 0 auto'}}>
      <CardContent sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <Typography variant="subtitle1" noWrap>
          {resolveTitle(record)}
        </Typography>
        <Button variant="contained" size="small" onClick={handleClick}>
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the "Continue" section: a horizontal strip of the three most-recently
 * modified notebooks.  Returns null when the record list is empty.
 */
export function ContinueRow({
  records,
  onOpen,
}: ContinueRowProps): React.ReactElement | null {
  const recent = topRecent(records, MAX_RECENT);

  if (recent.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Continue
      </Typography>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto'}}>
        {recent.map(record => (
          <ContinueCard key={record.key} record={record} onOpen={onOpen} />
        ))}
      </Box>
    </Box>
  );
}
