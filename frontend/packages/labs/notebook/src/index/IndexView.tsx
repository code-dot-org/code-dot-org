/**
 * IndexView — browsable library of all notebooks in the active session.
 *
 * Loads every record for the session on mount, then delegates to sub-components
 * for the three canonical rows (Continue, Assigned, Library) and an EmptyState
 * when no notebooks exist.  Import affordances (FilePicker, UrlImportDialog,
 * JoinCodeDialog) sit in a toolbar row at the top.
 *
 * On successful import the new record is appended to the local list and the
 * notebook is opened immediately via `onOpenNotebook`.
 */

import {useState, useEffect, useCallback} from 'react';
import {Box, Button, CircularProgress, SvgIcon, Typography} from '@mui/material';
import {useRequireSession} from '../session/sessionStore';
import {listForSession} from '../storage/notebookRepo';
import type {NotebookRecord} from '../storage/NotebookLabDB';
import type {ImportResult} from '../storage/importer';
import {ImportError} from '../storage/importer';
import {FilePicker} from '../dialogs/FilePicker';
import {UrlImportDialog} from '../dialogs/UrlImportDialog';
import {JoinCodeDialog} from '../dialogs/JoinCodeDialog';
import {ContinueRow} from './ContinueRow';

// ---------------------------------------------------------------------------
// Lazy sub-component imports — assumed provided by the parallel agent.
// ---------------------------------------------------------------------------

// AssignedRow, LibraryUnits, EmptyState are imported below.  They may not exist
// yet at the time this file is written; the parallel phase will provide them.
// Declared with `import type` to avoid hard compile-time failures when the
// parallel-agent files are absent; the runtime call will work once they land.
//
// The import is done as a direct (non-lazy) import because the spec requires
// these components to be present in Phase 8.  If the parallel agent has not yet
// merged, the TypeScript compiler error will be confined to those three symbols.

import {AssignedRow} from './AssignedRow';
import {LibraryUnits} from './LibraryUnits';
import {EmptyState} from './EmptyState';

// ---------------------------------------------------------------------------
// String constants (Phase 12: replace with useString() calls)
// ---------------------------------------------------------------------------

/** Page heading. */
const STR_PAGE_TITLE = 'My Notebooks';

/** Button label for opening UrlImportDialog. */
const STR_IMPORT_URL = 'Import URL';

/** Button label for opening JoinCodeDialog. */
const STR_JOIN_CODE = 'Join code';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * LinkIcon — inline SVG for the Import URL button.
 * Path data mirrors Material Design "link" icon.
 */
function LinkIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </SvgIcon>
  );
}

/**
 * GroupIcon — inline SVG for the Join code button.
 * Path data mirrors Material Design "group" icon.
 */
function GroupIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </SvgIcon>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for IndexView. */
export interface IndexViewProps {
  /** Called with the target notebookId when the user selects a notebook to open. */
  onOpenNotebook: (notebookId: string) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Appends a freshly imported record to an existing record list without mutation.
 *
 * @param prev - The current list of notebook records.
 * @param result - The import result carrying the new notebook and its id.
 * @param sessionId - The active session id, used to build the record key.
 * @returns A new array with the imported record appended.
 */
function appendImportedRecord(
  prev: NotebookRecord[],
  result: ImportResult,
  sessionId: string
): NotebookRecord[] {
  const record: NotebookRecord = {
    key: `${sessionId}::${result.notebookId}`,
    notebookId: result.notebookId,
    sessionId,
    notebook: result.notebook,
    created: Date.now(),
    lastModified: Date.now(),
    source: 'import-file',
  };
  return [...prev, record];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Props for the import toolbar. */
interface ImportToolbarProps {
  /** Active session id forwarded to each importer. */
  sessionId: string;
  /** Called after any successful import. */
  onImported: (result: ImportResult) => void;
  /** Called when an import error occurs. */
  onError: (err: ImportError) => void;
}

/**
 * Renders the row of import affordances: FilePicker, URL import, join code.
 */
function ImportToolbar({
  sessionId,
  onImported,
  onError,
}: ImportToolbarProps): React.ReactElement {
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  /** Opens the URL import dialog. */
  function handleOpenUrlDialog(): void {
    setUrlDialogOpen(true);
  }

  /** Closes the URL import dialog. */
  function handleCloseUrlDialog(): void {
    setUrlDialogOpen(false);
  }

  /** Opens the join code dialog. */
  function handleOpenJoinDialog(): void {
    setJoinDialogOpen(true);
  }

  /** Closes the join code dialog. */
  function handleCloseJoinDialog(): void {
    setJoinDialogOpen(false);
  }

  /**
   * Forwards a successful URL import to the parent callback then closes
   * the URL dialog.
   * @param result The completed import result.
   */
  function handleUrlImported(result: ImportResult): void {
    onImported(result);
    setUrlDialogOpen(false);
  }

  /**
   * Forwards a successful join-code import to the parent callback then closes
   * the join dialog.
   * @param result The completed import result.
   */
  function handleJoinImported(result: ImportResult): void {
    onImported(result);
    setJoinDialogOpen(false);
  }

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 2}}>
        <FilePicker
          sessionId={sessionId}
          onImported={onImported}
          onError={onError}
        />

        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={handleOpenUrlDialog}
        >
          {STR_IMPORT_URL}
        </Button>

        <Button
          variant="outlined"
          startIcon={<GroupIcon />}
          onClick={handleOpenJoinDialog}
        >
          {STR_JOIN_CODE}
        </Button>
      </Box>

      <UrlImportDialog
        open={urlDialogOpen}
        sessionId={sessionId}
        onClose={handleCloseUrlDialog}
        onImported={handleUrlImported}
      />

      <JoinCodeDialog
        open={joinDialogOpen}
        sessionId={sessionId}
        onClose={handleCloseJoinDialog}
        onImported={handleJoinImported}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Main notebook library index.
 *
 * Loads all session notebooks on mount and delegates rendering to the row
 * sub-components.  An EmptyState is shown while loading and replaced by the
 * real content once the async fetch resolves.
 */
export function IndexView({onOpenNotebook}: IndexViewProps): React.ReactElement {
  const session = useRequireSession();
  const [records, setRecords] = useState<NotebookRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all notebooks for the active session on mount.
  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      const all = await listForSession(session.id);
      if (!cancelled) {
        setRecords(all);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  /**
   * Appends the newly imported notebook to the record list and opens it.
   * @param result Import result from any of the three import affordances.
   */
  const handleImported = useCallback(
    (result: ImportResult): void => {
      setRecords(prev => appendImportedRecord(prev, result, session.id));
      onOpenNotebook(result.notebookId);
    },
    [session.id, onOpenNotebook]
  );

  /**
   * Surfaces an import error to the console.
   * Phase 12 will replace this with an in-page Snackbar.
   * @param err The ImportError from a failed import attempt.
   */
  function handleImportError(err: ImportError): void {
    // Intentional: surface to console until Phase 12 adds a Snackbar.
    console.error('[IndexView] import error', err.reason, err.message);
  }

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', px: 2, pt: 2, pb: 8, gap: 3}}>
      <Typography variant="h5">{STR_PAGE_TITLE}</Typography>

      <ImportToolbar
        sessionId={session.id}
        onImported={handleImported}
        onError={handleImportError}
      />

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ContinueRow records={records} onOpen={onOpenNotebook} />
          <AssignedRow records={records} onOpen={onOpenNotebook} />
          <LibraryUnits records={records} onOpen={onOpenNotebook} />
        </>
      )}
    </Box>
  );
}
