import {describe, expect, it} from 'vitest';

import {createEffectDocument} from '../document';
import {
  EffectParseError,
  parseEffectDocument,
  serializeEffectDocument,
} from '../schema';

/** Run `action` and hand back whatever it threw, so assertions stay top-level. */
function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('`.effect` serialization', () => {
  it('round-trips a document unchanged', () => {
    const document = createEffectDocument('Ripple');

    expect(parseEffectDocument(serializeEffectDocument(document))).toEqual(
      document,
    );
  });

  it('round-trips a wire that narrows its value', () => {
    const document = createEffectDocument('Ripple');
    const narrowed = {
      ...document,
      edges: document.edges.map((edge, index) =>
        index === 0 ? {...edge, source: {...edge.source, swizzle: 'y'}} : edge,
      ),
    };

    expect(parseEffectDocument(serializeEffectDocument(narrowed))).toEqual(
      narrowed,
    );
  });

  it('rejects a swizzle that is not canonical xyzw', () => {
    // `rgba` is how components are *shown*; storing them would mean two
    // spellings of the same wire in the file format.
    const document = createEffectDocument();
    const broken = JSON.stringify({
      ...document,
      edges: document.edges.map((edge, index) =>
        index === 0 ? {...edge, source: {...edge.source, swizzle: 'r'}} : edge,
      ),
    });

    expect(() => parseEffectDocument(broken)).toThrow(EffectParseError);
  });

  it('round-trips a resized comment node', () => {
    const document = createEffectDocument('Ripple');
    const withComment = {
      ...document,
      nodes: [
        ...document.nodes,
        {
          id: 'comment-1',
          type: 'comment',
          position: {x: 10, y: 20},
          note: 'Start here.',
          size: {width: 320, height: 180},
        },
      ],
    };

    expect(parseEffectDocument(serializeEffectDocument(withComment))).toEqual(
      withComment,
    );
  });

  it('round-trips an effect description, and tolerates its absence', () => {
    const described = {
      ...createEffectDocument('Ripple'),
      description: 'Waves the picture sideways, like a flag.',
    };
    expect(parseEffectDocument(serializeEffectDocument(described))).toEqual(
      described,
    );

    // Documents written before the field existed still parse — which is why
    // adding it needed no version bump.
    const older = createEffectDocument('Ripple');
    expect(parseEffectDocument(serializeEffectDocument(older))).toEqual(older);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseEffectDocument('{oops')).toThrow(EffectParseError);
  });

  it('reports where a document is malformed', () => {
    const document = createEffectDocument();
    const broken = JSON.stringify({
      ...document,
      nodes: [{id: 'sample-1', type: 'sample'}],
    });

    const error = captureError(() => parseEffectDocument(broken));

    expect(error).toBeInstanceOf(EffectParseError);
    expect((error as EffectParseError).issues.join()).toContain(
      'nodes.0.position',
    );
  });

  it('refuses a document written by a newer editor', () => {
    const future = JSON.stringify({...createEffectDocument(), version: 99});

    expect(() => parseEffectDocument(future)).toThrow(/newer than this editor/);
  });
});
