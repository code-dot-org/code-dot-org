/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {stub} from 'sinon';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';
import * as spritelabLibrary from '@cdo/apps/p5lab/spritelab/spritelabLibrary';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';

describe('Sprite Utils', () => {
  let gameLabP5, createSprite, animation;

  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    let image = new p5.Image(100, 100, gameLabP5.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
    animation = new gameLabP5.p5.Animation(sheet);
    spritelabLibrary.reset();
  });

  describe('Sprite Map', () => {
    it('sprite ids increase starting at 0', () => {
      let sprite1 = createSprite();
      let id1 = spritelabLibrary.addSprite(sprite1);
      expect(id1).to.equal(0);

      let sprite2 = createSprite();
      let id2 = spritelabLibrary.addSprite(sprite2);
      expect(id2).to.equal(1);

      let sprite3 = createSprite();
      let id3 = spritelabLibrary.addSprite(sprite3);
      expect(id3).to.equal(2);

      expect(spritelabLibrary.getSpriteIdsInUse()).to.have.members([0, 1, 2]);
    });

    it('deleting a sprite removes its id', () => {
      let sprite1 = createSprite();
      let id1 = spritelabLibrary.addSprite(sprite1);
      expect(spritelabLibrary.getSpriteIdsInUse()).to.have.members([0]);

      spritelabLibrary.deleteSprite(id1);
      expect(spritelabLibrary.getSpriteIdsInUse()).to.have.members([]);

      let sprite2 = createSprite();
      spritelabLibrary.addSprite(sprite2);
      expect(spritelabLibrary.getSpriteIdsInUse()).to.have.members([1]);
    });

    it('can get all animations in use', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spritelabLibrary.addSprite(sprite1);
      spritelabLibrary.addSprite(sprite2);
      spritelabLibrary.addSprite(sprite3);

      expect(spritelabLibrary.getAnimationsInUse()).to.have.members(['a', 'b']);
    });
  });

  describe('getSpriteArray', () => {
    it('works with ids', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      let id1 = spritelabLibrary.addSprite(sprite1);
      let id2 = spritelabLibrary.addSprite(sprite2);
      let id3 = spritelabLibrary.addSprite(sprite3);

      expect(spritelabLibrary.getSpriteArray(id1)).to.have.members([sprite1]);
      expect(spritelabLibrary.getSpriteArray(id2)).to.have.members([sprite2]);
      expect(spritelabLibrary.getSpriteArray(id3)).to.have.members([sprite3]);
    });

    it('works with animation groups', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spritelabLibrary.addSprite(sprite1);
      spritelabLibrary.addSprite(sprite2);
      spritelabLibrary.addSprite(sprite3);

      expect(spritelabLibrary.getSpriteArray('a')).to.have.members([
        sprite1,
        sprite3
      ]);
      expect(spritelabLibrary.getSpriteArray('b')).to.have.members([sprite2]);
    });
  });

  describe('Behaviors', () => {
    it('Can add behaviors for a single sprite', () => {
      const behaviorLog = [];
      let sprite = createSprite();
      spritelabLibrary.addSprite(sprite);
      let behavior1 = {
        func: () => behaviorLog.push('behavior 1 ran'),
        name: 'behavior1'
      };
      let behavior2 = {
        func: () => behaviorLog.push('behavior 2 ran'),
        name: 'behavior2'
      };
      spritelabLibrary.addBehavior(sprite, behavior1);
      spritelabLibrary.addBehavior(sprite, behavior2);
      spritelabLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal(['behavior 1 ran', 'behavior 2 ran']);
    });

    it('can add behaviors with multiple sprites', () => {
      const behaviorLog = [];
      let sprite1 = createSprite();
      spritelabLibrary.addSprite(sprite1);
      let sprite2 = createSprite();
      spritelabLibrary.addSprite(sprite2);
      let behavior = {
        func: id => behaviorLog.push('behavior ran for sprite ' + id),
        name: 'behavior'
      };

      spritelabLibrary.addBehavior(sprite1, behavior);
      spritelabLibrary.addBehavior(sprite2, behavior);
      spritelabLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        'behavior ran for sprite 0',
        'behavior ran for sprite 1'
      ]);
    });

    it('can remove individual behaviors', () => {
      const behaviorLog = [];
      let sprite0 = createSprite();
      spritelabLibrary.addSprite(sprite0);
      let sprite1 = createSprite();
      spritelabLibrary.addSprite(sprite1);
      let behavior1 = {
        func: id => behaviorLog.push('behavior 1 ran for sprite ' + id),
        name: 'behavior1'
      };
      let behavior2 = {
        func: id => behaviorLog.push('behavior 2 ran for sprite ' + id),
        name: 'behavior2'
      };

      spritelabLibrary.addBehavior(sprite0, behavior1);
      spritelabLibrary.addBehavior(sprite1, behavior1);
      spritelabLibrary.addBehavior(sprite0, behavior2);
      spritelabLibrary.addBehavior(sprite1, behavior2);
      spritelabLibrary.runBehaviors();

      spritelabLibrary.removeBehavior(sprite0, behavior1);
      spritelabLibrary.removeBehavior(sprite1, behavior2);
      spritelabLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0'
      ]);
    });

    it('can remove all behaviors for a sprite', () => {
      const behaviorLog = [];
      let sprite0 = createSprite();
      spritelabLibrary.addSprite(sprite0);
      let sprite1 = createSprite();
      spritelabLibrary.addSprite(sprite1);
      let behavior1 = {
        func: id => behaviorLog.push('behavior 1 ran for sprite ' + id),
        name: 'behavior1'
      };
      let behavior2 = {
        func: id => behaviorLog.push('behavior 2 ran for sprite ' + id),
        name: 'behavior2'
      };

      spritelabLibrary.addBehavior(sprite0, behavior1);
      spritelabLibrary.addBehavior(sprite1, behavior1);
      spritelabLibrary.addBehavior(sprite0, behavior2);
      spritelabLibrary.addBehavior(sprite1, behavior2);
      spritelabLibrary.runBehaviors();

      spritelabLibrary.removeAllBehaviors(sprite0);
      spritelabLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 1'
      ]);
    });
  });

  describe('Events', () => {
    it('Can run key events', () => {
      const keyWentDownStub = stub(gameLabP5.p5, 'keyWentDown').returns(true);
      const keyDownStub = stub(gameLabP5.p5, 'keyDown').returns(true);
      const eventLog = [];
      spritelabLibrary.addEvent('whenpress', {key: 'up'}, () =>
        eventLog.push('when up press ran')
      );
      spritelabLibrary.addEvent('whilepress', {key: 'down'}, () =>
        eventLog.push('while down press ran')
      );

      spritelabLibrary.runEvents(gameLabP5.p5);

      expect(eventLog).to.deep.equal([
        'when up press ran',
        'while down press ran'
      ]);

      keyWentDownStub.restore();
      keyDownStub.restore();
    });

    describe('Click events', () => {
      let eventLog, mouseWentDownStub, mouseIsOverStub, mousePressedOverStub;
      beforeEach(function() {
        eventLog = [];
        mouseWentDownStub = stub(gameLabP5.p5, 'mouseWentDown');
        mouseIsOverStub = stub(gameLabP5.p5, 'mouseIsOver');
        mousePressedOverStub = stub(gameLabP5.p5, 'mousePressedOver');
      });
      afterEach(function() {
        mouseWentDownStub.restore();
        mouseIsOverStub.restore();
        mousePressedOverStub.restore();
      });
      it('works with individual sprites', () => {
        mouseWentDownStub.returns(true);
        mouseIsOverStub.returns(true);
        mousePressedOverStub.returns(true);
        let id = spritelabLibrary.addSprite(createSprite());
        spritelabLibrary.addEvent('whenclick', {sprite: id}, () =>
          eventLog.push('when click ran')
        );
        spritelabLibrary.addEvent('whileclick', {sprite: id}, () =>
          eventLog.push('while click ran')
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when click ran', 'while click ran']);
      });

      it('works with animation groups', () => {
        mouseWentDownStub.returns(true);

        let sprite1 = createSprite();
        let sprite2 = createSprite();
        let sprite3 = createSprite();
        sprite1.addAnimation('a', animation);
        sprite2.addAnimation('b', animation);
        sprite3.addAnimation('a', animation);
        let id1 = spritelabLibrary.addSprite(sprite1);
        spritelabLibrary.addSprite(sprite2);
        spritelabLibrary.addSprite(sprite3);

        mouseIsOverStub.withArgs(sprite1).returns(true);
        mouseIsOverStub.withArgs(sprite2).returns(true);
        mouseIsOverStub.withArgs(sprite3).returns(false);

        spritelabLibrary.addEvent('whenclick', {sprite: 'a'}, extraArgs =>
          eventLog.push(extraArgs.sprite + ' was clicked')
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal([id1 + ' was clicked']);
      });

      it('calls the callback twice if you click overlapping sprites', () => {
        mouseWentDownStub.returns(true);

        let sprite1 = createSprite();
        let sprite2 = createSprite();
        sprite1.addAnimation('a', animation);
        sprite2.addAnimation('a', animation);
        let id1 = spritelabLibrary.addSprite(sprite1);
        let id2 = spritelabLibrary.addSprite(sprite2);

        mouseIsOverStub.withArgs(sprite1).returns(true);
        mouseIsOverStub.withArgs(sprite2).returns(true);

        spritelabLibrary.addEvent('whenclick', {sprite: 'a'}, extraArgs =>
          eventLog.push(extraArgs.sprite + ' was clicked')
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal([
          id1 + ' was clicked',
          id2 + ' was clicked'
        ]);
      });
    });

    describe('Collision Events with individual sprites', () => {
      let eventLog, sprite, spriteId, target, targetId, overlapStub;
      beforeEach(function() {
        eventLog = [];
        sprite = createSprite();
        spriteId = spritelabLibrary.addSprite(sprite);
        target = createSprite();
        targetId = spritelabLibrary.addSprite(target);
        overlapStub = stub(sprite, 'overlap');
      });

      afterEach(function() {
        overlapStub.restore();
      });

      it('Can run collision events', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spritelabLibrary.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );

        spritelabLibrary.addEvent(
          'whiletouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('while touch ran')
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran', 'while touch ran']);
      });

      it('while touching continues to call the callback', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spritelabLibrary.addEvent(
          'whiletouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('while touch ran')
        );
        // First tick- expect the callback to be called
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['while touch ran']);

        // Second tick- expect the callback to be called again
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['while touch ran', 'while touch ran']);
      });

      it('when touching does not continue to call the callback for the same overlap', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spritelabLibrary.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called again
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);
      });

      it('when touching calls the callback again if the sprites stop and start touching', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(false);
        overlapStub.onCall(2).returns(true);
        spritelabLibrary.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called (overlap returns false)
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Third tick- expect the callback to be called again
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran', 'when touch ran']);
      });
    });

    describe('Collision Events with animation groups', () => {
      let eventLog,
        overlapStub1,
        overlapStub2,
        sprite1,
        sprite2,
        target1,
        target2;
      beforeEach(function() {
        eventLog = [];
        sprite1 = createSprite(); // id = 0
        sprite2 = createSprite(); // id = 1
        sprite1.addAnimation('a', animation);
        sprite2.addAnimation('a', animation);

        target1 = createSprite(); // id = 2
        target2 = createSprite(); // id = 3
        target1.addAnimation('b', animation);
        target2.addAnimation('b', animation);

        spritelabLibrary.addSprite(sprite1);
        spritelabLibrary.addSprite(sprite2);
        spritelabLibrary.addSprite(target1);
        spritelabLibrary.addSprite(target2);

        overlapStub1 = stub(sprite1, 'overlap');
        overlapStub2 = stub(sprite2, 'overlap');
      });
      afterEach(function() {
        overlapStub1.restore();
        overlapStub2.restore();
      });
      it('Calls the callback for each overlap - 1 sprite, 1 target', () => {
        // Only one sprite is touching one target
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(false);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(false);

        spritelabLibrary.addEvent(
          'whentouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`when: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.addEvent(
          'whiletouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`while: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when: 0, 2', 'while: 0, 2']);
      });

      it('Calls the callback for each overlap - 1 sprite, 2 targets', () => {
        // One 'a' sprite is touching two 'b' sprites
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(true);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(false);

        spritelabLibrary.addEvent(
          'whentouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`when: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 0, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 1 target', () => {
        // Two 'a' sprites, each touching one 'b' sprite
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(false);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(true);

        spritelabLibrary.addEvent(
          'whentouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`when: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 1, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 2 targets', () => {
        // Two 'a' sprites, each touching two 'b' sprites
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(true);
        overlapStub2.withArgs(target1).returns(true);
        overlapStub2.withArgs(target2).returns(true);

        spritelabLibrary.addEvent(
          'whiletouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`while: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal([
          'while: 0, 2',
          'while: 0, 3',
          'while: 1, 2',
          'while: 1, 3'
        ]);
      });

      it('Calls the callback if costume group changes', () => {
        gameLabP5.p5._predefinedSpriteAnimations = {b: animation, c: animation};
        // 'a' sprite overlapping 'b' sprite
        overlapStub1.withArgs(target1).returns(true);
        spritelabLibrary.addEvent(
          'whentouch',
          {sprite1: 'a', sprite2: 'b'},
          extraArgs =>
            eventLog.push(`when: ${extraArgs.sprite}, ${extraArgs.target}`)
        );
        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when: 0, 2']);

        // 'b' sprite changes to 'c' sprite
        spriteCommands.setAnimation(2, 'c');
        spritelabLibrary.runEvents(gameLabP5.p5);
        // Event does not fire
        expect(eventLog).to.deep.equal(['when: 0, 2']);

        // 'c' sprite changes back to 'b' sprite
        spriteCommands.setAnimation(2, 'b');
        spritelabLibrary.runEvents(gameLabP5.p5);
        // Event does fire again
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 0, 2']);
      });

      it('Collision events with the same costume group work', () => {
        // Two 'a' sprites, overlapping each other
        overlapStub1.withArgs(sprite1).returns(false);
        overlapStub1.withArgs(sprite2).returns(true);
        overlapStub2.withArgs(sprite1).returns(true);
        overlapStub2.withArgs(sprite2).returns(false);

        spritelabLibrary.addEvent(
          'whiletouch',
          {sprite1: 'a', sprite2: 'a'},
          extraArgs =>
            eventLog.push(`while: ${extraArgs.sprite}, ${extraArgs.target}`)
        );

        spritelabLibrary.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['while: 0, 1', 'while: 1, 0']);
      });
    });
  });
});
