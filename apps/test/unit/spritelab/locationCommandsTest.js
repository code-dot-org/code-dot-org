import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/locationCommands';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('Location Commands', () => {
  let p5Wrapper, createSprite;
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    createSprite = p5Wrapper.p5.createSprite.bind(p5Wrapper.p5);
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
    let sprite = createSprite();
    sprite.position.x = 123;
    sprite.position.y = 321;
    let id = coreLibrary.addSprite(sprite);

    expect(commands.locationOf(id)).to.deep.equal({x: 123, y: 321});
  });

  it('randomLocation', () => {
    let loc = commands.randomLocation();
    expect(loc).to.have.keys(['x', 'y']);
    expect(loc.x).to.be.within(20, 380);
    expect(loc.y).to.be.within(20, 380);
  });
});
