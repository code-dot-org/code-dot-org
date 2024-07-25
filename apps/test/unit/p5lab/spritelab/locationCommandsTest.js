import {commands} from '@cdo/apps/p5lab/spritelab/commands/locationCommands';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';

import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Location Commands', () => {
  let coreLibrary;
  const spriteName = 'sprite1';
  beforeEach(function () {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
  });
  it('locationAt', () => {
    expect(commands.locationAt(200, 200)).toEqual({x: 200, y: 200});

    expect(commands.locationAt(50, 300)).toEqual({x: 50, y: 100});
  });

  describe('locationModifier', () => {
    it('works with normal inputs', () => {
      expect(
        commands.locationModifier.apply(coreLibrary, [
          25,
          'North',
          {x: 100, y: 200},
        ])
      ).toEqual({x: 100, y: 175});
      expect(
        commands.locationModifier.apply(coreLibrary, [
          25,
          'South',
          {x: 100, y: 200},
        ])
      ).toEqual({x: 100, y: 225});
      expect(
        commands.locationModifier.apply(coreLibrary, [
          25,
          'East',
          {x: 100, y: 200},
        ])
      ).toEqual({x: 125, y: 200});
      expect(
        commands.locationModifier.apply(coreLibrary, [
          25,
          'West',
          {x: 100, y: 200},
        ])
      ).toEqual({x: 75, y: 200});
    });

    it('works with location (0, 0)', () => {
      expect(
        commands.locationModifier.apply(coreLibrary, [
          15,
          'North',
          {x: 0, y: 0},
        ])
      ).toEqual({
        x: 0,
        y: -15,
      });
    });

    it('returns undefined if given invalid inputs', () => {
      expect(
        commands.locationModifier.apply(coreLibrary, [15, 'North'])
      ).toBeUndefined();
      expect(
        commands.locationModifier.apply(coreLibrary, [
          15,
          'Invalid Direction',
          {x: 10, y: 10},
        ])
      ).toBeUndefined();
    });
  });

  it('locationMouse', () => {
    coreLibrary.p5.mouseX = 0;
    coreLibrary.p5.mouseY = 0;
    expect(commands.locationMouse.apply(coreLibrary)).toEqual({
      x: 0,
      y: 0,
    });

    coreLibrary.p5.mouseX = 123;
    coreLibrary.p5.mouseY = 321;
    expect(commands.locationMouse.apply(coreLibrary)).toEqual({
      x: 123,
      y: 321,
    });
  });

  it('locationOf', () => {
    coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});

    expect(
      commands.locationOf.apply(coreLibrary, [{name: spriteName}])
    ).toEqual({
      x: 123,
      y: 321,
    });
  });

  it('randomLocation', () => {
    let loc = commands.randomLocation.apply(coreLibrary);
    expect(Object.keys(loc)).toEqual(expect.arrayContaining(['x', 'y']));
    expect(loc.x).toBeGreaterThanOrEqual(20);
    expect(loc.x).toBeLessThanOrEqual(380);
    expect(loc.y).toBeGreaterThanOrEqual(20);
    expect(loc.y).toBeLessThanOrEqual(380);
  });
});
