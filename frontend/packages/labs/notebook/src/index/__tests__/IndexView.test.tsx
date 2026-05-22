/**
 * IndexView component tests — exercises ContinueRow, AssignedRow, and
 * LibraryUnits in isolation with fixture data.
 *
 * Validates:
 *   - No rendered text contains a '/' path separator
 *   - The three section headings appear when matching records exist
 *   - AssignedRow only surfaces records with source.startsWith('import-')
 */

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {NotebookRecord} from '../../storage/NotebookLabDB';
import {AssignedRow} from '../AssignedRow';
import {ContinueRow} from '../ContinueRow';
import {LibraryUnits} from '../LibraryUnits';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Builds a minimal NotebookRecord for testing.  Only the fields referenced
 * by the components under test are populated.
 *
 * @param overrides - Partial fields to merge into the base record.
 * @returns A fully-typed NotebookRecord fixture.
 */
function makeRecord(overrides: {
  notebookId: string;
  source: NotebookRecord['source'];
  title?: string;
  folder?: string;
  author?: string;
  lastModified?: number;
}): NotebookRecord {
  const {notebookId, source, title, folder, author, lastModified = 1000} = overrides;
  return {
    key: `session1::${notebookId}`,
    notebookId,
    sessionId: 'session1',
    notebook: {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {
        ...(title !== undefined ? {title} : {}),
        ...(folder !== undefined ? {folder} : {}),
        ...(author !== undefined ? {author} : {}),
      },
      cells: [],
    },
    created: 500,
    lastModified,
    source,
  };
}

/** Fixture: a seed-source record belonging to a named folder. */
const SEEDED_UNIT1 = makeRecord({
  notebookId: 'nb-seed-1',
  source: 'seed',
  title: 'Intro to Python',
  folder: '/unit-1-basics',
  lastModified: 2000,
});

/** Fixture: a seed-source record belonging to a second folder. */
const SEEDED_UNIT2 = makeRecord({
  notebookId: 'nb-seed-2',
  source: 'seed',
  title: 'Data Types',
  folder: '/unit-2-data',
  lastModified: 3000,
});

/** Fixture: an import-file record — teacher-assigned. */
const ASSIGNED_FILE = makeRecord({
  notebookId: 'nb-assign-1',
  source: 'import-file',
  title: 'Class Assignment',
  author: 'Ms. Smith',
  lastModified: 4000,
});

/** Fixture: an import-url record — another teacher-assigned variant. */
const ASSIGNED_URL = makeRecord({
  notebookId: 'nb-assign-2',
  source: 'import-url',
  title: 'Homework Notebook',
  lastModified: 5000,
});

/** Fixture: a welcome-source record — not assigned, not seeded. */
const WELCOME = makeRecord({
  notebookId: 'nb-welcome',
  source: 'welcome',
  title: 'Welcome',
  lastModified: 1500,
});

/** All fixture records combined for full-render tests. */
const ALL_RECORDS: NotebookRecord[] = [
  SEEDED_UNIT1,
  SEEDED_UNIT2,
  ASSIGNED_FILE,
  ASSIGNED_URL,
  WELCOME,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns all text nodes from the rendered container that contain a forward
 * slash, so tests can assert none of the rendered text exposes raw paths.
 *
 * @param container - Rendered DOM container from @testing-library/react.
 * @returns Array of text content strings that contain '/'.
 */
function findSlashTexts(container: HTMLElement): string[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const found: string[] = [];
  let node = walker.nextNode();
  while (node !== null) {
    const text = node.textContent ?? '';
    if (text.includes('/')) {
      found.push(text);
    }
    node = walker.nextNode();
  }
  return found;
}

// ---------------------------------------------------------------------------
// Tests: ContinueRow
// ---------------------------------------------------------------------------

describe('ContinueRow', () => {
  it('renders the "Continue" heading when records are present', () => {
    render(<ContinueRow records={ALL_RECORDS} onOpen={vi.fn()} />);
    // Use heading role to distinguish the section heading from button labels.
    expect(
      screen.getByRole('heading', {name: 'Continue'}),
    ).toBeInTheDocument();
  });

  it('renders nothing when records array is empty', () => {
    const {container} = render(<ContinueRow records={[]} onOpen={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows no path separators in rendered text', () => {
    const {container} = render(
      <ContinueRow records={ALL_RECORDS} onOpen={vi.fn()} />,
    );
    expect(findSlashTexts(container as HTMLElement)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: AssignedRow
// ---------------------------------------------------------------------------

describe('AssignedRow', () => {
  it('renders the "Assigned" heading when import records exist', () => {
    render(<AssignedRow records={ALL_RECORDS} onOpen={vi.fn()} />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();
  });

  it('only shows records with source.startsWith("import-")', () => {
    render(<AssignedRow records={ALL_RECORDS} onOpen={vi.fn()} />);

    // Assigned records should appear.
    expect(screen.getByText('Class Assignment')).toBeInTheDocument();
    expect(screen.getByText('Homework Notebook')).toBeInTheDocument();

    // Non-assigned records must not appear.
    expect(screen.queryByText('Intro to Python')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Types')).not.toBeInTheDocument();
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });

  it('renders nothing when no import records exist', () => {
    const onlySeeded = [SEEDED_UNIT1, WELCOME];
    const {container} = render(
      <AssignedRow records={onlySeeded} onOpen={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows no path separators in rendered text', () => {
    const {container} = render(
      <AssignedRow records={ALL_RECORDS} onOpen={vi.fn()} />,
    );
    expect(findSlashTexts(container as HTMLElement)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: LibraryUnits
// ---------------------------------------------------------------------------

describe('LibraryUnits', () => {
  it('renders the "Library" heading when seeded records exist', () => {
    render(<LibraryUnits records={ALL_RECORDS} onOpen={vi.fn()} />);
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('renders nothing when no seed records exist', () => {
    const noSeeded = [ASSIGNED_FILE, WELCOME];
    const {container} = render(
      <LibraryUnits records={noSeeded} onOpen={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('converts folder paths to human-readable labels', () => {
    render(<LibraryUnits records={ALL_RECORDS} onOpen={vi.fn()} />);

    // unitName('/unit-1-basics') → 'Unit 1 Basics'
    expect(screen.getByText('Unit 1 Basics')).toBeInTheDocument();
    // unitName('/unit-2-data') → 'Unit 2 Data'
    expect(screen.getByText('Unit 2 Data')).toBeInTheDocument();
  });

  it('shows no path separators in rendered text', () => {
    const {container} = render(
      <LibraryUnits records={ALL_RECORDS} onOpen={vi.fn()} />,
    );
    expect(findSlashTexts(container as HTMLElement)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: combined section headings
// ---------------------------------------------------------------------------

describe('section headings with full fixture set', () => {
  it('all three headings appear when each section has matching records', () => {
    render(
      <>
        <ContinueRow records={ALL_RECORDS} onOpen={vi.fn()} />
        <AssignedRow records={ALL_RECORDS} onOpen={vi.fn()} />
        <LibraryUnits records={ALL_RECORDS} onOpen={vi.fn()} />
      </>,
    );

    // Use heading role to distinguish the "Continue" section heading from the
    // per-card "Continue" buttons rendered by ContinueRow.
    expect(screen.getByRole('heading', {name: 'Continue'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Assigned'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Library'})).toBeInTheDocument();
  });
});
