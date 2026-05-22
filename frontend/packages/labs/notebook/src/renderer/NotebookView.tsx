/**
 * NotebookView — renders a single notebook document.
 *
 * Phase 3: shows the notebook title and a CellList.  Cell execution UI
 * and toolbar actions are deferred to Phase 5.
 *
 * Phase 8: adds an optional back button in the header area that invokes
 * `onBack` when provided, enabling index ↔ notebook navigation.
 *
 * Phase 10: adds a "Reset Globals" button in the header that clears all
 * user-defined Python globals.  Hidden during worker initialisation.
 *
 * Phase 11: adds lesson goal display and a dismissible completion banner.
 * CompletionProvider is expected to wrap this component's subtree (it is
 * added at the lab-root level).
 *
 * Phase 13: adds a Share button that opens ArtifactShareDialog so the
 * learner can share a completion artifact with their teacher.
 *
 * Phase 15: adds a globals icon button (curly-brace) in the header that
 * opens GlobalsDialog for per-notebook globals authoring.
 *
 * Phase 16: adds InputDialog for Python input() calls and a ResourcesDrawer
 * triggered by a paperclip icon button in the header.
 */

import {useState, useMemo} from 'react';
import {Box, Button, IconButton, SvgIcon, Typography} from '@mui/material';
import type {Notebook, Cell, LocalizedString} from '../storage/NotebookLabDB';
import {CellList} from '../cells/CellList';
import {useWorkerStatus, useResetGlobals, useRuntimeState, useRespondToInput} from '../runtime/runtimeStore';
import {LessonGoal} from './LessonGoal';
import {LessonComplete} from './LessonComplete';
import {useCompletion} from '../progress/completionStore';
import {ArtifactShareDialog} from '../artifact/ArtifactShareDialog';
import {GlobalsDialog} from '../dialogs/GlobalsDialog';
import {InputDialog} from '../dialogs/InputDialog';
import {ResourcesDrawer} from './ResourcesDrawer';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * ArrowBackIcon — inline SVG for the back button.
 * Path data mirrors Material Design "arrow_back" icon.
 * Replaces @mui/icons-material/ArrowBack which is not yet installed.
 */
function ArrowBackIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </SvgIcon>
  );
}

/**
 * ShareIcon — inline SVG for the share button.
 * Path data mirrors Material Design "share" icon.
 * Replaces @mui/icons-material/Share which is not yet installed.
 */
function ShareIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </SvgIcon>
  );
}

/**
 * PaperclipIcon — inline SVG for the resources drawer button.
 * Path data mirrors Material Design "attach_file" icon.
 * Replaces @mui/icons-material/AttachFile which is not yet installed.
 */
function PaperclipIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
    </SvgIcon>
  );
}

/**
 * GlobalsIcon — inline SVG curly-brace icon for the globals editor button.
 * Uses a simple "{}" text-based path to signal "variables / template".
 * Drawn as two mirrored curved paths forming left and right braces.
 */
function GlobalsIcon(): React.ReactElement {
  return (
    <SvgIcon viewBox="0 0 24 24">
      {/* Left brace: curves left at centre */}
      <path d="M7.5 4C6.1 4 5 5.1 5 6.5V10c0 .8-.7 1.5-1.5 1.5S2 10.8 2 10v-.5h1V10c0 .3.2.5.5.5S4 10.3 4 10V6.5C4 4.6 5.6 3 7.5 3H8v1h-.5z" />
      <path d="M7.5 20C6.1 20 5 18.9 5 17.5V14c0-.8-.7-1.5-1.5-1.5S2 13.2 2 14v.5h1V14c0-.3.2-.5.5-.5s.5.2.5.5v3.5C4 19.4 5.6 21 7.5 21H8v-1h-.5z" />
      {/* Right brace: curves right at centre */}
      <path d="M16.5 4C17.9 4 19 5.1 19 6.5V10c0 .8.7 1.5 1.5 1.5S22 10.8 22 10v-.5h-1V10c0 .3-.2.5-.5.5s-.5-.2-.5-.5V6.5C20 4.6 18.4 3 16.5 3H16v1h.5z" />
      <path d="M16.5 20C17.9 20 19 18.9 19 17.5V14c0-.8.7-1.5 1.5-1.5S22 13.2 22 14v.5h-1V14c0-.3-.2-.5-.5-.5s-.5.2-.5.5v3.5C20 19.4 18.4 21 16.5 21H16v-1h.5z" />
    </SvgIcon>
  );
}

