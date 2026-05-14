import {describe, expect, it} from 'vitest';

import {LevelKinds} from '@code-dot-org/core/api/data';
import type {Sublevel, UnitLevel} from '@code-dot-org/core/api/data';

import {PUZZLE_PAGE_NONE} from '../constants';
import {processedLevel} from '../redux/progressSlice';

// processedLevel reads a small subset of the huge UnitLevel/Sublevel shapes
// (~50 fields each) — cast partials are the practical fixture format.
function makeUnitLevel(partial: Partial<UnitLevel>): UnitLevel {
  return partial as UnitLevel;
}
function makeSublevel(partial: Partial<Sublevel>): Sublevel {
  return partial as Sublevel;
}

describe('processedLevel for top-level UnitLevels', () => {
  it('sets scriptLevelId to level.id and leaves parentLevelId/navigationType undefined', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 17,
        activeId: 17,
        kind: LevelKinds.Puzzle,
        title: 3,
        position: 99,
        path: '/p/foo',
      }),
    );
    expect(out.scriptLevelId).toBe(17);
    expect(out.parentLevelId).toBeUndefined();
    // navigationType only applies to sublevels — explicitly undefined here.
    expect((out as Sublevel).navigationType).toBeUndefined();
  });

  it('sets isCurrentLevel=false on the produced shape', () => {
    const out = processedLevel(
      makeUnitLevel({id: 1, activeId: 1, kind: LevelKinds.Puzzle}),
    );
    expect(out.isCurrentLevel).toBe(false);
  });

  it('preserves path verbatim', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        path: '/p/x',
      }),
    );
    expect(out.path).toBe('/p/x');
  });

  it('falls back to PUZZLE_PAGE_NONE when pageNumber is missing', () => {
    const out = processedLevel(
      makeUnitLevel({id: 1, activeId: 1, kind: LevelKinds.Puzzle}),
    );
    // pageNumber lives on the UnitLevel arm of the NumberedLevel union;
    // narrow with a cast to a UnitLevel-shaped record.
    expect((out as {pageNumber: number}).pageNumber).toBe(PUZZLE_PAGE_NONE);
  });

  it('preserves an explicit pageNumber', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        pageNumber: 4,
      }),
    );
    // pageNumber lives on the UnitLevel arm of the NumberedLevel union;
    // narrow with a cast to a UnitLevel-shaped record.
    expect((out as {pageNumber: number}).pageNumber).toBe(4);
  });
});

describe('processedLevel kind handling', () => {
  it('blanks out levelNumber and bubbleText for Unplugged kind', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Unplugged,
        title: 3,
        position: 99,
      }),
    );
    expect(out.levelNumber).toBeUndefined();
    expect(out.bubbleText).toBeUndefined();
  });

  it('uses title for levelNumber when title is truthy', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        title: 5,
        position: 99,
      }),
    );
    expect(out.levelNumber).toBe(5);
  });

  it('falls back to position when title is 0/falsy', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        title: 0,
        position: 99,
      }),
    );
    expect(out.levelNumber).toBe(99);
  });

  it('stringifies title for bubbleText on a UnitLevel', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        title: 7,
      }),
    );
    expect(out.bubbleText).toBe('7');
  });
});

describe('processedLevel id selection', () => {
  it('uses activeId when present (the active variant under a swap)', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 10,
        activeId: 11,
        kind: LevelKinds.Puzzle,
        sublevels: [makeSublevel({id: 100, letter: 'a', path: '/s/100'})],
      }),
    );
    // The activeId becomes the parent id passed into the sublevel
    // recursion. So sublevel.parentLevelId === 11.
    expect(out.sublevels?.[0].parentLevelId).toBe(11);
  });

  it('falls back to level.id when activeId is missing', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 10,
        // activeId intentionally absent — UnitLevels under test fixtures
        // can omit it even though the schema requires it.
        kind: LevelKinds.Puzzle,
        sublevels: [makeSublevel({id: 100, letter: 'a', path: '/s/100'})],
      }),
    );
    expect(out.sublevels?.[0].parentLevelId).toBe(10);
  });
});

describe('processedLevel sublevel handling', () => {
  it('leaves sublevels undefined when the input has none', () => {
    const out = processedLevel(
      makeUnitLevel({id: 1, activeId: 1, kind: LevelKinds.Puzzle}),
    );
    expect(out.sublevels).toBeUndefined();
  });

  it('recursively processes each sublevel', () => {
    const out = processedLevel(
      makeUnitLevel({
        id: 1,
        activeId: 1,
        kind: LevelKinds.Puzzle,
        sublevels: [
          makeSublevel({id: 11, letter: 'a', path: '/s/11'}),
          makeSublevel({id: 12, letter: 'b', path: '/s/12'}),
        ],
      }),
    );
    expect(out.sublevels).toHaveLength(2);
    expect(out.sublevels?.[0].path).toBe('/s/11');
    expect(out.sublevels?.[1].path).toBe('/s/12');
  });
});

describe('processedLevel for sublevels (when called with a parentLevelId)', () => {
  it('clears scriptLevelId and forwards parentLevelId + navigationType', () => {
    const out = processedLevel(
      makeSublevel({
        id: 200,
        letter: 'c',
        path: '/s/200',
        navigationType: 'panel',
      }),
      42,
    );
    expect(out.scriptLevelId).toBeUndefined();
    expect(out.parentLevelId).toBe(42);
    expect((out as Sublevel).navigationType).toBe('panel');
  });

  it('prefers the sublevel letter over title for bubbleText', () => {
    const out = processedLevel(
      makeSublevel({
        id: 200,
        letter: 'c',
        path: '/s/200',
        navigationType: 'panel',
      }),
      42,
    );
    expect(out.bubbleText).toBe('c');
  });

  it('falls through to empty string when neither letter nor title is set', () => {
    const out = processedLevel(
      makeSublevel({
        id: 200,
        letter: '',
        path: '/s/200',
        navigationType: 'panel',
      }),
      42,
    );
    expect(out.bubbleText).toBe('');
  });
});
