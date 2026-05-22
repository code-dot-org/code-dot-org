/**
 * Round-trip tests for the artifact codec.
 *
 * Verifies that encodeArtifact + decodeArtifact is lossless and that decoding
 * a garbage string throws rather than silently producing garbage output.
 */

import {describe, it, expect} from 'vitest';
import {encodeArtifact, decodeArtifact} from '../codec';
import type {CompletionArtifact} from '../artifactPayload';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

/**
 * Builds a minimal CompletionArtifact for round-trip testing.
 * All required fields are populated; optional fields are included to exercise
 * the full schema.
 * @returns Minimal CompletionArtifact
 */
function buildMinimalArtifact(): CompletionArtifact {
  return {
    v: 1,
    sessionLabel: 'Test User',
    notebookId: 'nb-round-trip',
    notebookTitle: 'Round Trip Test',
    unit: 'Unit 1',
    generatedAt: 1_700_000_000_000,
    cells: [
      {
        cellId: 'cell-1',
        kind: 'code',
        runState: 'ran-ok',
        lastOutput: {kind: 'text', preview: 'hello'},
      },
      {
        cellId: 'cell-2',
        kind: 'markdown',
        runState: 'n/a',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('encodeArtifact + decodeArtifact', () => {
  it('round-trips a minimal artifact with deep equality', () => {
    const original = buildMinimalArtifact();
    const encoded = encodeArtifact(original);
    const decoded = decodeArtifact(encoded);

    expect(decoded).toEqual(original);
  });

  it('round-trips an artifact with no unit field', () => {
    const original = buildMinimalArtifact();
    delete original.unit;

    const encoded = encodeArtifact(original);
    const decoded = decodeArtifact(encoded);

    expect(decoded).toEqual(original);
    expect(Object.prototype.hasOwnProperty.call(decoded, 'unit')).toBe(false);
  });

  it('round-trips an artifact with multiple cells of varied runStates', () => {
    const original: CompletionArtifact = {
      v: 1,
      sessionLabel: 'Bob',
      notebookId: 'nb-multistate',
      notebookTitle: 'Multi State',
      generatedAt: 1_700_000_002_000,
      cells: [
        {cellId: 'c1', kind: 'code', runState: 'ran-ok'},
        {cellId: 'c2', kind: 'code', runState: 'ran-error', lastOutput: {kind: 'error', preview: 'ValueError: bad'}},
        {cellId: 'c3', kind: 'code', runState: 'untried'},
        {cellId: 'c4', kind: 'markdown', runState: 'n/a'},
        {cellId: 'c5', kind: 'raw', runState: 'n/a'},
      ],
    };

    const encoded = encodeArtifact(original);
    const decoded = decodeArtifact(encoded);

    expect(decoded).toEqual(original);
  });

  it('produces a URL-safe string with no +, /, or = characters', () => {
    const original = buildMinimalArtifact();
    const encoded = encodeArtifact(original);

    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('throws when decoding a garbage string', () => {
    expect(() => decodeArtifact('this-is-not-valid-artifact-data')).toThrow();
  });

  it('throws when decoding an empty string', () => {
    expect(() => decodeArtifact('')).toThrow();
  });
});
