/**
 * AssignedRow — shows teacher-imported (assigned) notebooks.
 *
 * Filters the record list to entries whose `source` starts with `'import-'`
 * and renders an "Assigned" section heading followed by a list of notebooks.
 * An author chip is shown when the notebook metadata carries an author field.
 * Renders nothing when no matching records exist.
 */

import {Box, Chip, List, ListItem, ListItemButton, ListItemText, Typography} from '@mui/material';

import type {NotebookRecord} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for AssignedRow. */
export interface AssignedRowProps {
  /** Full list of the session's notebook records. */
  records: NotebookRecord[];
  /** Called with the notebookId when the user selects a notebook. */
  onOpen: (notebookId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the record was placed in this session via a teacher import.
 *
 * @param record - Record to test.
 * @returns True if `source` starts with `'import-'`.
 */
function isAssigned(record: NotebookRecord): boolean {
  return record.source.startsWith('import-');
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

/** Props for a single assigned notebook row. */
interface AssignedItemProps {
  /** Notebook record to display. */
  record: NotebookRecord;
  /** Propagated from AssignedRow. */
  onOpen: (notebookId: string) => void;
}

/**
 * Renders a single assigned notebook row with an optional author chip.
 */
function AssignedItem({record, onOpen}: AssignedItemProps): React.ReactElement {
  /** Handles list item activation by forwarding the notebookId. */
  function handleClick(): void {
    onOpen(record.notebookId);
  }

  const author = record.notebook.metadata.author;

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={resolveTitle(record)} />
        {author !== undefined && (
          <Chip label={author} size="small" variant="outlined" sx={{ml: 1}} />
        )}
      </ListItemButton>
    </ListItem>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the "Assigned" section: a list of teacher-imported notebooks.
 * Returns null when no imported notebooks are present.
 */
export function AssignedRow({
  records,
  onOpen,
}: AssignedRowProps): React.ReactElement | null {
  const assigned = records.filter(isAssigned);

  if (assigned.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assigned
      </Typography>
      <List disablePadding>
        {assigned.map(record => (
          <AssignedItem key={record.key} record={record} onOpen={onOpen} />
        ))}
      </List>
    </Box>
  );
}
