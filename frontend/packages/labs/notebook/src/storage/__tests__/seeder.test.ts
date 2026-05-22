/**
 * Tests for seedSessionIfEmpty.
 *
 * All external I/O is mocked: notebookRepo, prefsStore, fetch, and the
 * samples/index.json manifest.  Tests exercise version-gating, modified-record
 * protection, and re-seeding on version bumps.
 */

import {vi, describe, it, expect, beforeEach} from 'vitest';
import type {NotebookRecord} from '../NotebookLabDB';

// ---------------------------------------------------------------------------
// Hoisted mutable manifest — must be declared via vi.hoisted so the reference
// is available when vi.mock factories are evaluated (which are hoisted to the
// top of the module before regular variable declarations run).
// ---------------------------------------------------------------------------

/**
 * Mutable manifest container.  Tests may replace `.samples` to exercise
 * different version scenarios.  The vi.mock factory closes over this object.
 */
const mutableManifest = vi.hoisted(() => ({
  samples: [
    {
      file: 'hello_world.ipynb',
      folder: '/getting-started',
      author: 'Code.org',
      seedId: 'seed-id-0001',
      seedVersion: 1,
      goal: 'Run your first Python program',
    },
    {
      file: 'chess.ipynb',
      folder: '/projects',
      author: 'Code.org',
      seedId: 'seed-id-0002',
      seedVersion: 1,
      goal: 'Play chess with Python',
    },
  ],
}));

// ---------------------------------------------------------------------------
// Module mocks — declared before the module under test is imported.
// ---------------------------------------------------------------------------

vi.mock('../../../samples/index.json', () => ({
  default: mutableManifest,
}));

vi.mock('../notebookRepo', () => ({
  findBySeedId: vi.fn(),
  saveNotebook: vi.fn(),
}));

vi.mock('../prefsStore', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import {seedSessionIfEmpty} from '../seeder';
import * as notebookRepo from '../notebookRepo';
import * as prefsStore from '../prefsStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a minimal valid Notebook JSON object for use as a fetch mock body.
 * @returns Bare nbformat 4 notebook.
 */
function minimalNotebook(): object {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {},
    cells: [
      {
        id: 'cell-abc-001',
        cell_type: 'code',
        metadata: {},
        source: ['print("hi")'],
        outputs: [],
        execution_count: null,
      },
    ],
  };
}

/**
 * Builds a mock NotebookRecord with configurable timestamps.
 *
 * @param seedId - The seedId for the record.
 * @param created - Creation timestamp in ms.
 * @param lastModified - Last-modified timestamp in ms.
 * @returns A NotebookRecord suitable for mock return values.
 */
function mockRecord(
  seedId: string,
  created: number,
  lastModified: number
): NotebookRecord {
  return {
    key: `session-1::nb-1`,
    notebookId: 'nb-1',
    sessionId: 'session-1',
    notebook: {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {},
      cells: [],
    },
    created,
    lastModified,
    source: 'seed',
    seedId,
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Restore default two-sample manifest before each test.
  mutableManifest.samples = [
    {
      file: 'hello_world.ipynb',
      folder: '/getting-started',
      author: 'Code.org',
      seedId: 'seed-id-0001',
      seedVersion: 1,
      goal: 'Run your first Python program',
    },
    {
      file: 'chess.ipynb',
      folder: '/projects',
      author: 'Code.org',
      seedId: 'seed-id-0002',
      seedVersion: 1,
      goal: 'Play chess with Python',
    },
  ];

  // Default fetch returns a valid minimal notebook.
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => minimalNotebook(),
  } as unknown as Response);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('seedSessionIfEmpty', () => {
  it('first seed: saves 2 notebooks and stamps the version', async () => {
    vi.mocked(prefsStore.get).mockResolvedValue(null);
    vi.mocked(notebookRepo.findBySeedId).mockResolvedValue(undefined);
    vi.mocked(notebookRepo.saveNotebook).mockResolvedValue(undefined);
    vi.mocked(prefsStore.set).mockResolvedValue(undefined);

    await seedSessionIfEmpty('session-1');

    expect(notebookRepo.saveNotebook).toHaveBeenCalledTimes(2);
    expect(prefsStore.set).toHaveBeenCalledWith('nblab.seedVersion.session-1', 1);
  });

  it('already seeded at max version: returns without calling saveNotebook', async () => {
    // storedVersion === maxSeedVersion === 1; nothing to do.
    vi.mocked(prefsStore.get).mockResolvedValue(1);

    await seedSessionIfEmpty('session-1');

    expect(notebookRepo.saveNotebook).not.toHaveBeenCalled();
    expect(prefsStore.set).not.toHaveBeenCalled();
  });

  it('does not clobber a learner-modified record', async () => {
    vi.mocked(prefsStore.get).mockResolvedValue(null);
    vi.mocked(notebookRepo.saveNotebook).mockResolvedValue(undefined);
    vi.mocked(prefsStore.set).mockResolvedValue(undefined);

    const now = Date.now();
    // sample 1: modified (lastModified >> created + 1000) — must be skipped.
    // sample 2: not yet seeded (findBySeedId returns undefined) — must be saved.
    vi.mocked(notebookRepo.findBySeedId).mockImplementation(
      async (_sessionId: string, seedId: string) => {
        if (seedId === 'seed-id-0001') {
          return mockRecord('seed-id-0001', now - 5000, now);
        }
        return undefined;
      }
    );

    await seedSessionIfEmpty('session-1');

    // Only the pristine second sample should be saved.
    expect(notebookRepo.saveNotebook).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(notebookRepo.saveNotebook).mock.calls[0][1];
    expect(callArg.seedId).toBe('seed-id-0002');
  });

  it('re-seeds a pristine record when the version bumps', async () => {
    // Stored version is 1; manifest bumps sample2 to version 2.
    mutableManifest.samples = [
      {
        file: 'hello_world.ipynb',
        folder: '/getting-started',
        author: 'Code.org',
        seedId: 'seed-id-0001',
        seedVersion: 1,
        goal: 'Run your first Python program',
      },
      {
        file: 'chess.ipynb',
        folder: '/projects',
        author: 'Code.org',
        seedId: 'seed-id-0002',
        seedVersion: 2,
        goal: 'Play chess with Python',
      },
    ];

    vi.mocked(prefsStore.get).mockResolvedValue(1);
    vi.mocked(notebookRepo.saveNotebook).mockResolvedValue(undefined);
    vi.mocked(prefsStore.set).mockResolvedValue(undefined);

    const now = Date.now();
    // sample2 record exists but is pristine (lastModified barely exceeds created).
    vi.mocked(notebookRepo.findBySeedId).mockImplementation(
      async (_sessionId: string, seedId: string) => {
        if (seedId === 'seed-id-0002') {
          return mockRecord('seed-id-0002', now, now + 5);
        }
        return undefined;
      }
    );

    await seedSessionIfEmpty('session-1');

    // Only sample2 (seedVersion 2 > stored 1) should be re-seeded.
    expect(notebookRepo.saveNotebook).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(notebookRepo.saveNotebook).mock.calls[0][1];
    expect(callArg.seedId).toBe('seed-id-0002');
    expect(prefsStore.set).toHaveBeenCalledWith('nblab.seedVersion.session-1', 2);
  });
});
