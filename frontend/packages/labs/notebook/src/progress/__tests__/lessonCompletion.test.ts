/**
 * Unit tests for lessonCompletion.ts — deriveCompletionState.
 */

import {describe, it, expect} from 'vitest';
import {deriveCompletionState} from '../lessonCompletion';
import type {Notebook} from '../../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal Notebook fixture with the given cells and optional
 * run history stored under metadata.cdo.runHistory.
 *
 * @param cells   Array of cell descriptors
 * @param history Run-history entries to embed in metadata.cdo
 * @returns       Minimal Notebook document
 */
function makeNotebook(
  cells: Array<{id: string; type: 'code' | 'markdown'; source?: string}>,
  history: Array<{cellId: string; ranAt: number; succeeded: boolean}> = []
): Notebook {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      cdo: {runHistory: history},
    },
    cells: cells.map(c => ({
      id: c.id,
      cell_type: c.type,
      metadata: {},
      source: c.source !== undefined ? c.source.split('\n').map(l => l + '\n') : [],
      outputs: [],
      execution_count: null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('deriveCompletionState', () => {
  it('returns isComplete: false when there are 0 runnable cells', () => {
    const nb = makeNotebook([]);
    const state = deriveCompletionState('nb-1', nb);
    expect(state.isComplete).toBe(false);
    expect(state.runnableCellIds).toHaveLength(0);
    expect(state.completedAt).toBeNull();
  });

  it('returns isComplete: false when 2 runnable cells and 0 have been run', () => {
    const nb = makeNotebook([
      {id: 'c1', type: 'code', source: 'print("hello")'},
      {id: 'c2', type: 'code', source: 'x = 1'},
    ]);
    const state = deriveCompletionState('nb-2', nb);
    expect(state.isComplete).toBe(false);
    expect(state.runnableCellIds).toEqual(['c1', 'c2']);
    expect(state.ranCellIds).toHaveLength(0);
    expect(state.completedAt).toBeNull();
  });

  it('returns isComplete: true when 2 runnable cells have both been run', () => {
    const nb = makeNotebook(
      [
        {id: 'c1', type: 'code', source: 'print("hello")'},
        {id: 'c2', type: 'code', source: 'x = 1'},
      ],
      [
        {cellId: 'c1', ranAt: 1000, succeeded: true},
        {cellId: 'c2', ranAt: 2000, succeeded: true},
      ]
    );
    const state = deriveCompletionState('nb-3', nb);
    expect(state.isComplete).toBe(true);
    expect(state.ranCellIds).toEqual(['c1', 'c2']);
  });

  it('does not count a code cell with empty source as runnable', () => {
    const nb = makeNotebook([
      {id: 'c1', type: 'code', source: ''},
      {id: 'c2', type: 'code', source: '   \n  '},
    ]);
    const state = deriveCompletionState('nb-4', nb);
    expect(state.runnableCellIds).toHaveLength(0);
    expect(state.isComplete).toBe(false);
  });

  it('completedAt is non-null when complete, reflecting the latest ranAt', () => {
    const nb = makeNotebook(
      [{id: 'c1', type: 'code', source: 'pass'}],
      [{cellId: 'c1', ranAt: 5000, succeeded: true}]
    );
    const state = deriveCompletionState('nb-5', nb);
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBe(5000);
  });

  it('does not count markdown cells as runnable', () => {
    const nb = makeNotebook([
      {id: 'm1', type: 'markdown', source: '# Heading'},
    ]);
    const state = deriveCompletionState('nb-6', nb);
    expect(state.runnableCellIds).toHaveLength(0);
    expect(state.isComplete).toBe(false);
  });
});
