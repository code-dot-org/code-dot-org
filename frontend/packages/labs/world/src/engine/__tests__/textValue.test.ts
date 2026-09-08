// Saying a value as words, which is one function so that it has one answer.

import {describe, expect, it} from 'vitest';

import {text} from '../core/textValue';

describe('a value said as words', () => {
  it('joins a list with one space, and no commas', () => {
    // `String(['red','blue'])` is "red,blue" — a comma nobody asked for and
    // nothing can remove. A list of words is a sentence in this language.
    expect(text(['red', 'blue'])).toBe('red blue');
    expect(text([])).toBe('');
    expect(text(['alone'])).toBe('alone');
  });

  it('flattens a list of lists rather than showing its brackets', () => {
    // The nesting is a shape the language has no block for, so reading it as
    // one sentence is the least surprising of the wrong answers.
    expect(text([['a', 'b'], ['c']])).toBe('a b c');
  });

  it('leaves everything else to String', () => {
    expect(text(7)).toBe('7');
    expect(text(true)).toBe('true');
    expect(text('already words')).toBe('already words');
  });
});
