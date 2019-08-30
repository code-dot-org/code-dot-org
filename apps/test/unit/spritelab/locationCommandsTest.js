import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/locationCommands';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('Location Commands', () => {
  let gameLabP5, createSprite;
  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
  });
  it('locationAt', () => {
    expect(commands.locationAt(200, 200)).to.deep.equal({x: 200, y: 200});

    expect(commands.locationAt(50, 300)).to.deep.equal({x: 50, y: 100});
  });

  it('locationMouse', () => {
    let locationMouse = commands.locationMouse.bind(gameLabP5.p5);
    gameLabP5.p5.mouseX = 0;
    gameLabP5.p5.mouseY = 0;
    expect(locationMouse()).to.deep.equal({x: 0, y: 0});

    gameLabP5.p5.mouseX = 123;
    gameLabP5.p5.mouseY = 321;
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
