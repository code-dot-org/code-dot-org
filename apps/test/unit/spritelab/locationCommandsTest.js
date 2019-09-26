import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/locationCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('Location Commands', () => {
  let p5Wrapper, makeSprite;
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    makeSprite = spriteCommands.makeSprite.bind(p5Wrapper.p5);
  });
  it('locationAt', () => {
    expect(commands.locationAt(200, 200)).to.deep.equal({x: 200, y: 200});

    expect(commands.locationAt(50, 300)).to.deep.equal({x: 50, y: 100});
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
    makeSprite({name: 'sprite1', location: {x: 123, y: 321}});

    expect(commands.locationOf({name: 'sprite1'})).to.deep.equal({
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
