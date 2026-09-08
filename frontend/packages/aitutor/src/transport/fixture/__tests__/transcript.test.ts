// Reading a transcript, and complaining about a bad one.
//
// A transcript is hand-written JSON with nothing between the author and the
// failure. Without validation the failure is a panel answering `undefined`
// several turns after the typo that caused it, so every complaint here is
// checked for naming the place.

import {describe, expect, it} from 'vitest';

import {matches, parseTranscript} from '../transcript';

const ok = {name: 'test', turns: [{reply: {text: 'hi'}}]};

describe('parseTranscript', () => {
  it('accepts a transcript', () => {
    expect(parseTranscript(ok).name).toBe('test');
  });

  it('wants a name, because a fixture picker has to call it something', () => {
    expect(() => parseTranscript({turns: []})).toThrow(/transcript\.name/);
    expect(() => parseTranscript({name: '', turns: []})).toThrow(
      /transcript\.name/,
    );
  });

  it('wants turns', () => {
    expect(() => parseTranscript({name: 'a'})).toThrow(/transcript\.turns/);
  });

  it('names the turn it is complaining about', () => {
    expect(() =>
      parseTranscript({name: 'a', turns: [{reply: {text: 'fine'}}, {}]}),
    ).toThrow(/turns\[1\]\.reply/);
  });

  it('rejects a status that is not one', () => {
    // The commonest fixture typo there is, and silently unhandled it becomes a
    // message the panel has no copy for.
    expect(() =>
      parseTranscript({name: 'a', turns: [{reply: {status: 'timeout'}}]}),
    ).toThrow(/turns\[0\]\.reply\.status/);
  });

  it('rejects two matchers on one turn', () => {
    // Two would need a rule about how they combine, and every rule anyone
    // proposes is one somebody else assumes the opposite of.
    expect(() =>
      parseTranscript({
        name: 'a',
        turns: [{when: {contains: 'x', turn: 0}, reply: {}}],
      }),
    ).toThrow(/exactly one key/);
  });

  it('rejects a matcher key it does not know', () => {
    expect(() =>
      parseTranscript({
        name: 'a',
        turns: [{when: {startsWith: 'x'}, reply: {}}],
      }),
    ).toThrow(/unknown key startsWith/);
  });

  it('rejects a regular expression that does not compile', () => {
    expect(() =>
      parseTranscript({name: 'a', turns: [{when: {matches: '('}, reply: {}}]}),
    ).toThrow(/turns\[0\]\.when\.matches/);
  });

  it('checks the fallback too', () => {
    expect(() => parseTranscript({...ok, fallback: {status: 'nope'}})).toThrow(
      /transcript\.fallback\.status/,
    );
  });
});

describe('matches', () => {
  it('matches everything when there is no matcher', () => {
    expect(matches(undefined, 'anything', 0)).toBe(true);
  });

  it('compares turn by request number', () => {
    expect(matches({turn: 2}, 'x', 2)).toBe(true);
    expect(matches({turn: 2}, 'x', 1)).toBe(false);
  });

  it('compares equals exactly, including case', () => {
    expect(matches({equals: 'Hello'}, 'Hello', 0)).toBe(true);
    expect(matches({equals: 'Hello'}, 'hello', 0)).toBe(false);
  });

  it('compares contains without case', () => {
    expect(matches({contains: 'LOOP'}, 'about a loop', 0)).toBe(true);
  });

  it('applies a regular expression without case', () => {
    expect(matches({matches: '^how do i'}, 'How do I draw?', 0)).toBe(true);
    expect(matches({matches: '^how do i'}, 'and how do I draw?', 0)).toBe(
      false,
    );
  });
});
