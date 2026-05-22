/**
 * Tests for buildArtifactPayload.
 *
 * Verifies PII exclusion rules, runState derivation from cdo.runHistory,
 * and that cell.source never appears in the artifact output.
 */

import {describe, it, expect} from 'vitest';
import {buildArtifactPayload} from '../artifactPayload';
import type {Notebook} from '../../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Fixture notebook
// ---------------------------------------------------------------------------

/**
 * Builds a fixture Notebook that exercises all branches of buildArtifactPayload:
 *   - code cell with ran-ok history
 *   - code cell with ran-error history
 *   - code cell with no history (untried)
 *   - markdown cell (n/a)
 *   - metadata that contains an API key (must never appear in output)
 *   - cell source lines (must never appear in output)
 */
function buildFixtureNotebook(): Notebook {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      title: 'Test Notebook',
      folder: 'unit-1',
      // PII / secret that must NEVER appear in the artifact.
      OPENAI_API_KEY: 'sk-fake',
      globals: {
        MY_KEY: {default: 'sk-fake'},
      },
      cdo: {
        runHistory: {
          'cell-ran-ok': {succeeded: true, ts: 1_700_000_000_000},
          'cell-ran-error': {succeeded: false, ts: 1_700_000_001_000},
        },
      },
    },
    cells: [
      {
        id: 'cell-ran-ok',
        cell_type: 'code',
        metadata: {},
        // Source must NEVER appear in artifact output.
        source: ['print("hello")'],
        outputs: [
          {
            output_type: 'stream',
            name: 'stdout',
            text: ['hello\n'],
          },
        ],
      },
      {
        id: 'cell-ran-error',
        cell_type: 'code',
        metadata: {},
        source: ['1/0'],
        outputs: [
          {
            output_type: 'error',
            ename: 'ZeroDivisionError',
            evalue: 'division by zero',
            traceback: [],
          },
        ],
      },
      {
        id: 'cell-untried',
        cell_type: 'code',
        metadata: {},
        source: ['x = 1'],
        outputs: [],
      },
      {
        id: 'cell-markdown',
        cell_type: 'markdown',
        metadata: {},
        source: ['# Hello'],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildArtifactPayload', () => {
  it('does not include source on any artifact cell', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    for (const cell of artifact.cells) {
      expect(Object.prototype.hasOwnProperty.call(cell, 'source')).toBe(false);
    }
  });

  it('does not include OPENAI_API_KEY or sk-fake in the JSON output', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');
    const json = JSON.stringify(artifact);

    expect(json).not.toContain('sk-fake');
    expect(json).not.toContain('OPENAI_API_KEY');
  });

  it('assigns runState ran-ok to the cell with succeeded: true', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-ran-ok');
    expect(cell?.runState).toBe('ran-ok');
  });

  it('assigns runState ran-error to the cell with succeeded: false', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-ran-error');
    expect(cell?.runState).toBe('ran-error');
  });

  it('assigns runState untried to code cells with no history entry', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-untried');
    expect(cell?.runState).toBe('untried');
  });

  it('assigns runState n/a to markdown cells', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-markdown');
    expect(cell?.runState).toBe('n/a');
  });

  it('sets the correct notebookTitle from metadata.title', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    expect(artifact.notebookTitle).toBe('Test Notebook');
  });

  it('falls back to notebookId when metadata.title is absent', () => {
    const notebook = buildFixtureNotebook();
    delete notebook.metadata.title;
    const artifact = buildArtifactPayload(notebook, 'nb-fallback', 'Alice');

    expect(artifact.notebookTitle).toBe('nb-fallback');
  });

  it('includes the unit field when folder is non-empty', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    expect(artifact.unit).toBe('Unit 1');
  });

  it('omits the unit field when folder is empty', () => {
    const notebook = buildFixtureNotebook();
    notebook.metadata.folder = '';
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    expect(Object.prototype.hasOwnProperty.call(artifact, 'unit')).toBe(false);
  });

  it('captures stream output as text kind', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-ran-ok');
    expect(cell?.lastOutput?.kind).toBe('text');
    expect(cell?.lastOutput?.preview).toBe('hello\n');
  });

  it('captures error output with ename and evalue', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    const cell = artifact.cells.find(c => c.cellId === 'cell-ran-error');
    expect(cell?.lastOutput?.kind).toBe('error');
    expect(cell?.lastOutput?.preview).toContain('ZeroDivisionError');
  });

  it('returns artifact with v: 1', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    expect(artifact.v).toBe(1);
  });

  it('includes sessionLabel in the artifact', () => {
    const notebook = buildFixtureNotebook();
    const artifact = buildArtifactPayload(notebook, 'nb-001', 'Alice');

    expect(artifact.sessionLabel).toBe('Alice');
  });
});
