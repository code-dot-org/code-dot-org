import {partnerOf, toggleMatch} from '@cdo/apps/quiz/attempt/match/utils';

describe('toggleMatch', () => {
  it('adds a new pair', () => {
    expect(toggleMatch([], ['a', 'x'])).toEqual([['a', 'x']]);
  });

  it('removes a pair that already exists', () => {
    expect(
      toggleMatch(
        [
          ['a', 'x'],
          ['b', 'y'],
        ],
        ['a', 'x']
      )
    ).toEqual([['b', 'y']]);
  });

  it("replaces either item's previous pair", () => {
    expect(
      toggleMatch(
        [
          ['a', 'x'],
          ['b', 'y'],
        ],
        ['a', 'y']
      )
    ).toEqual([['a', 'y']]);
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
