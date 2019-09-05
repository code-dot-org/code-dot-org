/** @file Tests for P5GroupWrapper, our extension of p5.play Group */
import {spy} from 'sinon';
import {expect} from '../../util/configuredChai';
import {createStatefulP5Wrapper} from '../../util/gamelab/TestableP5Wrapper';
import {sandboxDocumentBody} from '../../util/testUtils';

describe('P5GroupWrapper', function() {
  let p5Wrapper, createSprite, createGroup;

  // Using the aggressive sandbox here because the P5 library generates
  // a default canvas when it's not attached to an existing one.
  sandboxDocumentBody();

  beforeEach(function() {
    p5Wrapper = createStatefulP5Wrapper();
    createSprite = p5Wrapper.p5.createSprite.bind(p5Wrapper.p5);
    createGroup = p5Wrapper.p5.createGroup.bind(p5Wrapper.p5);
  });

  describe('methods applying to each sprite', function() {
    it('setSpeedAndDirectionEach calls setSpeedAndDirection for each member', function() {
      let sprite1 = createSprite(0, 0);
      let sprite2 = createSprite(0, 0);
      let group = createGroup();
      group.add(sprite1);
      group.add(sprite2);
      spy(sprite1, 'setSpeedAndDirection');
      spy(sprite2, 'setSpeedAndDirection');
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.false;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.false;

      const speed = 5;
      const direction = 180;
      group.setSpeedAndDirectionEach(speed, direction);
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite1.setSpeedAndDirection.calledWith(speed, direction)).to.be
        .true;
      expect(sprite2.setSpeedAndDirection.calledWith(speed, direction)).to.be
        .true;
    });

    it('removes every element', function() {
      let group = createGroup();
      for (let i = 0; i < 2; i++) {
        group.add(createSprite(0, 0));
      }
      group.destroyEach();

      expect(group).to.be.empty;
    });
  });

  describe('collision methods', function() {
    // Note: collision methods will need to be called multiple times with groups to simulate
    // what happens in GameLab. When the function is called once (but has multiple sprites
    // in the group), it will not return a value. It's only when state.doneExec_ is true (so when
    // it's looped through all the sprites), that it will return the stored value on the state.
    // With the way we setup our JSInterpreter in tests, doneExec_ has no effect on recalling
    // isTouching so it will only get called once (even though state gets stored). We have for
    // loops around collision methods in the tests below to mimic how the JSInterpreter behaves
    // in gamelab.
    var sprite1, sprite2, targetSprite, group;

    beforeEach(function() {
      sprite1 = createSprite(0, 0, 100, 100);
      sprite2 = createSprite(400, 400, 100, 100);
      targetSprite = createSprite(200, 200, 100, 100);
      group = createGroup();
      group.add(sprite1);
      group.add(sprite2);
    });

    describe('no sprite in group overlaps target sprite', function() {
      it('returns false for isTouching', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns false for collide', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.collide(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns false for bounce', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounce(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns false for bounceOff', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounceOff(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns false for overlap', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.overlap(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns false for displace', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.displace(targetSprite);
        }
        expect(result).to.equal(false);
      });
    });

    describe('first sprite in group overlaps target sprite', function() {
      beforeEach(function() {
        // Make sprite1 overlap with target sprite
        sprite1.x = targetSprite.x;
        sprite1.y = targetSprite.y;
      });

      it('returns true for isTouching', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for collide', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.collide(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounce', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounce(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounceOff', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounceOff(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for overlap', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.overlap(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for displace', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.displace(targetSprite);
        }
        expect(result).to.equal(true);
      });
    });

    describe('last sprite in group overlaps target sprite', function() {
      beforeEach(function() {
        // Make sprite1 overlap with target sprite
        sprite2.x = targetSprite.x;
        sprite2.y = targetSprite.y;
      });

      it('returns true for isTouching', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for collide', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.collide(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounce', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounce(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounceOff', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounceOff(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for overlap', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.overlap(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for displace', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.displace(targetSprite);
        }
        expect(result).to.equal(true);
      });
    });

    describe('every sprite in group overlaps target sprite', function() {
      beforeEach(function() {
        // Make sprite1 overlap with target sprite
        sprite1.x = targetSprite.x;
        sprite1.y = targetSprite.y;
        sprite2.x = targetSprite.x;
        sprite2.y = targetSprite.y;
      });

      it('returns true for isTouching', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for collide', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.collide(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounce', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounce(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for bounceOff', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.bounceOff(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for overlap', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.overlap(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true for displace', function() {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.displace(targetSprite);
        }
        expect(result).to.equal(true);
      });
    });
  });
});
