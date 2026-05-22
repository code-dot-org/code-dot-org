/**
 * Cell-list dispatcher.
 *
 * Maps over notebook.cells and renders each cell with the appropriate
 * component per the dispatch table in data-model.md §2:
 *
 *   code  (any tags)                  → CodeCell
 *   markdown (any)                    → MarkdownCell
 *   raw + metadata.format === 'video' → VideoCell
 *   raw + 'chat' tag                  → ChatPlaceholder
 *   raw (other)                       → UnsupportedCell
 *   unknown type                      → UnsupportedCell
 */

import {useCallback} from 'react';
import {Box} from '@mui/material';
import type {Cell, Notebook, NotebookMetadata} from '../storage/NotebookLabDB';
import {CodeCell} from './code/CodeCell';
import {MarkdownCell} from './markdown/MarkdownCell';
import {VideoCell} from './video/VideoCell';
import {ChatPlaceholder} from './chat-placeholder/ChatPlaceholder';
import {UnsupportedCell} from './unsupported/UnsupportedCell';

/** Props for CellList. */
export interface CellListProps {
  /** The notebook whose cells to render. */
  notebook: Notebook;
  /** Active locale for i18n. */
  locale: string;
  /**
   * Called when the user edits a cell's source.
   * @param cellId Stable id of the edited cell
   * @param newSource Replacement source lines
   */
  onCellSourceChange: (cellId: string, newSource: string[]) => void;
}

// ---------------------------------------------------------------------------
// Per-cell dispatch helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the cell's metadata.tags include the given tag.
 * Safe to call on cells without a tags array.
 *
 * @param cell Cell to inspect
 * @param tag Tag string to search for
 * @returns Whether the tag is present
 */
function hasTag(cell: Cell, tag: string): boolean {
  return cell.metadata.tags?.includes(tag) ?? false;
}

/**
 * Returns true when the cell should be rendered as a video cell.
 * Matches either the canonical metadata.format check or the legacy tag.
 *
 * @param cell Cell to inspect
 * @returns Whether the cell is a video cell
 */
function isVideoCell(cell: Cell): boolean {
  return cell.metadata?.['format'] === 'video' || hasTag(cell, 'video');
}

/** Props for the single-cell dispatcher. */
interface CellRendererProps {
  /** The cell to render. */
  cell: Cell;
  /** Notebook globals for template substitution. */
  globals: NotebookMetadata['globals'];
  /** Active locale. */
  locale: string;
  /** Source-change callback forwarded from the list. */
  onSourceChange: (cellId: string, newSource: string[]) => void;
}

/**
 * Renders a single cell by dispatching on cell_type and metadata.
 * VideoCell handles raw cells with format 'video' (or legacy 'video' tag).
 * ChatPlaceholder handles raw cells with a 'chat' tag.
 */
function CellRenderer({
  cell,
  globals,
  locale,
  onSourceChange,
}: CellRendererProps): React.ReactElement {
  if (cell.cell_type === 'code') {
    return (
      <CodeCell
        cell={cell}
        globals={globals}
        locale={locale}
        onSourceChange={onSourceChange}
      />
    );
  }

  if (cell.cell_type === 'markdown') {
    return <MarkdownCell cell={cell} locale={locale} />;
  }

  if (cell.cell_type === 'raw') {
    if (isVideoCell(cell)) {
      return (
        <VideoCell
          url={cell.source?.join('').trim() ?? ''}
          title={cell.metadata?.title as string | undefined}
        />
      );
    }

    if (hasTag(cell, 'chat')) {
      return <ChatPlaceholder />;
    }

    // Raw cell with an unrecognised format tag.
    const format = (cell.metadata?.format as string | undefined) ?? 'raw';
    return <UnsupportedCell cellType={format} />;
  }

  // Fallback for any cell_type not in the union — surface visibly rather than
  // crashing, and include the type string for curriculum-author diagnostics.
  return <UnsupportedCell cellType={cell.cell_type} />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders all cells in a notebook as a vertical stack, keyed by cell ID.
 */
export function CellList({
  notebook,
  locale,
  onCellSourceChange,
}: CellListProps): React.ReactElement {
  const globals = notebook.metadata.globals;

  const handleSourceChange = useCallback(
    (cellId: string, newSource: string[]): void => {
      onCellSourceChange(cellId, newSource);
    },
    [onCellSourceChange]
  );

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      {notebook.cells.map(cell => (
        <CellRenderer
          key={cell.id}
          cell={cell}
          globals={globals}
          locale={locale}
          onSourceChange={handleSourceChange}
        />
      ))}
    </Box>
  );
}
