import {expect} from '../../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/locationCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Location Commands', () => {
  let p5Wrapper, makeSprite;
  const spriteName = 'sprite1';
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    makeSprite = spriteCommands.makeSprite.bind(p5Wrapper.p5);
  });
  it('locationAt', () => {
    expect(commands.locationAt(200, 200)).to.deep.equal({x: 200, y: 200});

    expect(commands.locationAt(50, 300)).to.deep.equal({x: 50, y: 100});
  });

  describe('locationModifier', () => {
    it('works with normal inputs', () => {
      expect(
        commands.locationModifier(25, 'North', {x: 100, y: 200})
      ).to.deep.equal({x: 100, y: 175});
      expect(
        commands.locationModifier(25, 'South', {x: 100, y: 200})
      ).to.deep.equal({x: 100, y: 225});
      expect(
        commands.locationModifier(25, 'East', {x: 100, y: 200})
      ).to.deep.equal({x: 125, y: 200});
      expect(
        commands.locationModifier(25, 'West', {x: 100, y: 200})
      ).to.deep.equal({x: 75, y: 200});
    });

    it('works with location (0, 0)', () => {
      expect(
        commands.locationModifier(15, 'North', {x: 0, y: 0})
      ).to.deep.equal({
        x: 0,
        y: -15
      });
    });

    it('returns undefined if given invalid inputs', () => {
      expect(commands.locationModifier(15, 'North')).to.equal(undefined);
      expect(
        commands.locationModifier(15, 'Invalid Direction', {x: 10, y: 10})
      ).to.equal(undefined);
    });
  });

  it('locationMouse', () => {
    let locationMouse = commands.locationMouse.bind(p5Wrapper.p5);
    p5Wrapper.p5.mouseX = 0;
    p5Wrapper.p5.mouseY = 0;
    expect(locationMouse()).to.deep.equal({x: 0, y: 0});

    p5Wrapper.p5.mouseX = 123;
    p5Wrapper.p5.mouseY = 321;
    expect(locationMouse()).to.deep.equal({x: 123, y: 321});
  });

  it('locationOf', () => {
    makeSprite({name: spriteName, location: {x: 123, y: 321}});

    expect(commands.locationOf({name: spriteName})).to.deep.equal({
      x: 123,
      y: 321
    });
  });

  it('randomLocation', () => {
    let loc = commands.randomLocation();
    expect(loc).to.have.keys(['x', 'y']);
    expect(loc.x).to.be.within(20, 380);
    expect(loc.y).to.be.within(20, 380);
  });
});