/** Props for NotebookView. */
export interface NotebookViewProps {
  /** The notebook document to display. */
  notebook: Notebook;
  /** Stable notebook identifier for completion tracking and artifact payload. */
  notebookId: string;
  /** Active locale for i18n. */
  locale: string;
  /** Called when a cell's source changes (propagated to autosave). */
  onNotebookChange: (updated: Notebook) => void;
  /**
   * When provided, a back arrow button is rendered to the left of the title.
   * Clicking it calls this callback so the parent can navigate to the index.
   */
  onBack?: () => void;
  /**
   * Called when the student requests to open a different notebook by ID.
   * Used by the LessonComplete banner's "Next lesson →" button.
   */
  onOpenNotebook?: (notebookId: string) => void;
  /**
   * ID of the next notebook in the unit, forwarded to LessonComplete.
   * When null the "Next lesson →" button is not rendered.
   */
  nextNotebookId?: string | null;
  /**
   * Learner-chosen session label, forwarded to the artifact payload.
   * Needed by ArtifactShareDialog to build a complete CompletionArtifact.
   */
  sessionLabel: string;
}

// ---------------------------------------------------------------------------
// ResetGlobalsButton
// ---------------------------------------------------------------------------

/**
 * Small "Reset Globals" button shown in the notebook header.
 * Calls useResetGlobals() on click; hidden while the worker is initialising
 * since there is nothing to reset yet.
 */
function ResetGlobalsButton(): React.ReactElement | null {
  const workerStatus = useWorkerStatus();
  const resetGlobals = useResetGlobals();

  if (workerStatus === 'initializing' || workerStatus === 'uninitialized') {
    return null;
  }

  return (
    <Button
      variant="text"
      size="small"
      color="secondary"
      onClick={resetGlobals}
    >
      ↺ Reset Globals
    </Button>
  );
}

/**
 * Produces an updated notebook by replacing the source of a single cell.
 * All other cells and notebook-level metadata are preserved.
 * @param notebook Current notebook document
 * @param cellId Stable id of the cell whose source changed
 * @param newSource Replacement source lines
 * @returns Updated Notebook with the cell's source replaced
 */
function applySourceChange(
  notebook: Notebook,
  cellId: string,
  newSource: string[]
): Notebook {
  const updatedCells: Cell[] = notebook.cells.map(cell =>
    cell.id === cellId ? {...cell, source: newSource} : cell
  );
  return {...notebook, cells: updatedCells};
}

/**
 * Renders the header row: [back?] [title] [spacer] [ResetGlobals] [Globals] [Resources] [Share]
 * The back button is omitted when `onBack` is not provided.
 */
function NotebookHeader({
  title,
  onBack,
  onShare,
  onOpenGlobals,
  onOpenResources,
}: {
  /** Display title for the notebook. */
  title: string;
  /** Optional handler; when absent the back button is not rendered. */
  onBack?: () => void;
  /** Called when the learner taps the Share button. */
  onShare: () => void;
  /** Called when the author taps the globals (curly-brace) button. */
  onOpenGlobals: () => void;
  /** Called when the learner taps the paperclip/resources button. */
  onOpenResources: () => void;
}): React.ReactElement {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, pb: 1}}>
      {onBack !== undefined && (
        <IconButton
          aria-label="Back to notebooks"
          size="small"
          onClick={onBack}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <Typography variant="h5" sx={{flexGrow: 1}}>{title}</Typography>
      <ResetGlobalsButton />
      <IconButton
        aria-label="Edit variables"
        size="small"
        onClick={onOpenGlobals}
      >
        <GlobalsIcon />
      </IconButton>
      <IconButton
        aria-label="Resources"
        size="small"
        onClick={onOpenResources}
      >
        <PaperclipIcon />
      </IconButton>
      <IconButton
        aria-label="Share with teacher"
        size="small"
        onClick={onShare}
      >
        <ShareIcon />
      </IconButton>
    </Box>
  );
}

