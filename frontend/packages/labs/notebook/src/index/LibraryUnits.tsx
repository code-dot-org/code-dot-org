/**
 * LibraryUnits — groups seeded sample notebooks by folder into expandable bands.
 *
 * Filters records to `source === 'seed'` then groups them by
 * `metadata.folder`.  Each group is rendered as a MUI Accordion with the unit
 * name (via unitName()) as the summary label.  The catch-all group for the
 * empty-string folder always appears last.
 */

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

import type {NotebookRecord} from '../storage/NotebookLabDB';

import {unitName} from './unitName';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for LibraryUnits. */
export interface LibraryUnitsProps {
  /** Full list of the session's notebook records. */
  records: NotebookRecord[];
  /** Called with the notebookId when the user selects a notebook. */
  onOpen: (notebookId: string) => void;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A named group of notebook records sharing the same folder path. */
interface FolderGroup {
  /** Raw folder path string from metadata.folder (may be empty). */
  folder: string;
  /** Ordered list of records belonging to this folder. */
  records: NotebookRecord[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sentinel value for the catch-all group that has no folder path. */
const CATCH_ALL_FOLDER = '';

/**
 * Resolves the display title for a notebook record.
 *
 * @param record - The notebook record to inspect.
 * @returns Human-readable title string, falling back to 'Untitled'.
 */
function resolveTitle(record: NotebookRecord): string {
  return record.notebook.metadata.title ?? 'Untitled';
}

/**
 * Returns true when the record originated from the seeded sample library.
 *
 * @param record - Record to test.
 * @returns True if `source === 'seed'`.
 */
function isSeeded(record: NotebookRecord): boolean {
  return record.source === 'seed';
}

/**
 * Groups an array of notebook records by their `metadata.folder` value.
 * Groups are ordered by first occurrence; the catch-all group (folder `''`)
 * is moved to the end so it always appears last in the rendered list.
 *
 * @param records - Seeded records to group.
 * @returns Ordered array of folder groups, catch-all last.
 */
function groupByFolder(records: NotebookRecord[]): FolderGroup[] {
  const map = new Map<string, NotebookRecord[]>();

  for (const record of records) {
    const folder = record.notebook.metadata.folder ?? CATCH_ALL_FOLDER;
    const existing = map.get(folder);
    if (existing !== undefined) {
      existing.push(record);
    } else {
      map.set(folder, [record]);
    }
  }

  const groups: FolderGroup[] = [];
  let catchAll: FolderGroup | undefined;

  for (const [folder, folderRecords] of map.entries()) {
    const group: FolderGroup = {folder, records: folderRecords};
    if (folder === CATCH_ALL_FOLDER) {
      catchAll = group;
    } else {
      groups.push(group);
    }
  }

  if (catchAll !== undefined) {
    groups.push(catchAll);
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Props for a single notebook list item inside an accordion. */
interface LibraryItemProps {
  /** Notebook record to display. */
  record: NotebookRecord;
  /** Propagated from LibraryUnits. */
  onOpen: (notebookId: string) => void;
}

/**
 * Renders a single notebook row inside a library accordion panel.
 */
function LibraryItem({record, onOpen}: LibraryItemProps): React.ReactElement {
  /** Handles row activation by forwarding the notebookId. */
  function handleClick(): void {
    onOpen(record.notebookId);
  }

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={resolveTitle(record)} />
      </ListItemButton>
    </ListItem>
  );
}

/** Props for a single folder accordion band. */
interface FolderAccordionProps {
  /** Folder group to render. */
  group: FolderGroup;
  /** Propagated from LibraryUnits. */
  onOpen: (notebookId: string) => void;
}

/**
 * Renders an expandable accordion band for one folder group.
 * The summary label is the human-readable unit name derived from the folder
 * path; the details panel contains the list of notebooks.
 */
function FolderAccordion({group, onOpen}: FolderAccordionProps): React.ReactElement {
  const label = unitName(group.folder);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            {/* ExpandMore path data (Material Design) */}
            <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          </svg>
        }
        aria-controls={`panel-${group.folder}-content`}
        id={`panel-${group.folder}-header`}
      >
        <Typography>{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List disablePadding>
          {group.records.map(record => (
            <LibraryItem key={record.key} record={record} onOpen={onOpen} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the "Library" section: one expandable accordion band per folder
 * group of seeded sample notebooks.  Returns null when no seeded records exist.
 */
export function LibraryUnits({
  records,
  onOpen,
}: LibraryUnitsProps): React.ReactElement | null {
  const seeded = records.filter(isSeeded);

  if (seeded.length === 0) {
    return null;
  }

  const groups = groupByFolder(seeded);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Library
      </Typography>
      {groups.map(group => (
        <FolderAccordion key={group.folder} group={group} onOpen={onOpen} />
      ))}
    </Box>
  );
}
