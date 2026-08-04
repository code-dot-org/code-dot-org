// What a key is called (engine/core/keys).
//
// The browser's names are the browser's business. They used to travel the whole
// way in — into the pressed set, into an event's value, into generated code
// that read `if (eventValue !== " ") return;`. The driver translates at the
// door now, and these pin down what comes through it.

import {describe, expect, it} from 'vitest';

import {KEY_CHOICES, keyName} from '../core/keys';

describe('keyName', () => {
  it('names the keys whose browser name is unreadable', () => {
    expect(keyName(' ')).toBe('space');
    expect(keyName('ArrowUp')).toBe('up arrow');
    expect(keyName('ArrowLeft')).toBe('left arrow');
    expect(keyName('Enter')).toBe('enter');
  });

  it('folds a letter’s case', () => {
    // Shift held or not, it is the A key — which is what a learner means by
    // one, and what makes a single handler fire for both.
    expect(keyName('a')).toBe('a');
    expect(keyName('A')).toBe('a');
  });

  it('leaves a key it does not name alone', () => {
    // The keyboard is not reduced to the list: a rule that wants F7 may say F7.
    expect(keyName('F7')).toBe('F7');
    expect(keyName('Escape')).toBe('Escape');
  });
});

describe('KEY_CHOICES', () => {
  it('offers each key under the name the engine compares', () => {
    // Label and value are the same except for the letters, which read `A` and
    // are `a`. Anything else would put a name in a dropdown that no `is key
    // down` would ever match.
    for (const [label, value] of KEY_CHOICES) {
      expect(value).toBe(label.length === 1 ? label.toLowerCase() : label);
    }
  });

  it('is what the driver produces, not what the DOM sent', () => {
    const values = KEY_CHOICES.map(([, value]) => value);

    expect(values).toContain(keyName(' '));
    expect(values).toContain(keyName('ArrowRight'));
    expect(values).toContain(keyName('Z'));
    expect(values).not.toContain('ArrowRight');
  });
});
