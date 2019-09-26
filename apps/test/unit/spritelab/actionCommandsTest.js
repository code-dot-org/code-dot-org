/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('Action Commands', () => {
  let p5Wrapper, makeSprite;
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    makeSprite = spriteCommands.makeSprite.bind(p5Wrapper.p5);
  });

  it('changePropBy', () => {
    makeSprite({name: 'sprite1', location: {x: 123, y: 321}});
    commands.changePropBy({name: 'sprite1'}, 'x', 100);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(223);

    commands.changePropBy({name: 'sprite1'}, 'y', 100);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400 - 221);

    expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(0);
    commands.changePropBy({name: 'sprite1'}, 'direction', 200);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(
      200
    );
    commands.changePropBy({name: 'sprite1'}, 'direction', 200);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(40);
  });

  it('jumpTo', () => {
    makeSprite({name: 'sprite1', location: {x: 123, y: 321}});
    commands.jumpTo({name: 'sprite1'}, {x: 321, y: 123});
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(321);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400 - 123);
  });

  describe('moveForward', () => {
    it('can move horizontally', () => {
      makeSprite({name: 'sprite1', location: {x: 0, y: 0}});
      expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(
        0
      );
      commands.moveForward({name: 'sprite1'}, 100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400 - 0);
    });

    it('can move vertically', () => {
      makeSprite({name: 'sprite1', location: {x: 0, y: 0}});
      commands.setProp({name: 'sprite1'}, 'direction', 90);
      commands.moveForward({name: 'sprite1'}, 100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.be.within(
        0,
        0.1
      );
      expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(
        400 - 100
      );
    });

    it('can move diagonally', () => {
      makeSprite({name: 'sprite1', location: {x: 0, y: 0}});
      commands.setProp({name: 'sprite1'}, 'direction', 45);
      commands.moveForward({name: 'sprite1'}, 100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.be.within(
        70,
        71
      );
      let y = 400 - spriteCommands.getProp({name: 'sprite1'}, 'y');
      expect(y).to.be.within(70, 71);
    });
  });

  it('moveInDirection', () => {
    makeSprite({name: 'sprite1', location: {x: 0, y: 0}});
    commands.moveInDirection({name: 'sprite1'}, 50, 'South');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(0);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400 - 50);

    commands.moveInDirection({name: 'sprite1'}, 50, 'West');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(-50);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400 - 50);

    commands.moveInDirection({name: 'sprite1'}, 50, 'North');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(-50);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400);

    commands.moveInDirection({name: 'sprite1'}, 50, 'East');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.equal(0);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.equal(400);
  });

  it('moveToward', () => {
    makeSprite({name: 'sprite1', location: {x: 0, y: 50}});

    commands.moveToward({name: 'sprite1'}, 100, {x: 123, y: 321});
    expect(spriteCommands.getProp({name: 'sprite1'}, 'x')).to.be.within(
      41.3,
      41.4
    );
    let expectedY = 400 - (50 + 91.1);
    expect(spriteCommands.getProp({name: 'sprite1'}, 'y')).to.be.within(
      expectedY,
      expectedY + 0.1
    );
  });

  describe('setProp', () => {
    beforeEach(function() {
      makeSprite({name: 'sprite1', location: {x: 0, y: 0}});
    });
    it('sets direction', () => {
      commands.setProp({name: 'sprite1'}, 'direction', 100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(
        100
      );
      commands.setProp({name: 'sprite1'}, 'direction', 400);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'direction')).to.equal(
        40
      );
    });

    it('sets arbitrary properties', () => {
      commands.setProp({name: 'sprite1'}, 'someProp', 100);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'someProp')).to.equal(
        100
      );
    });

    it('sets scale, height, and width', () => {
      let image = new p5.Image(100, 100, p5Wrapper.p5);
      let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
      let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
      let animation = new p5Wrapper.p5.Animation(sheet);
      p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
      makeSprite({name: 'sprite1', animation: 'costume_label'});
      expect(spriteCommands.getProp({name: 'sprite1'}, 'scale')).to.equal(100);
      commands.setProp({name: 'sprite1'}, 'scale', 50);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'scale')).to.equal(50);

      commands.setProp({name: 'sprite1'}, 'height', 500);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'height')).to.equal(250);

      commands.setProp({name: 'sprite1'}, 'width', 500);
      expect(spriteCommands.getProp({name: 'sprite1'}, 'width')).to.equal(250);
    });
  });

  it('turn', () => {
    makeSprite({name: 'sprite1'});
    commands.turn({name: 'sprite1'}, 90, 'right');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'rotation')).to.equal(90);

    commands.turn({name: 'sprite1'}, 180, 'left');
    expect(spriteCommands.getProp({name: 'sprite1'}, 'rotation')).to.equal(-90);
  });
});
