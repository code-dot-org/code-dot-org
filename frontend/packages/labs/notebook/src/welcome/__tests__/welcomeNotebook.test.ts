/**
 * Tests for buildWelcomeNotebook and WELCOME_NOTEBOOK_TITLE.
 *
 * Verifies structural invariants required by the cold-open dispatch:
 * nbformat version, cell count, cell types, source contents, and that
 * repeated calls generate distinct cell ids.
 */

import {describe, it, expect} from 'vitest';
import {buildWelcomeNotebook, WELCOME_NOTEBOOK_TITLE} from '../welcomeNotebook';

describe('buildWelcomeNotebook', () => {
  it('returns a notebook with nbformat === 4', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.nbformat).toBe(4);
  });

  it('returns exactly 2 cells', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.cells).toHaveLength(2);
  });

  it('first cell is markdown', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.cells[0].cell_type).toBe('markdown');
  });

  it('second cell is code', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.cells[1].cell_type).toBe('code');
  });

  it('code cell source is exactly the hello-world print statement', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.cells[1].source).toEqual(['print("Hello, world!")\n']);
  });

  it('each cell has a non-empty id string', () => {
    const nb = buildWelcomeNotebook();
    for (const cell of nb.cells) {
      expect(typeof cell.id).toBe('string');
      expect(cell.id.length).toBeGreaterThan(0);
    }
  });

  it('metadata.title equals WELCOME_NOTEBOOK_TITLE', () => {
    const nb = buildWelcomeNotebook();
    expect(nb.metadata.title).toBe(WELCOME_NOTEBOOK_TITLE);
  });

  it('calling buildWelcomeNotebook twice produces different cell ids', () => {
    const first = buildWelcomeNotebook();
    const second = buildWelcomeNotebook();

    const firstIds = first.cells.map(c => c.id);
    const secondIds = second.cells.map(c => c.id);

    // No id from the first call should match any id from the second call.
    for (const id of firstIds) {
      expect(secondIds).not.toContain(id);
    }
  });
});
