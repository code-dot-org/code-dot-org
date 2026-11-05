import {
  findPartner,
  markPairs,
  pairStatus,
  pairTogether,
  unpairItem,
} from '@cdo/apps/quiz/attempt/match/utils';

describe('pairTogether', () => {
  it('adds a new pair', () => {
    expect(pairTogether([], ['a', 'x'])).toEqual([['a', 'x']]);
  });

  it("replaces either item's previous pair", () => {
    expect(
      pairTogether(
        [
          ['a', 'x'],
          ['b', 'y'],
        ],
        ['a', 'y']
      )
    ).toEqual([['a', 'y']]);
  });
});

describe('unpairItem', () => {
  const pairs: [string, string][] = [
    ['a', 'x'],
    ['b', 'y'],
  ];

  it("removes the item's pair, from either column", () => {
    expect(unpairItem(pairs, 'a')).toEqual([['b', 'y']]);
    expect(unpairItem(pairs, 'y')).toEqual([['a', 'x']]);
  });

  it('leaves the pairs alone for an unpaired item', () => {
    expect(unpairItem(pairs, 'c')).toEqual(pairs);
  });
});

describe('findPartner', () => {
  const pairs: [string, string][] = [['a', 'x']];

  it('finds the partner from either side', () => {
    expect(findPartner(pairs, 'a')).toBe('x');
    expect(findPartner(pairs, 'x')).toBe('a');
  });

  it('is undefined for an unpaired item', () => {
    expect(findPartner(pairs, 'b')).toBeUndefined();
  });
});

describe('pairStatus', () => {
  const correctPairs: [string, string][] = [
    ['a', 'x'],
    ['b', 'y'],
  ];

  it('is correct for a pair in the key, in either order', () => {
    expect(pairStatus(correctPairs, ['a', 'x'])).toBe('correct');
    expect(pairStatus(correctPairs, ['x', 'a'])).toBe('correct');
  });

  it('is incorrect for a pair not in the key', () => {
    expect(pairStatus(correctPairs, ['a', 'y'])).toBe('incorrect');
  });
});

describe('markPairs', () => {
  const correctPairs: [string, string][] = [
    ['a', 'x'],
    ['b', 'y'],
  ];

  it('marks each pair against the key', () => {
    expect(
      markPairs(
        [
          ['a', 'x'],
          ['b', 'z'],
        ],
        correctPairs,
        false
      )
    ).toEqual([
      {ids: ['a', 'x'], status: 'correct'},
      {ids: ['b', 'z'], status: 'incorrect'},
    ]);
  });

  it('marks every pair of the answer key correct', () => {
    expect(markPairs(correctPairs, undefined, true)).toEqual([
      {ids: ['a', 'x'], status: 'correct'},
      {ids: ['b', 'y'], status: 'correct'},
    ]);
  });

  it('leaves pairs unmarked without a key', () => {
    expect(markPairs([['a', 'x']], undefined, false)).toEqual([
      {ids: ['a', 'x'], status: undefined},
    ]);
  });
});
