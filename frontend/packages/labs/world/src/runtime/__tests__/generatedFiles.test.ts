// Keeping generated modules between compiles.
//
// The cost this exists to avoid: editing one rule regenerated all seven files
// in the default project, a quarter of a second of headless Blockly for output
// that had not changed. What it must never do is serve a module that is out of
// date — so the tests are mostly about what invalidates an entry.

import {describe, expect, it, vi} from 'vitest';

import {createGeneratedFileCache} from '../generatedFiles';

const isBlockly = (path: string) => path.endsWith('.rule');

/** A generator that says which file it was asked about, and counts the asking. */
const generator = () => {
  const generate = vi.fn(
    (contents: string, path: string) => `// ${path}\n${contents}`,
  );
  return generate;
};

describe('the generated-file cache', () => {
  it('generates every Blockly file the first time', () => {
    const cache = createGeneratedFileCache();
    const generate = generator();

    const out = cache.generateAll(
      {'rules/a.rule': 'A', 'rules/b.rule': 'B', 'actors/c.js': 'C'},
      isBlockly,
      generate,
    );

    expect(generate).toHaveBeenCalledTimes(2);
    expect(cache.lastMisses).toBe(2);
    expect(out['rules/a.rule']).toBe('// rules/a.rule\nA');
    // Everything else is passed through untouched.
    expect(out['actors/c.js']).toBe('C');
  });

  it('generates only what changed', () => {
    const cache = createGeneratedFileCache();
    const generate = generator();
    const files = {'rules/a.rule': 'A', 'rules/b.rule': 'B'};
    cache.generateAll(files, isBlockly, generate);
    generate.mockClear();

    const out = cache.generateAll(
      {...files, 'rules/b.rule': 'B2'},
      isBlockly,
      generate,
    );

    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledWith('B2', 'rules/b.rule');
    expect(out['rules/a.rule']).toBe('// rules/a.rule\nA');
    expect(out['rules/b.rule']).toBe('// rules/b.rule\nB2');
  });

  it('generates nothing at all when nothing changed', () => {
    const cache = createGeneratedFileCache();
    const generate = generator();
    const files = {'rules/a.rule': 'A', 'rules/b.rule': 'B'};
    cache.generateAll(files, isBlockly, generate);
    generate.mockClear();

    cache.generateAll({...files}, isBlockly, generate);

    expect(generate).not.toHaveBeenCalled();
    expect(cache.lastMisses).toBe(0);
  });

  it('regenerates everything when the module layout changes', () => {
    // A block names a RULE, and generation resolves the name to whatever file
    // holds it. Move a rule and a file that never changed now imports from
    // somewhere else — so a changed set of paths invalidates the lot.
    const cache = createGeneratedFileCache();
    const generate = generator();
    cache.generateAll(
      {'rules/a.rule': 'A', 'rules/b.rule': 'B'},
      isBlockly,
      generate,
    );
    generate.mockClear();

    cache.generateAll(
      {'rules/a.rule': 'A', 'rules/moved/b.rule': 'B'},
      isBlockly,
      generate,
    );

    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('forgets a file that is gone', () => {
    const cache = createGeneratedFileCache();
    const generate = generator();
    cache.generateAll({'rules/a.rule': 'A'}, isBlockly, generate);
    cache.generateAll({}, isBlockly, generate);
    generate.mockClear();

    // Back again, with the same contents: the entry did not survive its file.
    cache.generateAll({'rules/a.rule': 'A'}, isBlockly, generate);

    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('does not remember a failure as an answer', () => {
    const cache = createGeneratedFileCache();
    const angry = vi.fn(() => {
      throw new Error('malformed');
    });

    expect(() =>
      cache.generateAll({'rules/a.rule': 'A'}, isBlockly, angry),
    ).toThrow('malformed');

    const generate = generator();
    cache.generateAll({'rules/a.rule': 'A'}, isBlockly, generate);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('tells two files with the same contents apart', () => {
    const cache = createGeneratedFileCache();
    const generate = generator();

    const out = cache.generateAll(
      {'rules/a.rule': 'SAME', 'rules/b.rule': 'SAME'},
      isBlockly,
      generate,
    );

    // Generation takes the path (a rule's imports are relative to it), so the
    // same bytes at two paths are two modules.
    expect(generate).toHaveBeenCalledTimes(2);
    expect(out['rules/a.rule']).not.toBe(out['rules/b.rule']);
  });
});
