import {beforeEach, describe, expect, it} from 'vitest';

import {setMouse} from '../../../sprites/__tests__/harness';
import {commands} from '../commands/locationCommands';
import type CoreLibrary from '../CoreLibrary';

import {makeLibrary} from './harness';

describe('Location Commands', () => {
  let coreLibrary: CoreLibrary;
  const spriteName = 'sprite1';

  beforeEach(async () => {
    coreLibrary = await makeLibrary();
  });

  it('locationAt', () => {
    expect(commands.locationAt(200, 200)).toEqual({x: 200, y: 200});
    expect(commands.locationAt(50, 300)).toEqual({x: 50, y: 100});
  });

  describe('locationModifier', () => {
    const modify = (
      distance: number,
      direction: string,
      location?: {x: number; y: number},
    ) =>
      commands.locationModifier.apply(coreLibrary, [
        distance,
        direction,
        location,
      ]);

    it('works with normal inputs', () => {
      expect(modify(25, 'North', {x: 100, y: 200})).toEqual({x: 100, y: 175});
      expect(modify(25, 'South', {x: 100, y: 200})).toEqual({x: 100, y: 225});
      expect(modify(25, 'East', {x: 100, y: 200})).toEqual({x: 125, y: 200});
      expect(modify(25, 'West', {x: 100, y: 200})).toEqual({x: 75, y: 200});
    });

    it('works with location (0, 0)', () => {
      expect(modify(15, 'North', {x: 0, y: 0})).toEqual({x: 0, y: -15});
    });

    it('returns undefined if given invalid inputs', () => {
      expect(modify(15, 'North')).toBeUndefined();
      expect(modify(15, 'Invalid Direction', {x: 10, y: 10})).toBeUndefined();
    });
  });

  it('locationMouse', () => {
    setMouse(coreLibrary.p5, 0, 0);
    expect(commands.locationMouse.apply(coreLibrary)).toEqual({x: 0, y: 0});

    setMouse(coreLibrary.p5, 123, 321);
    expect(commands.locationMouse.apply(coreLibrary)).toEqual({
      x: 123,
      y: 321,
    });
  });

  it('locationOf', () => {
    coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});
    expect(
      commands.locationOf.apply(coreLibrary, [{name: spriteName}]),
    ).toEqual({x: 123, y: 321});
  });

  it('randomLocation', () => {
    const loc = commands.randomLocation.apply(coreLibrary);
    expect(Object.keys(loc)).toEqual(expect.arrayContaining(['x', 'y']));
    expect(loc.x).toBeGreaterThanOrEqual(20);
    expect(loc.x).toBeLessThanOrEqual(380);
    expect(loc.y).toBeGreaterThanOrEqual(20);
    expect(loc.y).toBeLessThanOrEqual(380);
  });
});
