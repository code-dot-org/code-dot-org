import {describe, expect, it} from 'vitest';

import {normalizeAnimationList} from '../animationList';

function props(name: string, extra: Record<string, unknown> = {}) {
  return {
    name,
    frameSize: {x: 10, y: 10},
    frameCount: 1,
    looping: false,
    frameDelay: 4,
    ...extra,
  };
}

describe('normalizeAnimationList', () => {
  it('makes a missing list empty', () => {
    expect(normalizeAnimationList(undefined)).toEqual({
      orderedKeys: [],
      propsByKey: {},
    });
  });

  it('ANI-39: derives frameDelay from frameRate, else 2', () => {
    const list = normalizeAnimationList({
      orderedKeys: ['a', 'b', 'c', 'd'],
      propsByKey: {
        a: props('a', {frameDelay: undefined, frameRate: 10}),
        b: props('b', {frameDelay: 0, frameRate: 0}),
        c: props('c', {frameDelay: undefined, frameRate: 'fast'}),
        d: props('d'),
      },
    });
    expect(list.orderedKeys.map(k => list.propsByKey[k].frameDelay)).toEqual([
      3, 2, 2, 4,
    ]);
  });

  it('ANI-39: missing looping is true', () => {
    const list = normalizeAnimationList({
      orderedKeys: ['a'],
      propsByKey: {a: props('a', {looping: undefined})},
    });
    expect(list.propsByKey.a.looping).toBe(true);
  });

  it('does not change its argument', () => {
    const saved = {
      orderedKeys: ['a'],
      propsByKey: {a: props('a', {looping: undefined})},
    };
    normalizeAnimationList(saved);
    expect(saved.propsByKey.a.looping).toBeUndefined();
  });

  it('converts the array form', () => {
    const list = normalizeAnimationList([{key: 'k', ...props('a')}]);
    expect(list.orderedKeys).toEqual(['k']);
    expect(list.propsByKey.k.name).toBe('a');
  });

  it('renames later duplicates to the lowest free suffix', () => {
    const list = normalizeAnimationList({
      orderedKeys: ['1', '2', '3', '4'],
      propsByKey: {
        '1': props('cat'),
        '2': props('cat'),
        '3': props('cat_1'),
        '4': props('cat'),
      },
    });
    expect(list.orderedKeys.map(k => list.propsByKey[k].name)).toEqual([
      'cat',
      'cat_2',
      'cat_1',
      'cat_3',
    ]);
  });

  it('drops repeated keys', () => {
    const list = normalizeAnimationList({
      orderedKeys: ['a', 'a'],
      propsByKey: {a: props('a')},
    });
    expect(list.orderedKeys).toEqual(['a']);
  });

  it('throws on a missing required prop', () => {
    expect(() =>
      normalizeAnimationList({
        orderedKeys: ['a'],
        propsByKey: {a: {name: 'a'}},
      }),
    ).toThrow("Required prop 'frameSize' is missing");
  });

  it('throws when keys and props disagree', () => {
    expect(() =>
      normalizeAnimationList({
        orderedKeys: ['a', 'b'],
        propsByKey: {a: props('a')},
      }),
    ).toThrow('keys without props: b');
    expect(() =>
      normalizeAnimationList({
        orderedKeys: [],
        propsByKey: {a: props('a')},
      }),
    ).toThrow('props not in orderedKeys: a');
  });

  it('throws on a list that is not one', () => {
    expect(() => normalizeAnimationList({propsByKey: {}})).toThrow(
      'orderedKeys is not an array',
    );
  });
});
