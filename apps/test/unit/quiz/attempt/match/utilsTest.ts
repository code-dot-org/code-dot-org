import {
  arePaired,
  pairTogether,
  partnerOf,
  removePair,
} from '@cdo/apps/quiz/attempt/match/utils';

describe('arePaired', () => {
  it('is true only for an existing pair, in [start, end] order', () => {
    expect(arePaired([['a', 'x']], ['a', 'x'])).toBe(true);
    expect(arePaired([['a', 'x']], ['a', 'y'])).toBe(false);
    expect(arePaired([['a', 'x']], ['x', 'a'])).toBe(false);
  });
});

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

describe('removePair', () => {
  it('removes only that pair', () => {
    expect(
      removePair(
        [
          ['a', 'x'],
          ['b', 'y'],
        ],
        ['a', 'x']
      )
    ).toEqual([['b', 'y']]);
  });
});

describe('partnerOf', () => {
  const pairs: [string, string][] = [['a', 'x']];

  it('finds the partner from either side', () => {
    expect(partnerOf(pairs, 'a')).toBe('x');
    expect(partnerOf(pairs, 'x')).toBe('a');
  });

  it('is undefined for an unpaired item', () => {
    expect(partnerOf(pairs, 'b')).toBeUndefined();
  });
});
