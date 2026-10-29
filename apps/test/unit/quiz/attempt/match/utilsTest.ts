import {
  findPartner,
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
