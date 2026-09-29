// Whether an upload is too big, and what to say about it.
//
// The comparison is one line; the MESSAGE is what a learner acts on, and it is
// the thing that would otherwise never be read by anyone until it was wrong.

import {describe, expect, it} from 'vitest';

import {megabytes, tooLarge} from '../uploadLimit';

const MB = 1024 * 1024;

describe('tooLarge', () => {
  it('accepts a file under the limit', () => {
    expect(tooLarge({name: 'coin.mp3', size: MB}, 2 * MB)).toBeUndefined();
  });

  it('accepts a file exactly at the limit', () => {
    // A cap announced as 2 MB should accept a file of 2 MB. `>` and not `>=`.
    expect(tooLarge({name: 'coin.mp3', size: 2 * MB}, 2 * MB)).toBeUndefined();
  });

  it('refuses a file over it', () => {
    expect(tooLarge({name: 'coin.mp3', size: 3 * MB}, 2 * MB)).toBeDefined();
  });

  it('accepts anything when no limit is set', () => {
    // What a lab that has not set one means. Every lab but World Lab, today.
    expect(tooLarge({name: 'huge.png', size: 500 * MB}, undefined)).toBe(
      undefined,
    );
  });

  it('names the file, its size and the limit', () => {
    // "Too big" with no number is a dead end: the learner cannot tell whether
    // to find a shorter sound or a different one.
    const said = tooLarge({name: 'theme.mp3', size: 3.5 * MB}, 2 * MB);

    expect(said?.message).toBe(
      '“theme.mp3” is 3.5 MB, and the limit is 2.0 MB.',
    );
    expect(said?.title).toBe('That file is too big');
  });

  it('states both sizes in the same unit', () => {
    // A limit in MB beside a file in KB is two units to convert between, to
    // answer the one question the message exists for.
    const said = tooLarge({name: 'blip.wav', size: 2.4 * MB}, 2 * MB);

    expect(said?.message).toContain('2.4 MB');
    expect(said?.message).toContain('2.0 MB');
  });
});

describe('megabytes', () => {
  it('reads as a person would say it', () => {
    expect(megabytes(2 * MB)).toBe('2.0 MB');
    expect(megabytes(1.55 * MB)).toBe('1.6 MB');
  });

  it('stays in MB for something small', () => {
    expect(megabytes(33 * 1024)).toBe('0.0 MB');
  });
});