/**
 * Derives the list of runnable cell IDs from a notebook. A code cell is
 * runnable when its source is non-empty after joining and trimming.
 *
 * @param notebook Notebook document to inspect
 * @returns        Ordered array of runnable cell IDs
 */
function deriveRunnableCellIds(notebook: Notebook): string[] {
  return notebook.cells
    .filter(
      cell =>
        cell.cell_type === 'code' &&
        (cell.source ?? []).join('').trim() !== ''
    )
    .map(cell => cell.id);
}

/**
 * Renders the dismissible completion banner when the lesson is complete and
 * the student has not dismissed it in this session.
 */
function CompletionBanner({
  notebookId,
  runnableCellIds,
  notebook,
  nextNotebookId,
  locale,
  onOpenNotebook,
  onBack,
}: {
  notebookId: string;
  runnableCellIds: string[];
  notebook: Notebook;
  nextNotebookId: string | null | undefined;
  locale: string;
  onOpenNotebook: ((id: string) => void) | undefined;
  onBack: (() => void) | undefined;
}): React.ReactElement | null {
  const [dismissed, setDismissed] = useState(false);
  const completion = useCompletion(notebookId, runnableCellIds);

  if (!completion?.isComplete || dismissed) return null;

  const goal = notebook.metadata.goal as LocalizedString | undefined;

  /** Handles the dismiss action. */
  function handleDismiss(): void {
    setDismissed(true);
  }

  /** Handles the back-to-index action. */
  function handleBackToIndex(): void {
    if (onBack !== undefined) onBack();
  }

  /** Opens the next notebook when available. */
  function handleOpenNext(id: string): void {
    if (onOpenNotebook !== undefined) onOpenNotebook(id);
  }

  // Suppress locale usage — LessonComplete resolves it via resolveGoalText.
  void locale;

  return (
    <LessonComplete
      goal={goal}
      nextNotebookId={nextNotebookId ?? null}
      onOpenNext={handleOpenNext}
      onBackToIndex={handleBackToIndex}
      onDismiss={handleDismiss}
    />
  );
}

/**
 * Renders the notebook title, optional back button, and ordered cell list.
 * Edits to cell sources are bubbled up via onNotebookChange for autosave.
 *
 * Phase 11 additions:
 * - LessonGoal rendered below the header
 * - CompletionBanner shown when all runnable cells have been executed
 *
 * Phase 13 additions:
 * - Share button in header opens ArtifactShareDialog
 *
 * Phase 15 additions:
 * - Globals icon button in header opens GlobalsDialog
 * - GlobalsDialog.onSave forwards updated notebook to onNotebookChange
 *
 * Phase 16 additions:
 * - InputDialog shown when worker is awaiting Python input()
 * - ResourcesDrawer opened via paperclip icon; provides globals/reset/share
 */
