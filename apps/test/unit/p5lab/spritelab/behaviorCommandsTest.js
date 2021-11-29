/* global p5 */
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';
import {commands as actionCommands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as behaviorCommands} from '@cdo/apps/p5lab/spritelab/commands/behaviorCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Behavior Commands', () => {
  let coreLibrary, animation;
  beforeEach(() => {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
    let image = new p5.Image(100, 100, coreLibrary.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new coreLibrary.p5.SpriteSheet(image, frames);
    animation = new coreLibrary.p5.Animation(sheet);
  });

  describe('draggableFunc', () => {
    let mousePressedOverStub, mouseWentDownStub, mouseWentUpStub;
    beforeEach(() => {
      mousePressedOverStub = sinon.stub(coreLibrary.p5, 'mousePressedOver');
      mouseWentDownStub = sinon.stub(coreLibrary.p5, 'mouseWentDown');
      mouseWentUpStub = sinon.stub(coreLibrary.p5, 'mouseWentUp');
    });

    afterEach(() => {
      mousePressedOverStub.restore();
      mouseWentDownStub.restore();
      mouseWentUpStub.restore();
    });

    it('can drag a sprite', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;
    });

    it('dragging moves the sprite to the mouse position', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      coreLibrary.p5.mouseX = 200;
      coreLibrary.p5.mouseY = 200;
      // First tick, press down on the sprite to start the drag.
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;

      // Next tick, sprite moves to new mouse position.
      mouseWentDownStub.returns(false);
      coreLibrary.p5.mouseX = 100;
      coreLibrary.p5.mouseY = 100;
      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'sprite'});

      expect(sprite.x).to.equal(100);
      expect(sprite.y).to.equal(100);
    });

    it('drag ends when mouse goes up', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = coreLibrary.getSpriteArray({name: 'sprite'})[0];
      coreLibrary.p5.mouseX = 200;
      coreLibrary.p5.mouseY = 200;
      // First tick, press down on the sprite to start the drag.
      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);
      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'sprite'});
      expect(sprite.dragging).to.be.true;

      // Next tick, mouse went up, so sprite moves to new mouse position
      // and drag ends.
      mouseWentDownStub.returns(false);
      mouseWentUpStub.returns(true);
      coreLibrary.p5.mouseX = 100;
      coreLibrary.p5.mouseY = 100;
      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'sprite'});
      expect(sprite.x).to.equal(100);
      expect(sprite.y).to.equal(100);
      expect(sprite.dragging).to.be.false;
    });

    it('only drags the top sprite', () => {
      coreLibrary.addSprite({name: 'bottom', location: {x: 200, y: 200}});
      const bottom = coreLibrary.getSpriteArray({name: 'bottom'})[0];

      coreLibrary.addSprite({name: 'top', location: {x: 200, y: 200}});
      const top = coreLibrary.getSpriteArray({name: 'top'})[0];

      mousePressedOverStub.returns(true);
      mouseWentDownStub.returns(true);

      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'top'});
      expect(top.dragging).to.be.true;

      behaviorCommands.draggableFunc.apply(coreLibrary)({name: 'bottom'});
      expect(!!bottom.dragging).to.be.false;
    });
  });

  describe('followingTargetsFunc', () => {
    it('moves towards the closest target', () => {
      coreLibrary.p5._predefinedSpriteAnimations = {target: animation};
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 125, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 125, y: 125}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'follow'
      ]);

      behaviorCommands.followingTargetsFunc.apply(coreLibrary)({
        name: 'subject'
      });
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'x'])
      ).to.equal(195);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'y'])
      ).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.followingTargetsFunc.apply(coreLibrary)({
        name: 'subject'
      });

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'x'])
      ).to.equal(200);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'y'])
      ).to.equal(200);
    });
  });

  describe('avoidingTargetsFunc', () => {
    it('moves away from the average position of targets in range', () => {
      coreLibrary.p5._predefinedSpriteAnimations = {target: animation};
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 150, y: 250}});
      coreLibrary.addSprite({animation: 'target', location: {x: 150, y: 150}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'avoid'
      ]);

      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject'
      });
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'x'])
      ).to.equal(205);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'y'])
      ).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject'
      });

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'x'])
      ).to.equal(200);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'y'])
      ).to.equal(200);
    });

    it('does not move if there are no targets in range', () => {
      coreLibrary.p5._predefinedSpriteAnimations = {target: animation};
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 100, y: 100}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'avoid'
      ]);

      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject'
      });
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'x'])
      ).to.equal(200);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'subject'}, 'y'])
      ).to.equal(200);
    });
  });
});
