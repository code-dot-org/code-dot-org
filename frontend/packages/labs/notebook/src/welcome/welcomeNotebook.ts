/**
 * welcomeNotebook — factory for the first-launch notebook shown to new learners.
 *
 * The notebook is pure Python stdlib so it works offline without any package
 * download.  Cell ids are generated fresh on every call so two tabs opened
 * simultaneously do not share ids across their respective welcome copies.
 */

import type {Cell, Notebook} from '../storage/NotebookLabDB';

/**
 * Display title of the welcome notebook.
 * Exported so tests and other modules can assert against a canonical value
 * without duplicating the string.
 */
export const WELCOME_NOTEBOOK_TITLE = 'Welcome to Notebook Lab';

/**
 * Builds a markdown cell with the given id and source lines.
 * @param id Stable UUID for this cell
 * @param source Array of source lines conforming to nbformat convention
 * @returns A markdown Cell object
 */
function buildMarkdownCell(id: string, source: string[]): Cell {
  return {
    id,
    cell_type: 'markdown',
    metadata: {},
    source,
  };
}

/**
 * Builds a code cell with the given id and source lines.
 * @param id Stable UUID for this cell
 * @param source Array of source lines conforming to nbformat convention
 * @returns A code Cell object with no outputs and null execution_count
 */
function buildCodeCell(id: string, source: string[]): Cell {
  return {
    id,
    cell_type: 'code',
    metadata: {},
    source,
    outputs: [],
    execution_count: null,
  };
}

/**
 * Builds the welcome notebook shown on first launch.
 * Uses only Python stdlib — no external packages required.
 * @returns A fresh Notebook conforming to nbformat 4
 */
export function buildWelcomeNotebook(): Notebook {
  const markdownCell = buildMarkdownCell(crypto.randomUUID(), [
    '# Welcome to Notebook Lab\n',
    '\n',
    'Press **Try it** below to run your first Python program.\n',
  ]);

  const codeCell = buildCodeCell(crypto.randomUUID(), [
    'print("Hello, world!")\n',
  ]);

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      title: WELCOME_NOTEBOOK_TITLE,
      goal: 'Run your first Python program',
    },
    cells: [markdownCell, codeCell],
  };
}
