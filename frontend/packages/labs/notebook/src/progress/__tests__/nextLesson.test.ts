/**
 * Unit tests for nextLesson.ts — findNextLesson.
 */

import {describe, it, expect} from 'vitest';
import {findNextLesson} from '../nextLesson';
import type {NotebookRecord} from '../../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal NotebookRecord fixture.
 *
 * @param id      Notebook identifier
 * @param folder  metadata.folder value (determines unit membership)
 * @param created Unix-ms creation timestamp (determines order within unit)
 * @returns       Minimal NotebookRecord
 */
function makeRecord(id: string, folder: string, created: number): NotebookRecord {
  return {
    key: `session::${id}`,
    notebookId: id,
    sessionId: 'session',
    created,
    lastModified: created,
    source: 'seed',
    notebook: {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {folder},
      cells: [],
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('findNextLesson', () => {
  it('returns the second notebook id when current is first in the unit', () => {
    const records = [
      makeRecord('nb-2', 'unit-a', 2000),
      makeRecord('nb-1', 'unit-a', 1000),
    ];
    expect(findNextLesson('nb-1', records)).toBe('nb-2');
  });

  it('returns null when current is the last notebook in the unit', () => {
    const records = [
      makeRecord('nb-1', 'unit-a', 1000),
      makeRecord('nb-2', 'unit-a', 2000),
    ];
    expect(findNextLesson('nb-2', records)).toBeNull();
  });

  it('returns null when there is only one notebook in the unit', () => {
    const records = [makeRecord('nb-1', 'unit-a', 1000)];
    expect(findNextLesson('nb-1', records)).toBeNull();
  });

  it('does not mix notebooks from different folders', () => {
    const records = [
      makeRecord('nb-1', 'unit-a', 1000),
      makeRecord('nb-2', 'unit-b', 2000),
      makeRecord('nb-3', 'unit-a', 3000),
    ];
    // nb-3 is the next in unit-a; nb-2 from unit-b must not appear.
    expect(findNextLesson('nb-1', records)).toBe('nb-3');
  });

  it('returns null when currentNotebookId is not found in records', () => {
    const records = [makeRecord('nb-1', 'unit-a', 1000)];
    expect(findNextLesson('nb-unknown', records)).toBeNull();
  });
});
