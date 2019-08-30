/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('Action Commands', () => {
  let gameLabP5, makeSprite;
  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    makeSprite = spriteCommands.makeSprite.bind(gameLabP5.p5);
  });

  it('changePropBy', () => {
    let spriteId = makeSprite(undefined, {x: 123, y: 321});
    commands.changePropBy(spriteId, 'x', 100);
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(223);

    commands.changePropBy(spriteId, 'y', 100);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 221);

    expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(0);
    commands.changePropBy(spriteId, 'direction', 200);
    expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(200);
    commands.changePropBy(spriteId, 'direction', 200);
    expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(40);
  });

  it('jumpTo', () => {
    let spriteId = makeSprite(undefined, {x: 123, y: 321});
    commands.jumpTo(spriteId, {x: 321, y: 123});
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(321);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 123);
  });

  describe('moveForward', () => {
    it('can move horizontally', () => {
      let spriteId = makeSprite(undefined, {x: 0, y: 0});
      expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(0);
      commands.moveForward(spriteId, 100);
      expect(spriteCommands.getProp(spriteId, 'x')).to.equal(100);
      expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 0);
    });

    it('can move vertically', () => {
      let spriteId = makeSprite(undefined, {x: 0, y: 0});
      commands.setProp(spriteId, 'direction', 90);
      commands.moveForward(spriteId, 100);
      expect(spriteCommands.getProp(spriteId, 'x')).to.be.within(0, 0.1);
      expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 100);
    });

    it('can move diagonally', () => {
      let spriteId = makeSprite(undefined, {x: 0, y: 0});
      commands.setProp(spriteId, 'direction', 45);
      commands.moveForward(spriteId, 100);
      expect(spriteCommands.getProp(spriteId, 'x')).to.be.within(70, 71);
      let y = 400 - spriteCommands.getProp(spriteId, 'y');
      expect(y).to.be.within(70, 71);
    });
  });

  it('moveInDirection', () => {
    let spriteId = makeSprite(undefined, {x: 0, y: 0});
    commands.moveInDirection(spriteId, 50, 'South');
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(0);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 50);

    commands.moveInDirection(spriteId, 50, 'West');
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(-50);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400 - 50);

    commands.moveInDirection(spriteId, 50, 'North');
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(-50);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400);

    commands.moveInDirection(spriteId, 50, 'East');
    expect(spriteCommands.getProp(spriteId, 'x')).to.equal(0);
    expect(spriteCommands.getProp(spriteId, 'y')).to.equal(400);
  });

  it('moveToward', () => {
    let spriteId = makeSprite(undefined, {x: 0, y: 50});

    commands.moveToward(spriteId, 100, {x: 123, y: 321});
    expect(spriteCommands.getProp(spriteId, 'x')).to.be.within(41.3, 41.4);
    let expectedY = 400 - (50 + 91.1);
    expect(spriteCommands.getProp(spriteId, 'y')).to.be.within(
      expectedY,
      expectedY + 0.1
    );
  });

  describe('setProp', () => {
    let spriteId;
    beforeEach(function() {
      spriteId = makeSprite(undefined, {x: 0, y: 0});
    });
    it('sets direction', () => {
      commands.setProp(spriteId, 'direction', 100);
      expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(100);
      commands.setProp(spriteId, 'direction', 400);
      expect(spriteCommands.getProp(spriteId, 'direction')).to.equal(40);
    });

    it('sets arbitrary properties', () => {
      commands.setProp(spriteId, 'someProp', 100);
      expect(spriteCommands.getProp(spriteId, 'someProp')).to.equal(100);
    });

    it('sets scale, height, and width', () => {
      let image = new p5.Image(100, 100, gameLabP5.p5);
      let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
      let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
      let animation = new gameLabP5.p5.Animation(sheet);
      gameLabP5.p5._predefinedSpriteAnimations = {costume_label: animation};
      spriteId = makeSprite('costume_label');
      expect(spriteCommands.getProp(spriteId, 'scale')).to.equal(100);
      commands.setProp(spriteId, 'scale', 50);
      expect(spriteCommands.getProp(spriteId, 'scale')).to.equal(50);

      commands.setProp(spriteId, 'height', 500);
      expect(spriteCommands.getProp(spriteId, 'height')).to.equal(250);

      commands.setProp(spriteId, 'width', 500);
      expect(spriteCommands.getProp(spriteId, 'width')).to.equal(250);
    });
  });

  it('turn', () => {
    let spriteId = makeSprite();
    commands.turn(spriteId, 90, 'right');
    expect(spriteCommands.getProp(spriteId, 'rotation')).to.equal(90);

    commands.turn(spriteId, 180, 'left');
    expect(spriteCommands.getProp(spriteId, 'rotation')).to.equal(-90);
  });
});