export function NotebookView({
  notebook,
  notebookId,
  locale,
  onNotebookChange,
  onBack,
  onOpenNotebook,
  nextNotebookId,
  sessionLabel,
}: NotebookViewProps): React.ReactElement {
  /** Controls ArtifactShareDialog visibility. */
  const [shareOpen, setShareOpen] = useState(false);

  /** Controls GlobalsDialog visibility. */
  const [globalsOpen, setGlobalsOpen] = useState(false);

  /** Controls ResourcesDrawer visibility. */
  const [resourcesOpen, setResourcesOpen] = useState(false);

  /** Runtime state for detecting a pending input() call. */
  const runtimeState = useRuntimeState();
  /** Callback to post input_response to the Pyodide worker. */
  const respondToInput = useRespondToInput();

  /**
   * Handles a source-change event from CellList by producing an updated
   * notebook and forwarding it to the parent via onNotebookChange.
   * @param cellId Id of the cell that changed
   * @param newSource New source lines for that cell
   */
  function handleCellSourceChange(cellId: string, newSource: string[]): void {
    onNotebookChange(applySourceChange(notebook, cellId, newSource));
  }

  /** Opens the artifact share dialog. */
  function handleOpenShare(): void {
    setShareOpen(true);
  }

  /** Closes the artifact share dialog. */
  function handleCloseShare(): void {
    setShareOpen(false);
  }

  /** Opens the globals editor dialog. */
  function handleOpenGlobals(): void {
    setGlobalsOpen(true);
  }

  /** Closes the globals editor dialog without saving. */
  function handleCloseGlobals(): void {
    setGlobalsOpen(false);
  }

  /**
   * Receives the updated notebook from GlobalsDialog and forwards it to
   * onNotebookChange so the autosave mechanism picks up the new globals.
   * @param updated Notebook with modified metadata.globals
   */
  function handleSaveGlobals(updated: Notebook): void {
    onNotebookChange(updated);
  }

  /** Opens the resources drawer. */
  function handleOpenResources(): void {
    setResourcesOpen(true);
  }

  /** Closes the resources drawer. */
  function handleCloseResources(): void {
    setResourcesOpen(false);
  }

  /**
   * Handles the InputDialog submit: posts the value to the worker and clears
   * the pending-input state in the runtime store.
   * @param value The string entered by the learner
   */
  function handleInputSubmit(value: string): void {
    respondToInput(value);
  }

  /** Runnable cell IDs memoized to avoid recomputing on every render. */
  const runnableCellIds = useMemo(() => deriveRunnableCellIds(notebook), [notebook]);

  const title = notebook.metadata.title ?? 'Untitled';
  const goal = notebook.metadata.goal as LocalizedString | undefined;

  /** Whether Python is currently waiting for an input() response. */
  const inputPending = runtimeState.pendingInputMessage !== null;
  /** Prompt text from the input() call, defaulting to empty string. */
  const inputPrompt = runtimeState.pendingInputMessage ?? '';

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <NotebookHeader
        title={title}
        onBack={onBack}
        onShare={handleOpenShare}
        onOpenGlobals={handleOpenGlobals}
        onOpenResources={handleOpenResources}
      />
      <LessonGoal goal={goal} locale={locale} />
      <CellList
        notebook={notebook}
        locale={locale}
        onCellSourceChange={handleCellSourceChange}
      />
      <CompletionBanner
        notebookId={notebookId}
        runnableCellIds={runnableCellIds}
        notebook={notebook}
        nextNotebookId={nextNotebookId}
        locale={locale}
        onOpenNotebook={onOpenNotebook}
        onBack={onBack}
      />
      <ArtifactShareDialog
        open={shareOpen}
        onClose={handleCloseShare}
        notebook={notebook}
        notebookId={notebookId}
        sessionLabel={sessionLabel}
      />
      <GlobalsDialog
        open={globalsOpen}
        notebook={notebook}
        onClose={handleCloseGlobals}
        onSave={handleSaveGlobals}
      />
      <InputDialog
        open={inputPending}
        prompt={inputPrompt}
        onSubmit={handleInputSubmit}
      />
      <ResourcesDrawer
        open={resourcesOpen}
        onClose={handleCloseResources}
        onOpenGlobals={handleOpenGlobals}
        onOpenShare={handleOpenShare}
      />
    </Box>
  );
}
