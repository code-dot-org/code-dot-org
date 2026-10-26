// What an actor is for (specs/SHELL_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {isUnder, purposeOf, withPurpose} from '../actorPurpose';
import {importedContents} from '../importStockActor';
import {STOCK_ACTORS, stockActorById} from '../stock';

describe('what an actor is for', () => {
  it('is a game, when its file says nothing', () => {
    expect(purposeOf('{"blocks": {}}')).toBe('game');
    expect(purposeOf('{"for": "nonsense"}')).toBe('game');
    expect(purposeOf('not json')).toBe('game');
    expect(purposeOf(undefined)).toBe('game');
  });

  it('is written first in the file, and read back', () => {
    const written = withPurpose('{\n  "blocks": {}\n}', 'interface');
    expect(Object.keys(JSON.parse(written))).toEqual(['for', 'blocks']);
    expect(purposeOf(written)).toBe('interface');
    // Written again, it replaces what was there.
    expect(purposeOf(withPurpose(written, 'game'))).toBe('game');
    expect(withPurpose('not json', 'game')).toBe('not json');
  });

  it('is never both: an actor is for one or the other', () => {
    // A rule or an enhancement may be offered to both; an actor is drawn or
    // wears pictures (specs/ACTORS_AS_DATA_PLAN.md, step 3).
    expect(purposeOf('{"for": "both"}')).toBe('game');
  });

  it('puts a rule or enhancement for both under each tab', () => {
    expect(isUnder('both', 'game')).toBe(true);
    expect(isUnder('both', 'interface')).toBe(true);
    expect(isUnder('game', 'interface')).toBe(false);
    expect(isUnder('interface', 'game')).toBe(false);
  });

  it('comes with a stock actor when it is imported', () => {
    expect(purposeOf(importedContents(stockActorById('button')!))).toBe(
      'interface',
    );
    expect(purposeOf(importedContents(stockActorById('label')!))).toBe(
      'interface',
    );
    expect(purposeOf(importedContents(stockActorById('coin')!))).toBe('game');
    for (const actor of STOCK_ACTORS) {
      expect(purposeOf(importedContents(actor)), actor.id).toBe(actor.for);
    }
  });
});
