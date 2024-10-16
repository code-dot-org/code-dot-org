import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  workspaceAlertTypes,
  displayWorkspaceAlert,
} from '@cdo/apps/code-studio/projectRedux';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import {
  MAX_NUM_SPRITES,
  SPRITE_WARNING_BUFFER,
} from '@cdo/apps/p5lab/spritelab/constants';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';
import * as redux from '@cdo/apps/redux';
import msg from '@cdo/locale';

import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';
import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('SpriteLab Core Library', () => {
  let coreLibrary;
  const spriteName = 'spriteName';

  beforeEach(function () {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
    let image = new p5.Image(100, 100, coreLibrary.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new coreLibrary.p5.SpriteSheet(image, frames);
    let animation = new coreLibrary.p5.Animation(sheet);
    coreLibrary.p5._predefinedSpriteAnimations = {
      a: animation,
      b: animation,
      c: animation,
      costume_label: animation,
    };
  });

  describe('addSprite', () => {
    it('returns an id', () => {
      expect(coreLibrary.addSprite()).to.equal(0);
      expect(coreLibrary.addSprite()).to.equal(1);
      expect(coreLibrary.addSprite()).to.equal(2);
    });

    it('location defaults to (200,200)', () => {
      coreLibrary.addSprite({name: spriteName});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).to.equal(200);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).to.equal(200);
    });

    it('location picker works', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).to.equal(123);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).to.equal(400 - 321);
    });

    it('location function works', () => {
      let locationFunc = () => ({x: 123, y: 321});
      coreLibrary.addSprite({name: spriteName, location: locationFunc});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).to.equal(123);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).to.equal(400 - 321);
    });

    it('setting animation works', () => {
      coreLibrary.addSprite({name: spriteName, animation: 'costume_label'});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'costume',
        ])
      ).to.equal('costume_label');
    });
  });

  describe('Sprite Map', () => {
    it('sprite ids increase starting at 0', () => {
      let id1 = coreLibrary.addSprite();
      expect(id1).to.equal(0);

      let id2 = coreLibrary.addSprite();
      expect(id2).to.equal(1);

      let id3 = coreLibrary.addSprite();
      expect(id3).to.equal(2);

      expect(coreLibrary.getSpriteIdsInUse()).to.have.members([0, 1, 2]);
    });

    it('deleting a sprite removes its id', () => {
      let id1 = coreLibrary.addSprite();
      expect(coreLibrary.getSpriteIdsInUse()).to.have.members([0]);

      coreLibrary.deleteSprite(id1);
      expect(coreLibrary.getSpriteIdsInUse()).to.have.members([]);

      coreLibrary.addSprite();
      expect(coreLibrary.getSpriteIdsInUse()).to.have.members([1]);
    });

    it('can get all animations in use', () => {
      coreLibrary.addSprite({animation: 'a'});
      coreLibrary.addSprite({animation: 'b'});
      coreLibrary.addSprite({animation: 'a'});

      expect(coreLibrary.getAnimationsInUse()).to.have.members(['a', 'b']);
    });

    it('sprite names are unique', () => {
      let id1 = coreLibrary.addSprite({name: spriteName});
      let sprite1 = coreLibrary.nativeSpriteMap[id1];

      expect(sprite1.name).to.equal(spriteName);

      let id2 = coreLibrary.addSprite({name: spriteName});
      let sprite2 = coreLibrary.nativeSpriteMap[id2];

      expect(sprite1.name).to.equal(undefined);
      expect(sprite2.name).to.equal(spriteName);
    });
  });

  describe('getSpriteArray', () => {
    it('works with ids', () => {
      let id1 = coreLibrary.addSprite();
      let id2 = coreLibrary.addSprite();
      let id3 = coreLibrary.addSprite();

      expect(coreLibrary.getSpriteArray({id: id1})).to.have.members([
        coreLibrary.nativeSpriteMap[id1],
      ]);
      expect(coreLibrary.getSpriteArray({id: id2})).to.have.members([
        coreLibrary.nativeSpriteMap[id2],
      ]);
      expect(coreLibrary.getSpriteArray({id: id3})).to.have.members([
        coreLibrary.nativeSpriteMap[id3],
      ]);
    });

    it('works with animation groups', () => {
      let id1 = coreLibrary.addSprite({animation: 'a'});
      let id2 = coreLibrary.addSprite({animation: 'b'});
      let id3 = coreLibrary.addSprite({animation: 'a'});

      expect(coreLibrary.getSpriteArray({costume: 'a'})).to.have.members([
        coreLibrary.nativeSpriteMap[id1],
        coreLibrary.nativeSpriteMap[id3],
      ]);
      expect(coreLibrary.getSpriteArray({costume: 'b'})).to.have.members([
        coreLibrary.nativeSpriteMap[id2],
      ]);
    });

    it('works with sprite names', () => {
      let id1 = coreLibrary.addSprite({name: spriteName});
      let id2 = coreLibrary.addSprite({name: 'name2'});

      expect(coreLibrary.getSpriteArray({name: spriteName})).to.have.members([
        coreLibrary.nativeSpriteMap[id1],
      ]);
      expect(coreLibrary.getSpriteArray({name: 'name2'})).to.have.members([
        coreLibrary.nativeSpriteMap[id2],
      ]);

      let id3 = coreLibrary.addSprite({name: spriteName});
      expect(coreLibrary.getSpriteArray({name: spriteName})).to.have.members([
        coreLibrary.nativeSpriteMap[id3],
      ]);
    });
  });

  describe('The number of sprites created is capped by MAX_NUM_SPRITES', () => {
    it(`caps at ${MAX_NUM_SPRITES} sprites`, () => {
      for (let i = 0; i < 50000; i++) {
        coreLibrary.addSprite();
      }
      expect(coreLibrary.getNumberOfSprites()).to.equal(MAX_NUM_SPRITES);
    });
  });

  describe('Workspace alert dispatch', () => {
    let stubbedDispatch;
    beforeEach(function () {
      stubbedDispatch = stub();
      stub(redux, 'getStore').returns({
        dispatch: stubbedDispatch,
      });
    });

    afterEach(function () {
      redux.getStore.restore();
    });

    // If the total number of sprites created is equal to or less than
    // MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER, then a display workspace alert
    // should not have been dispatched
    it(`If ${
      MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER
    } sprites or less are created, a workspace alert is NOT dispatched`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER; i++) {
        coreLibrary.addSprite();
      }
      expect(stubbedDispatch).to.not.have.been.calledWith(
        displayWorkspaceAlert(
          workspaceAlertTypes.warning,
          msg.spriteLimitReached({limit: MAX_NUM_SPRITES}),
          /* bottom */ true
        )
      );
    });
    // Once the total number of sprites created is equal to MAX_NUM_SPRITES, a
    // displayWorkspaceAlert has been dispatched
    it(`When ${MAX_NUM_SPRITES} sprites is reached, a workspace alert was dispatched`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES; i++) {
        coreLibrary.addSprite();
      }
      expect(stubbedDispatch).to.have.been.calledOnceWith(
        displayWorkspaceAlert(
          workspaceAlertTypes.warning,
          msg.spriteLimitReached({limit: MAX_NUM_SPRITES}),
          /* bottom */ true
        )
      );
    });

    // When total number of sprites is >= MAX_NUM_SPRITES, the dispatch of
    // displayWorkspaceAlert will occur only once due to the early return from
    // the reachedSpriteMax function
    it(`Even when 100 more than ${MAX_NUM_SPRITES} sprites is reached, workspace alert is dispatched only once`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES + 100; i++) {
        coreLibrary.addSprite();
      }
      expect(stubbedDispatch).to.have.been.calledOnceWith(
        displayWorkspaceAlert(
          workspaceAlertTypes.warning,
          msg.spriteLimitReached({limit: MAX_NUM_SPRITES}),
          /* bottom */ true
        )
      );
    });
  });

  describe('Behaviors', () => {
    it('Can add behaviors for a single sprite', () => {
      const behaviorLog = [];
      let id = coreLibrary.addSprite();
      let sprite = coreLibrary.nativeSpriteMap[id];
      let behavior1 = {
        func: () => behaviorLog.push('behavior 1 ran'),
        name: 'behavior1',
      };
      let behavior2 = {
        func: () => behaviorLog.push('behavior 2 ran'),
        name: 'behavior2',
      };
      coreLibrary.addBehavior(sprite, behavior1);
      coreLibrary.addBehavior(sprite, behavior2);
      coreLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal(['behavior 1 ran', 'behavior 2 ran']);
    });

    it('can add behaviors with multiple sprites', () => {
      const behaviorLog = [];

      let id1 = coreLibrary.addSprite(sprite1);
      let sprite1 = coreLibrary.nativeSpriteMap[id1];
      let id2 = coreLibrary.addSprite(sprite2);
      let sprite2 = coreLibrary.nativeSpriteMap[id2];
      let behavior = {
        func: arg => behaviorLog.push('behavior ran for sprite ' + arg.id),
        name: 'behavior',
      };

      coreLibrary.addBehavior(sprite1, behavior);
      coreLibrary.addBehavior(sprite2, behavior);
      coreLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        'behavior ran for sprite 0',
        'behavior ran for sprite 1',
      ]);
    });

    it('can remove individual behaviors', () => {
      const behaviorLog = [];

      let id0 = coreLibrary.addSprite(sprite0);
      let sprite0 = coreLibrary.nativeSpriteMap[id0];
      let id1 = coreLibrary.addSprite(sprite1);
      let sprite1 = coreLibrary.nativeSpriteMap[id1];
      let behavior1 = {
        func: arg => behaviorLog.push('behavior 1 ran for sprite ' + arg.id),
        name: 'behavior1',
      };
      let behavior2 = {
        func: arg => behaviorLog.push('behavior 2 ran for sprite ' + arg.id),
        name: 'behavior2',
      };

      coreLibrary.addBehavior(sprite0, behavior1);
      coreLibrary.addBehavior(sprite1, behavior1);
      coreLibrary.addBehavior(sprite0, behavior2);
      coreLibrary.addBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      coreLibrary.removeBehavior(sprite0, behavior1);
      coreLibrary.removeBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
      ]);
    });

    it('can remove all behaviors for a sprite', () => {
      const behaviorLog = [];

      let id0 = coreLibrary.addSprite();
      let sprite0 = coreLibrary.nativeSpriteMap[id0];
      let id1 = coreLibrary.addSprite();
      let sprite1 = coreLibrary.nativeSpriteMap[id1];
      let behavior1 = {
        func: arg => behaviorLog.push('behavior 1 ran for sprite ' + arg.id),
        name: 'behavior1',
      };
      let behavior2 = {
        func: arg => behaviorLog.push('behavior 2 ran for sprite ' + arg.id),
        name: 'behavior2',
      };

      coreLibrary.addBehavior(sprite0, behavior1);
      coreLibrary.addBehavior(sprite1, behavior1);
      coreLibrary.addBehavior(sprite0, behavior2);
      coreLibrary.addBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      coreLibrary.removeAllBehaviors(sprite0);
      coreLibrary.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 1',
      ]);
    });
  });

  describe('Events', () => {
    it('Can run key events', () => {
      const keyWentDownStub = stub(coreLibrary.p5, 'keyWentDown').returns(true);
      const keyDownStub = stub(coreLibrary.p5, 'keyDown').returns(true);
      const eventLog = [];
      coreLibrary.addEvent('whenpress', {key: 'up'}, () =>
        eventLog.push('when up press ran')
      );
      coreLibrary.addEvent('whilepress', {key: 'down'}, () =>
        eventLog.push('while down press ran')
      );

      coreLibrary.runEvents();

      expect(eventLog).to.deep.equal([
        'when up press ran',
        'while down press ran',
      ]);

      keyWentDownStub.restore();
      keyDownStub.restore();
    });

    describe('Click events', () => {
      let eventLog, mouseWentDownStub, mouseIsOverStub, mousePressedOverStub;
      beforeEach(function () {
        eventLog = [];
        mouseWentDownStub = stub(coreLibrary.p5, 'mouseWentDown');
        mouseIsOverStub = stub(coreLibrary.p5, 'mouseIsOver');
        mousePressedOverStub = stub(coreLibrary.p5, 'mousePressedOver');
      });
      afterEach(function () {
        mouseWentDownStub.restore();
        mouseIsOverStub.restore();
        mousePressedOverStub.restore();
      });
      it('works with individual sprites', () => {
        mouseWentDownStub.returns(true);
        mouseIsOverStub.returns(true);
        mousePressedOverStub.returns(true);
        coreLibrary.addSprite({name: spriteName});
        coreLibrary.addEvent('whenclick', {sprite: {name: spriteName}}, () =>
          eventLog.push('when click ran')
        );
        coreLibrary.addEvent('whileclick', {sprite: {name: spriteName}}, () =>
          eventLog.push('while click ran')
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when click ran', 'while click ran']);
      });

      it('works with animation groups', () => {
        mouseWentDownStub.returns(true);

        let id1 = coreLibrary.addSprite({animation: 'a'});
        let sprite1 = coreLibrary.nativeSpriteMap[id1];
        let id2 = coreLibrary.addSprite({animation: 'b'});
        let sprite2 = coreLibrary.nativeSpriteMap[id2];
        let id3 = coreLibrary.addSprite({animation: 'a'});
        let sprite3 = coreLibrary.nativeSpriteMap[id3];

        mouseIsOverStub.withArgs(sprite1).returns(true);
        mouseIsOverStub.withArgs(sprite2).returns(true);
        mouseIsOverStub.withArgs(sprite3).returns(false);

        coreLibrary.addEvent('whenclick', {sprite: {costume: 'a'}}, extraArgs =>
          eventLog.push(extraArgs.clickedSprite + ' was clicked')
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal([id1 + ' was clicked']);
      });

      it('calls the callback twice if you click overlapping sprites', () => {
        mouseWentDownStub.returns(true);

        let id1 = coreLibrary.addSprite({animation: 'a'});
        let sprite1 = coreLibrary.nativeSpriteMap[id1];
        let id2 = coreLibrary.addSprite({animation: 'a'});
        let sprite2 = coreLibrary.nativeSpriteMap[id2];

        mouseIsOverStub.withArgs(sprite1).returns(true);
        mouseIsOverStub.withArgs(sprite2).returns(true);

        coreLibrary.addEvent('whenclick', {sprite: {costume: 'a'}}, extraArgs =>
          eventLog.push(extraArgs.clickedSprite + ' was clicked')
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal([
          id1 + ' was clicked',
          id2 + ' was clicked',
        ]);
      });
    });

    describe('Collision Events with individual sprites', () => {
      let eventLog, sprite, overlapStub;
      const targetName = 'targetName';
      beforeEach(function () {
        eventLog = [];
        let spriteId = coreLibrary.addSprite({name: spriteName});
        sprite = coreLibrary.nativeSpriteMap[spriteId];
        coreLibrary.addSprite({name: targetName});
        overlapStub = stub(sprite, 'overlap');
      });

      afterEach(function () {
        overlapStub.restore();
      });

      it('Can run collision events', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        coreLibrary.addEvent(
          'whentouch',
          {
            sprite1: {name: spriteName},
            sprite2: {name: targetName},
          },
          () => eventLog.push('when touch ran')
        );

        coreLibrary.addEvent(
          'whiletouch',
          {
            sprite1: {name: spriteName},
            sprite2: {name: targetName},
          },
          () => eventLog.push('while touch ran')
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when touch ran', 'while touch ran']);
      });

      it('while touching continues to call the callback', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        coreLibrary.addEvent(
          'whiletouch',
          {
            sprite1: {name: spriteName},
            sprite2: {name: targetName},
          },
          () => eventLog.push('while touch ran')
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['while touch ran']);

        // Second tick- expect the callback to be called again
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['while touch ran', 'while touch ran']);
      });

      it('when touching does not continue to call the callback for the same overlap', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        coreLibrary.addEvent(
          'whentouch',
          {
            sprite1: {name: spriteName},
            sprite2: {name: targetName},
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called again
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when touch ran']);
      });

      it('when touching calls the callback again if the sprites stop and start touching', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(false);
        overlapStub.onCall(2).returns(true);
        coreLibrary.addEvent(
          'whentouch',
          {
            sprite1: {name: spriteName},
            sprite2: {name: targetName},
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called (overlap returns false)
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Third tick- expect the callback to be called again
        coreLibrary.runEvents();
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
      beforeEach(function () {
        eventLog = [];

        let sprite1Id = coreLibrary.addSprite({
          name: 'sprite1',
          animation: 'a',
        });
        sprite1 = coreLibrary.nativeSpriteMap[sprite1Id];
        let sprite2Id = coreLibrary.addSprite({
          name: 'sprite2',
          animation: 'a',
        });
        sprite2 = coreLibrary.nativeSpriteMap[sprite2Id];
        let target1Id = coreLibrary.addSprite({
          name: 'target1',
          animation: 'b',
        });
        target1 = coreLibrary.nativeSpriteMap[target1Id];
        let target2Id = coreLibrary.addSprite({
          name: 'target2',
          animation: 'b',
        });
        target2 = coreLibrary.nativeSpriteMap[target2Id];

        overlapStub1 = stub(sprite1, 'overlap');
        overlapStub2 = stub(sprite2, 'overlap');
      });
      afterEach(function () {
        overlapStub1.restore();
        overlapStub2.restore();
      });
      it('Calls the callback for each overlap - 1 sprite, 1 target', () => {
        // Only one sprite is touching one target
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(false);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(false);

        coreLibrary.addEvent(
          'whentouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `when: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.addEvent(
          'whiletouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `while: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when: 0, 2', 'while: 0, 2']);
      });

      it('Calls the callback for each overlap - 1 sprite, 2 targets', () => {
        // One 'a' sprite is touching two 'b' sprites
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(true);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(false);

        coreLibrary.addEvent(
          'whentouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `when: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 0, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 1 target', () => {
        // Two 'a' sprites, each touching one 'b' sprite
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(false);
        overlapStub2.withArgs(target1).returns(false);
        overlapStub2.withArgs(target2).returns(true);

        coreLibrary.addEvent(
          'whentouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `when: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 1, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 2 targets', () => {
        // Two 'a' sprites, each touching two 'b' sprites
        overlapStub1.withArgs(target1).returns(true);
        overlapStub1.withArgs(target2).returns(true);
        overlapStub2.withArgs(target1).returns(true);
        overlapStub2.withArgs(target2).returns(true);

        coreLibrary.addEvent(
          'whiletouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `while: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal([
          'while: 0, 2',
          'while: 0, 3',
          'while: 1, 2',
          'while: 1, 3',
        ]);
      });

      it('Calls the callback if costume group changes', () => {
        // 'a' sprite overlapping 'b' sprite
        overlapStub1.withArgs(target1).returns(true);
        coreLibrary.addEvent(
          'whentouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}},
          extraArgs =>
            eventLog.push(
              `when: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );
        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['when: 0, 2']);

        // 'b' sprite changes to 'c' sprite
        spriteCommands.setAnimation.apply(coreLibrary, [
          {name: 'target1'},
          'c',
        ]);
        coreLibrary.runEvents();
        // Event does not fire
        expect(eventLog).to.deep.equal(['when: 0, 2']);

        // 'c' sprite changes back to 'b' sprite
        spriteCommands.setAnimation.apply(coreLibrary, [
          {name: 'target1'},
          'b',
        ]);
        coreLibrary.runEvents();
        // Event does fire again
        expect(eventLog).to.deep.equal(['when: 0, 2', 'when: 0, 2']);
      });

      it('Collision events with the same costume group work', () => {
        // Two 'a' sprites, overlapping each other
        overlapStub1.withArgs(sprite1).returns(false);
        overlapStub1.withArgs(sprite2).returns(true);
        overlapStub2.withArgs(sprite1).returns(true);
        overlapStub2.withArgs(sprite2).returns(false);

        coreLibrary.addEvent(
          'whiletouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'a'}},
          extraArgs =>
            eventLog.push(
              `while: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`
            )
        );

        coreLibrary.runEvents();
        expect(eventLog).to.deep.equal(['while: 0, 1', 'while: 1, 0']);
      });
    });
  });
});
