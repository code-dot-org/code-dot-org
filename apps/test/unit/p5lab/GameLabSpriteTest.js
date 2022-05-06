/* @file Test of our p5.play Sprite wrapper object */
/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {
  forEveryBooleanPermutation,
  sandboxDocumentBody
} from '../../util/testUtils';
import createP5Wrapper, {
  createStatefulP5Wrapper,
  expectAnimationsAreClones
} from '../../util/gamelab/TestableP5Wrapper';

describe('P5SpriteWrapper', function() {
  let p5Wrapper, createSprite;

  // Using the aggressive sandbox here because the P5 library generates
  // a default canvas when it's not attached to an existing one.
  sandboxDocumentBody();

  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    createSprite = p5Wrapper.p5.createSprite.bind(p5Wrapper.p5);
  });

  describe('width, height', function() {
    describe('sprites without animations', function() {
      var sprite1;

      beforeEach(function() {
        sprite1 = createSprite(200, 200);
      });

      it('defaults to 100 by 100 when no width or height are set', function() {
        expect(sprite1.width).to.equal(100);
        expect(sprite1.height).to.equal(100);
      });

      it('gets and sets the same value', function() {
        sprite1.width = 200;
        sprite1.height = 450;
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
      });

      it('gets unscaled width and height', function() {
        sprite1.width = 200;
        sprite1.height = 450;
        sprite1.scale = 2;
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
        expect(sprite1.scale).to.equal(2);
        sprite1.scale = 0.5;
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
        expect(sprite1.scale).to.equal(0.5);
        sprite1.width = 100;
        expect(sprite1.width).to.equal(100);
      });
    });

    describe('sprites with animations', function() {
      var sprite;
      beforeEach(function() {
        var image = new p5.Image(100, 100, p5Wrapper.p5);
        var frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
        var sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
        var animation = new p5Wrapper.p5.Animation(sheet);
        sprite = createSprite(0, 0);
        sprite.addAnimation('label', animation);
      });

      it('defaults to image height and width when no width or height are set', function() {
        expect(sprite.width).to.equal(50);
        expect(sprite.height).to.equal(50);
      });

      it('gets and sets the same value', function() {
        sprite.width = 150;
        sprite.height = 200;
        expect(sprite.width).to.equal(150);
        expect(sprite.height).to.equal(200);
      });

      it('gets unscaled width and height', function() {
        sprite.width = 200;
        sprite.height = 450;
        sprite.scale = 2;
        expect(sprite.width).to.equal(200);
        expect(sprite.height).to.equal(450);
        expect(sprite.scale).to.equal(2);
        sprite.scale = 0.5;
        expect(sprite.width).to.equal(200);
        expect(sprite.height).to.equal(450);
        expect(sprite.scale).to.equal(0.5);
        sprite.width = 100;
        expect(sprite.width).to.equal(100);
      });
    });
  });

  describe('getScaledWidth, getScaledHeight', function() {
    describe('sprites without animations', function() {
      it('returns width and height when no scale is set', function() {
        var sprite1 = createSprite(200, 200);
        expect(sprite1.getScaledWidth()).to.equal(100);
        expect(sprite1.getScaledHeight()).to.equal(100);
        sprite1.width = 200;
        sprite1.height = 400;
        expect(sprite1.getScaledWidth()).to.equal(200);
        expect(sprite1.getScaledHeight()).to.equal(400);
      });

      it('gets scaled values', function() {
        var sprite1 = createSprite(200, 200);
        sprite1.width = 200;
        sprite1.height = 450;
        sprite1.scale = 2;
        expect(sprite1.getScaledWidth()).to.equal(400);
        expect(sprite1.getScaledHeight()).to.equal(900);
        expect(sprite1.scale).to.equal(2);
        sprite1.scale = 0.5;
        expect(sprite1.getScaledWidth()).to.equal(100);
        expect(sprite1.getScaledHeight()).to.equal(225);
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
        expect(sprite1.scale).to.equal(0.5);
        sprite1.width = 100;
        expect(sprite1.getScaledWidth()).to.equal(50);
      });
    });

    describe('sprites with animations', function() {
      var sprite1;
      beforeEach(function() {
        sprite1 = createSprite(0, 0);
        sprite1.addAnimation('label', createTestAnimation());
      });

      it('returns width and height when no scale is set', function() {
        expect(sprite1.getScaledWidth()).to.equal(50);
        expect(sprite1.getScaledHeight()).to.equal(50);
        sprite1.width = 200;
        sprite1.height = 400;
        expect(sprite1.getScaledWidth()).to.equal(200);
        expect(sprite1.getScaledHeight()).to.equal(400);
      });

      it('gets scaled values', function() {
        sprite1.width = 200;
        sprite1.height = 450;
        sprite1.scale = 2;
        expect(sprite1.getScaledWidth()).to.equal(400);
        expect(sprite1.getScaledHeight()).to.equal(900);
        expect(sprite1.scale).to.equal(2);
        sprite1.scale = 0.5;
        expect(sprite1.getScaledWidth()).to.equal(100);
        expect(sprite1.getScaledHeight()).to.equal(225);
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
        expect(sprite1.scale).to.equal(0.5);
        sprite1.width = 100;
        expect(sprite1.getScaledWidth()).to.equal(50);
      });

      it('gets scaled values regardless of colliders', function() {
        var sprite2 = createSprite(0, 0);
        sprite2.addAnimation('label', createTestAnimation());

        sprite1.width = 200;
        sprite1.height = 400;
        sprite1.scale = 2;

        expect(sprite1.getScaledWidth()).to.equal(400);
        expect(sprite1.getScaledHeight()).to.equal(800);
        sprite1.collide(sprite2);
        expect(sprite1.getScaledWidth()).to.equal(400);
        expect(sprite1.getScaledHeight()).to.equal(800);
      });
    });
  });

  describe('setAnimation(label)', function() {
    const ANIMATION_LABEL = 'animation1',
      SECOND_ANIMATION_LABEL = 'animation2';
    let sprite, projectAnimations;

    beforeEach(function() {
      sprite = createSprite(0, 0);

      // We manually preload animations onto p5._predefinedSpriteAnimations for the use of
      // setAnimation.
      projectAnimations = {
        [ANIMATION_LABEL]: createTestAnimation(8),
        [SECOND_ANIMATION_LABEL]: createTestAnimation(10)
      };
      p5Wrapper.p5._predefinedSpriteAnimations = projectAnimations;
    });

    it('throws if the named animation is not found in the project', function() {
      expect(() => {
        sprite.setAnimation('fakeAnimation');
      }).to.throw(
        `Unable to find an animation named "fakeAnimation".  Please make sure the animation exists.`
      );
    });

    it('makes the named animaiton the current animation, if the animation is found', function() {
      sprite.setAnimation(ANIMATION_LABEL);

      // Current animation label should be animation label
      expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);

      // Current animation will be a clone of the project animation:
      expectAnimationsAreClones(
        sprite.animation,
        projectAnimations[ANIMATION_LABEL]
      );
    });

    it('changes the animation to first frame and plays it by default', function() {
      sprite.setAnimation(ANIMATION_LABEL);

      // Animation is at frame 1
      expect(sprite.animation.getFrame()).to.equal(0);

      // Animation is playing
      expect(sprite.animation.playing).to.be.true;
    });

    describe('repeat call', function() {
      beforeEach(function() {
        // Set first animation and advance a few frames, to simulate an
        // animation in the middle of playback.
        sprite.setAnimation(ANIMATION_LABEL);
        sprite.animation.changeFrame(3);
      });

      it('resets the current frame if called with a new animation', function() {
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);

        sprite.setAnimation(SECOND_ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(SECOND_ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(0);
      });

      it('does not reset the current frame if called with the current animation', function() {
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);

        sprite.setAnimation(ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);
      });

      it('unpasuses a paused sprite if called with a new animation', function() {
        sprite.pause();
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.false;

        sprite.setAnimation(SECOND_ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(SECOND_ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.true;
      });

      it('does not unpause a paused sprite if called with the current animation', function() {
        expect(sprite.animation.playing).to.be.true;
        sprite.pause();
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.false;

        sprite.setAnimation(ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.false;
      });

      // Applies to both cases, so unify them
      forEveryBooleanPermutation(same => {
        const description = `called with ${
          same ? 'the current' : 'a new'
        } animation`;
        const label = same ? ANIMATION_LABEL : SECOND_ANIMATION_LABEL;
        it(`does not pause a playing sprite if ${description}`, function() {
          expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
          expect(sprite.animation.playing).to.be.true;

          sprite.setAnimation(label);

          expect(sprite.getAnimationLabel()).to.equal(label);
          expect(sprite.animation.playing).to.be.true;
        });
      });
    });
  });

  describe('collision types using AABBOps', function() {
    let sprite, spriteTarget;

    beforeEach(function() {
      // sprite in to the left, moving right
      // spriteTarget in to the right, stationary
      sprite = createSprite(281, 100, 20, 20);
      spriteTarget = createSprite(300, 100, 20, 20);
      sprite.velocity.x = 3;
      spriteTarget.velocity.x = 0;

      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('stops movement of colliding sprite when sprites bounce', function() {
      // sprite stops moving, spriteTarget moves right
      const bounce = sprite.bounce(spriteTarget);

      expect(bounce).to.equal(true);

      expect(sprite.position.x).to.equal(280); // move back to not overlap with spriteTarget
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(0);
      expect(spriteTarget.velocity.x).to.equal(3);

      sprite.update();
      spriteTarget.update();

      expect(sprite.position.x).to.equal(280);
      expect(spriteTarget.position.x).to.equal(303);
      expect(sprite.velocity.x).to.equal(0);
      expect(spriteTarget.velocity.x).to.equal(3);

      sprite.bounce(spriteTarget);

      expect(sprite.position.x).to.equal(280);
      expect(spriteTarget.position.x).to.equal(303);
      expect(sprite.velocity.x).to.equal(0);
      expect(spriteTarget.velocity.x).to.equal(3);
    });

    it('stops movement of colliding sprite when sprites collide', function() {
      // sprite stops moving, spriteTarget stops moving
      const collide = sprite.collide(spriteTarget);

      expect(collide).to.equal(true);

      expect(sprite.position.x).to.equal(280);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(0);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('continues movement of colliding sprite when sprites displace', function() {
      // sprite continues moving, spriteTarget gets pushed by sprite
      const displace = sprite.displace(spriteTarget);

      expect(displace).to.equal(true);
      expect(sprite.position.x).to.equal(281);
      expect(spriteTarget.position.x).to.equal(301);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.update();
      spriteTarget.update();

      expect(sprite.position.x).to.equal(284);
      expect(spriteTarget.position.x).to.equal(301);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      // Displace is true again, since sprite keeps moving into spriteTarget
      const displace2 = sprite.displace(spriteTarget);
      expect(displace2).to.be.true;
    });

    it('reverses direction of colliding sprite when sprites bounceOff', function() {
      // sprite reverses direction of movement, spriteTarget remains in its location
      const bounceOff = sprite.bounceOff(spriteTarget);

      expect(bounceOff).to.equal(true);
      expect(sprite.position.x).to.equal(280);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(-3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.update();
      spriteTarget.update();

      expect(bounceOff).to.equal(true);
      expect(sprite.position.x).to.equal(277);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(-3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.bounceOff(spriteTarget);

      expect(bounceOff).to.equal(true);
      expect(sprite.position.x).to.equal(277);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(-3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('continues movement of colliding sprite when sprites overlap', function() {
      // sprite continues moving, spriteTarget remains in it's location
      const overlap = sprite.overlap(spriteTarget);

      expect(overlap).to.equal(true);
      expect(sprite.position.x).to.equal(281);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.update();
      spriteTarget.update();

      expect(overlap).to.equal(true);
      expect(sprite.position.x).to.equal(284);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.overlap(spriteTarget);

      expect(overlap).to.equal(true);
      expect(sprite.position.x).to.equal(284);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('destroyed sprites do not collide', function() {
      expect(sprite.overlap(spriteTarget)).to.equal(true);
      spriteTarget.remove();
      expect(sprite.overlap(spriteTarget)).to.equal(false);
      expect(spriteTarget.overlap(sprite)).to.equal(false);
    });
  });

  describe('collisions with groups', function() {
    let sprite, spriteTarget1, spriteTarget2, group;
    let p5WrapperStateful, createStatefulGroup, createStatefulSprite;

    beforeEach(function() {
      p5WrapperStateful = createStatefulP5Wrapper();
      createStatefulGroup = p5WrapperStateful.p5.createGroup.bind(
        p5WrapperStateful.p5
      );
      createStatefulSprite = p5WrapperStateful.p5.createSprite.bind(
        p5WrapperStateful.p5
      );
      spriteTarget1 = createStatefulSprite(0, 0, 100, 100);
      spriteTarget2 = createStatefulSprite(400, 400, 100, 100);
      sprite = createStatefulSprite(200, 200, 100, 100);
      group = createStatefulGroup();
      group.add(spriteTarget1);
      group.add(spriteTarget2);
    });

    it('isTouching returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.isTouching(group);
      }
      expect(result).to.equal(false);
    });

    it('isTouching returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.isTouching(group);
      }
      expect(result2).to.equal(true);
    });

    it('collide returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.collide(group);
      }
      expect(result).to.equal(false);
    });

    it('collide returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.collide(group);
      }
      expect(result2).to.equal(true);
    });

    it('bounce returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.bounce(group);
      }
      expect(result).to.equal(false);
    });

    it('bounce returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.bounce(group);
      }
      expect(result2).to.equal(true);
    });

    it('bounceOff returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.bounceOff(group);
      }
      expect(result).to.equal(false);
    });

    it('bounceOff returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.bounceOff(group);
      }
      expect(result2).to.equal(true);
    });

    it('displace returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.displace(group);
      }
      expect(result).to.equal(false);
    });

    it('displace returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.displace(group);
      }
      expect(result2).to.equal(true);
    });

    it('overlap returns false when sprite touches nothing in the group', function() {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.overlap(group);
      }
      expect(result).to.equal(false);
    });

    it('overlap returns true when sprite touches anything in the group', function() {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.overlap(group);
      }
      expect(result2).to.equal(true);
    });
  });

  describe('sprite.collide(sprite)', function() {
    var SIZE = 10;
    var pInst;
    var spriteA, spriteB;
    var callCount, pairs;

    function testCallback(a, b) {
      callCount++;
      pairs.push([a.name, b.name]);
    }

    function moveAToB(a, b) {
      a.position.x = b.position.x;
    }

    beforeEach(function() {
      pInst = new p5(function() {});
      callCount = 0;
      pairs = [];

      function createTestSprite(letter, position) {
        var sprite = pInst.createSprite(position, 0, SIZE, SIZE);
        sprite.name = 'sprite' + letter;
        return sprite;
      }

      spriteA = createTestSprite('A', 2 * SIZE);
      spriteB = createTestSprite('B', 4 * SIZE);

      // Assert initial test state:
      // - Two total sprites
      // - no two sprites overlap
      expect(pInst.allSprites.length).to.equal(2);
      pInst.allSprites.forEach(function(caller) {
        pInst.allSprites.forEach(function(callee) {
          expect(caller.overlap(callee)).to.be.false;
        });
      });
    });

    afterEach(function() {
      pInst.remove();
    });

    it('false if sprites do not overlap', function() {
      expect(spriteA.collide(spriteB)).to.be.false;
      expect(spriteB.collide(spriteA)).to.be.false;
    });

    it('true if sprites overlap', function() {
      moveAToB(spriteA, spriteB);
      expect(spriteA.collide(spriteB)).to.be.true;

      moveAToB(spriteA, spriteB);
      expect(spriteB.collide(spriteA)).to.be.true;
    });

    it('calls callback once if sprites overlap', function() {
      expect(callCount).to.equal(0);

      moveAToB(spriteA, spriteB);
      spriteA.collide(spriteB, testCallback);
      expect(callCount).to.equal(1);

      moveAToB(spriteA, spriteB);
      spriteB.collide(spriteA, testCallback);
      expect(callCount).to.equal(2);
    });

    it('does not call callback if sprites do not overlap', function() {
      expect(callCount).to.equal(0);
      spriteA.collide(spriteB, testCallback);
      expect(callCount).to.equal(0);
      spriteB.collide(spriteA, testCallback);
      expect(callCount).to.equal(0);
    });

    describe('passes collider and collidee to callback', function() {
      it('A-B', function() {
        moveAToB(spriteA, spriteB);
        spriteA.collide(spriteB, testCallback);
        expect(pairs).to.deep.equal([[spriteA.name, spriteB.name]]);
      });

      it('B-A', function() {
        moveAToB(spriteA, spriteB);
        spriteB.collide(spriteA, testCallback);
        expect(pairs).to.deep.equal([[spriteB.name, spriteA.name]]);
      });
    });

    it('does not reposition either sprite when sprites do not overlap', function() {
      var initialPositionA = spriteA.position.copy();
      var initialPositionB = spriteB.position.copy();

      spriteA.collide(spriteB);

      expectVectorsAreClose(spriteA.position, initialPositionA);
      expectVectorsAreClose(spriteB.position, initialPositionB);

      spriteB.collide(spriteA);

      expectVectorsAreClose(spriteA.position, initialPositionA);
      expectVectorsAreClose(spriteB.position, initialPositionB);
    });

    describe('displaces the caller out of collision when sprites do overlap', function() {
      it('to the left', function() {
        spriteA.position.x = spriteB.position.x - 1;

        var expectedPositionA = spriteB.position.copy().add(-SIZE, 0);
        var expectedPositionB = spriteB.position.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });

      it('to the right', function() {
        spriteA.position.x = spriteB.position.x + 1;

        var expectedPositionA = spriteB.position.copy().add(SIZE, 0);
        var expectedPositionB = spriteB.position.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });

      it('caller and callee reversed', function() {
        spriteA.position.x = spriteB.position.x + 1;

        var expectedPositionA = spriteA.position.copy();
        var expectedPositionB = spriteA.position.copy().add(-SIZE, 0);

        spriteB.collide(spriteA);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });
    });

    it('does not change velocity of either sprite when sprites do not overlap', function() {
      var initialVelocityA = spriteA.velocity.copy();
      var initialVelocityB = spriteB.velocity.copy();

      spriteA.collide(spriteB);

      expectVectorsAreClose(spriteA.velocity, initialVelocityA);
      expectVectorsAreClose(spriteB.velocity, initialVelocityB);

      spriteB.collide(spriteA);

      expectVectorsAreClose(spriteA.velocity, initialVelocityA);
      expectVectorsAreClose(spriteB.velocity, initialVelocityB);
    });

    describe('matches caller velocity to callee velocity when sprites do overlap', function() {
      it('when callee velocity is zero', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteB.velocity.x = 0;

        var expectedVelocityA = spriteB.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('when callee velocity is nonzero', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteB.velocity.x = -1;

        var expectedVelocityA = spriteB.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('only along x axis when only displaced along x axis', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteA.velocity.y = 3;
        spriteB.velocity.x = -1;

        // Expect to change velocity only along X
        var expectedVelocityA = spriteA.velocity.copy();
        expectedVelocityA.x = spriteB.velocity.x;
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('only along y axis when only displaced along y axis', function() {
        spriteA.position.x = spriteB.position.x;
        spriteA.position.y = spriteB.position.y + 1;
        spriteA.velocity.x = 2;
        spriteA.velocity.y = 3;
        spriteB.velocity.x = -1;
        spriteB.velocity.y = 1.5;

        // Expect to change velocity only along Y
        var expectedVelocityA = spriteA.velocity.copy();
        expectedVelocityA.y = spriteB.velocity.y;
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.collide(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('caller and callee reversed', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteB.velocity.x = -1;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteA.velocity.copy();

        spriteB.collide(spriteA);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });
    });
  });

  function createTestAnimation(frameCount = 1, looping = true) {
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [];
    for (var i = 0; i < frameCount; i++) {
      frames.push({name: i, frame: {x: 0, y: 0, width: 50, height: 50}});
    }
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    let animation = new p5Wrapper.p5.Animation(sheet);
    animation.looping = looping;
    animation.frameDelay = 1;
    return animation;
  }

  function expectVectorsAreClose(vA, vB) {
    var failMsg =
      'Expected <' +
      vA.x +
      ', ' +
      vA.y +
      '> to equal <' +
      vB.x +
      ', ' +
      vB.y +
      '>';
    expect(vA.x).to.be.closeTo(vB.x, 0.00001, failMsg);
    expect(vA.y).to.be.closeTo(vB.y, 0.00001, failMsg);
  }
});
