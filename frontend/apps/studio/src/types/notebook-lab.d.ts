/**
 * Type shim for @code-dot-org/notebook-lab.
 *
 * The notebook-lab dist bundle does not ship a .d.ts file in this worktree.
 * This declaration provides the minimal surface the studio app consumes.
 * When the package adds a proper dist/index.d.ts, delete this file.
 */
declare module '@code-dot-org/notebook-lab' {
  import type {ComponentType} from 'react';

  /** A single notebook cell. */
  export interface Cell {
    id: string;
    cell_type: 'code' | 'markdown' | 'raw';
    metadata: Record<string, unknown>;
    source?: string[];
    outputs?: unknown[];
    execution_count?: number | null;
  }

  /** Top-level notebook document (nbformat 4). */
  export interface Notebook {
    nbformat: 4;
    nbformat_minor: number;
    metadata: Record<string, unknown>;
    cells: Cell[];
  }

  /** Persisted record wrapping a notebook in IndexedDB. */
  export interface NotebookRecord {
    key: string;
    notebookId: string;
    seatId: string;
    notebook: Notebook;
    created: number;
    lastModified: number;
    source: string;
    seedId?: string;
  }

  /** Props for the NotebookLab root component. */
  export interface NotebookLabProps {
    channelId: string;
    seatId: string;
  }

  /**
   * Retrieves a notebook record by seat + notebook ID.
   * @param seatId Active seat identifier
   * @param notebookId Notebook identifier
   * @returns The record or undefined if not found
   */
  export function getNotebook(
    seatId: string,
    notebookId: string,
  ): Promise<NotebookRecord | undefined>;

  /**
   * Persists a notebook, creating or updating the stored record.
   * @param seatId Seat owning the notebook
   * @param data Notebook envelope without key/lastModified
   */
  export function saveNotebook(
    seatId: string,
    data: Omit<NotebookRecord, 'key' | 'lastModified'>,
  ): Promise<void>;

  /** Root entry component for the K-12 Notebook Lab. */
  const NotebookLab: ComponentType<NotebookLabProps>;
  export default NotebookLab;
}
