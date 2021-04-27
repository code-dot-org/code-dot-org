/* global p5 */
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import {commands as actionCommands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as behaviorCommands} from '@cdo/apps/p5lab/spritelab/commands/behaviorCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Behavior Commands', () => {
  let p5Wrapper, makeSprite, animation;
  beforeEach(() => {
    p5Wrapper = createP5Wrapper();
    makeSprite = spriteCommands.makeSprite.bind(p5Wrapper.p5);
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    animation = new p5Wrapper.p5.Animation(sheet);
    coreLibrary.reset();
  });

  describe('draggableFunc', () => {
    let mousePressedOverStub, mouseWentDownStub, mouseWentUpStub;
    beforeEach(() => {
      mousePressedOverStub = sinon.stub(p5Wrapper.p5, 'mousePressedOver');
      mouseWentDownStub = sinon.stub(p5Wrapper.p5, 'mouseWentDown');
      mouseWentUpStub = sinon.stub(p5Wrapper.p5, 'mouseWentUp');
    });

    afterEach(() => {
      mousePressedOverStub.restore();
      mouseWentDownStub.restore();
      mouseWentUpStub.restore();
    });

    it('can drag a sprite', () => {
      makeSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;
    });

    it('dragging moves the sprite to the mouse position', () => {
      makeSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      p5Wrapper.p5.mouseX = 200;
      p5Wrapper.p5.mouseY = 200;
      // First tick, press down on the sprite to start the drag.
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;

      // Next tick, sprite moves to new mouse position.
      mouseWentDownStub.returns(false);
      p5Wrapper.p5.mouseX = 100;
      p5Wrapper.p5.mouseY = 100;
      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'sprite'});

      expect(sprite.x).to.equal(100);
      expect(sprite.y).to.equal(100);
    });

    it('drag ends when mouse goes up', () => {
      makeSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      p5Wrapper.p5.mouseX = 200;
      p5Wrapper.p5.mouseY = 200;
      // First tick, press down on the sprite to start the drag.
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;

      // Next tick, mouse went up, so sprite moves to new mouse position
      // and drag ends.
      mouseWentDownStub.returns(false);
      mouseWentUpStub.returns(true);
      p5Wrapper.p5.mouseX = 100;
      p5Wrapper.p5.mouseY = 100;
      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'sprite'});
      expect(sprite.x).to.equal(100);
      expect(sprite.y).to.equal(100);
      expect(sprite.dragging).to.be.false;
    });

    it('only drags the top sprite', () => {
      makeSprite({name: 'bottom', location: {x: 200, y: 200}});
      const bottom = coreLibrary.getSpriteArray({name: 'bottom'})[0];

      makeSprite({name: 'top', location: {x: 200, y: 200}});
      const top = coreLibrary.getSpriteArray({name: 'top'})[0];

      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);

      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'top'});
      expect(top.dragging).to.be.true;

      behaviorCommands.draggableFunc(p5Wrapper.p5)({name: 'bottom'});
      expect(!!bottom.dragging).to.be.false;
    });
  });

  describe('followingTargetsFunc', () => {
    it('moves towards the closest target', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 125, y: 200}});
      makeSprite({animation: 'target', location: {x: 125, y: 125}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'follow');

      behaviorCommands.followingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(195);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.followingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });

      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });
  });

  describe('avoidingTargetsFunc', () => {
    it('moves away from the average position of targets in range', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 150, y: 250}});
      makeSprite({animation: 'target', location: {x: 150, y: 150}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'avoid');

      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(205);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });

      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets in range', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 100, y: 100}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'avoid');

      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });
  });
});
