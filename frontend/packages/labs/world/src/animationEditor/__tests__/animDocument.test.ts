// What the editor carries through a file it only partly understands.

import {describe, expect, it} from 'vitest';

import {parseAnim, serialize} from '../animDocument';

const FILE = JSON.stringify({
  type: 'animation',
  name: 'Coin Spin',
  animations: {coinSpin: {frameRate: 12, frames: [{sprite: 'coinSpin.png'}]}},
});

describe('the `.anim` document', () => {
  it('keeps the name it was given, through an edit that knows nothing of it', () => {
    // The failure this is here for: nothing in the animation editor edits the
    // file's NAME, so a parse that dropped it and a serialize that never wrote
    // it would take "Coin Spin" off the file the first time somebody moved a
    // frame — leaving the project calling it `coinSpin`, which is the id a
    // block stores rather than a word anybody chose.
    const written = JSON.parse(serialize(parseAnim(FILE))) as {name?: string};

    expect(written.name).toBe('Coin Spin');
  });

  it('writes no name for a file that has none', () => {
    // A hand-written `.anim` need not name itself, and an empty key would be a
    // name of "" for every dropdown that reads one.
    const plain = JSON.stringify({type: 'animation', animations: {}});

    expect(JSON.parse(serialize(parseAnim(plain)))).not.toHaveProperty('name');
  });

  it('drops what belongs to the editor alone', () => {
    // `__id` is React's key and the drag's identity; the file is the
    // hand-authored shape, and a serialized `__id` would be noise a learner
    // reads in their own project.
    const written = serialize(parseAnim(FILE));

    expect(written).not.toContain('__id');
  });
});
