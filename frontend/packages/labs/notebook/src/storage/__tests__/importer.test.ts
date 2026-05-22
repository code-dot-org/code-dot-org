/**
 * Tests for the canonical import pipeline in importer.ts.
 *
 * fetch and notebookRepo.saveNotebook are mocked so no network or IndexedDB
 * access occurs.  Each test drives one behavioral path through the pipeline.
 */

import {vi, describe, it, expect, beforeEach} from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — declared before the module under test is imported.
// ---------------------------------------------------------------------------

vi.mock('../notebookRepo', () => ({
  saveNotebook: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import {importFromUrl, importFromFile, ImportError} from '../importer';
import * as notebookRepo from '../notebookRepo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal valid Jupyter v4 notebook object.
 * @returns Bare nbformat 4 notebook with one code cell that has an id.
 */
function minimalNotebook(): object {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {},
    cells: [
      {
        id: 'cell-001',
        cell_type: 'code',
        metadata: {},
        source: ['print("hello")'],
        outputs: [],
        execution_count: null,
      },
    ],
  };
}

/**
 * Builds a minimal notebook whose cells all lack ids so the backfill path
 * is exercised.
 * @returns nbformat 4 notebook with two cells missing ids.
 */
function notebookWithoutCellIds(): object {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {},
    cells: [
      {cell_type: 'code', metadata: {}, source: ['x = 1'], outputs: [], execution_count: null},
      {cell_type: 'markdown', metadata: {}, source: ['# hi']},
    ],
  };
}

/**
 * Creates a mock Response with a given ok flag, status, and JSON body.
 *
 * @param ok - Whether the response has a 2xx status.
 * @param status - HTTP status code.
 * @param body - Object to return from response.json() / response.text().
 * @returns Partial Response mock.
 */
function mockResponse(ok: boolean, status: number, body: object): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(notebookRepo.saveNotebook).mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// importFromUrl
// ---------------------------------------------------------------------------

describe('importFromUrl', () => {
  it('valid .ipynb URL returns { notebookId, notebook } and calls saveNotebook once', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse(true, 200, minimalNotebook()));

    const result = await importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url');

    expect(result.notebookId).toBeTypeOf('string');
    expect(result.notebookId.length).toBeGreaterThan(0);
    expect(result.notebook.nbformat).toBe(4);
    expect(notebookRepo.saveNotebook).toHaveBeenCalledTimes(1);
  });

  it('non-2xx response throws ImportError with reason "fetch" and does not call saveNotebook', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse(false, 404, {}));

    await expect(
      importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url')
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof ImportError && err.reason === 'fetch'
    );
    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
  });

  it('invalid JSON throws ImportError with reason "parse" and does not call saveNotebook', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{ not valid json !!!',
    } as unknown as Response);

    await expect(
      importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url')
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof ImportError && err.reason === 'parse'
    );
    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
  });

  it('JSON without nbformat 4 throws ImportError with reason "invalid" and does not call saveNotebook', async () => {
    const badNotebook = {nbformat: 3, cells: []};
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse(true, 200, badNotebook));

    await expect(
      importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url')
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof ImportError && err.reason === 'invalid'
    );
    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
  });

  it('cells with missing ids get backfilled before saving', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse(true, 200, notebookWithoutCellIds())
    );

    const result = await importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url');

    for (const cell of result.notebook.cells) {
      expect(typeof cell.id).toBe('string');
      expect(cell.id.length).toBeGreaterThan(0);
    }
  });

  it('metadata.folder without leading slash is normalized to start with "/"', async () => {
    const nb = {...minimalNotebook(), metadata: {folder: 'unit3'}};
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse(true, 200, nb));

    const result = await importFromUrl('https://example.com/nb.ipynb', 'session-1', 'import-url');

    expect(result.notebook.metadata.folder).toBe('/unit3');
  });
});

// ---------------------------------------------------------------------------
// importFromFile
// ---------------------------------------------------------------------------

describe('importFromFile', () => {
  it('reads file text and runs the same validation pipeline', async () => {
    const fileContent = JSON.stringify(minimalNotebook());
    const file = new File([fileContent], 'notebook.ipynb', {type: 'application/json'});

    const result = await importFromFile(file, 'session-1');

    expect(result.notebookId).toBeTypeOf('string');
    expect(result.notebook.nbformat).toBe(4);
    expect(notebookRepo.saveNotebook).toHaveBeenCalledTimes(1);
  });

  it('file with invalid JSON throws ImportError with reason "parse"', async () => {
    const file = new File(['not json'], 'bad.ipynb', {type: 'application/json'});

    await expect(importFromFile(file, 'session-1')).rejects.toSatisfy(
      (err: unknown) => err instanceof ImportError && err.reason === 'parse'
    );
    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
  });

  it('file without nbformat 4 throws ImportError with reason "invalid"', async () => {
    const file = new File(
      [JSON.stringify({nbformat: 3, cells: []})],
      'old.ipynb',
      {type: 'application/json'}
    );

    await expect(importFromFile(file, 'session-1')).rejects.toSatisfy(
      (err: unknown) => err instanceof ImportError && err.reason === 'invalid'
    );
    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
  });

  it('cells with missing ids get backfilled', async () => {
    const file = new File(
      [JSON.stringify(notebookWithoutCellIds())],
      'nb.ipynb',
      {type: 'application/json'}
    );

    const result = await importFromFile(file, 'session-1');

    for (const cell of result.notebook.cells) {
      expect(typeof cell.id).toBe('string');
      expect(cell.id.length).toBeGreaterThan(0);
    }
  });

  it('metadata.folder = "unit3" is normalized to "/unit3"', async () => {
    const nb = {...minimalNotebook(), metadata: {folder: 'unit3'}};
    const file = new File([JSON.stringify(nb)], 'nb.ipynb', {type: 'application/json'});

    const result = await importFromFile(file, 'session-1');

    expect(result.notebook.metadata.folder).toBe('/unit3');
  });
});
