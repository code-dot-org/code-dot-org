/* @file Test of our p5.play Sprite wrapper object */
/* global p5 */
import {spy, stub} from 'sinon';
import {expect} from '../../util/configuredChai';
import {forEveryBooleanPermutation} from '../../util/testUtils';
import createGameLabP5, {
  createStatefulGameLabP5,
  expectAnimationsAreClones
} from '../../util/gamelab/TestableGameLabP5';

describe('GameLabSprite', function () {
  let gameLabP5, createSprite;

  beforeEach(function () {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
  });

  describe('method aliases', function () {
    let testSprite;

    beforeEach(function () {
      testSprite = createSprite();
    });

    it('aliases setSpeed to setSpeedAndDirection', function () {
      spy(testSprite, 'setSpeed');
      testSprite.setSpeedAndDirection();
      expect(testSprite.setSpeed.calledOnce).to.be.true;
    });

    it('aliases remove to destroy', function () {
      spy(testSprite, 'remove');
      testSprite.destroy();
      expect(testSprite.remove.calledOnce).to.be.true;
    });

    it('aliases animation.changeFrame to setFrame', function () {
      testSprite.addAnimation('label', createTestAnimation());
      stub(testSprite.animation, 'changeFrame');
      testSprite.setFrame();
      expect(testSprite.animation.changeFrame.calledOnce).to.be.true;
    });

    it('aliases animation.nextFrame to nextFrame', function () {
      testSprite.addAnimation('label', createTestAnimation());
      stub(testSprite.animation, 'nextFrame');
      testSprite.nextFrame();
      expect(testSprite.animation.nextFrame.calledOnce).to.be.true;
    });

    it('aliases animation.previousFrame to previousFrame', function () {
      testSprite.addAnimation('label', createTestAnimation());
      stub(testSprite.animation, 'previousFrame');
      testSprite.previousFrame();
      expect(testSprite.animation.previousFrame.calledOnce).to.be.true;
    });

    it('aliases animation.play to play', function () {
      testSprite.addAnimation('label', createTestAnimation());
      stub(testSprite.animation, 'play');
      testSprite.play();
      expect(testSprite.animation.play.calledOnce).to.be.true;
    });

    it('aliases animation.stop to pause', function () {
      testSprite.addAnimation('label', createTestAnimation());
      stub(testSprite.animation, 'stop');
      testSprite.pause();
      expect(testSprite.animation.stop.calledOnce).to.be.true;
    });
  });

  describe('property aliases', function () {
    let testSprite;

    beforeEach(function () {
      testSprite = createSprite();
    });

    it('aliases position.x to positionX', function () {
      testSprite.position.x = 1;
      expect(testSprite.position.x).to.equal(testSprite.x);
      const newValue = 2;
      testSprite.x = newValue;
      expect(testSprite.position.x).to.equal(testSprite.x).to.equal(newValue);
    });

    it('aliases position.y to positionY', function () {
      testSprite.position.y = 1;
      expect(testSprite.position.y).to.equal(testSprite.y);
      const newValue = 2;
      testSprite.y = newValue;
      expect(testSprite.position.y).to.equal(testSprite.y).to.equal(newValue);
    });

    it('aliases velocity.x to velocityX', function () {
      testSprite.velocity.x = 1;
      expect(testSprite.velocity.x).to.equal(testSprite.velocityX);
      const newValue = 2;
      testSprite.velocityX = newValue;
      expect(testSprite.velocity.x).to.equal(testSprite.velocityX).to.equal(newValue);
    });

    it('aliases velocity.y to velocityY', function () {
      testSprite.velocity.y = 1;
      expect(testSprite.velocity.y).to.equal(testSprite.velocityY);
      const newValue = 2;
      testSprite.velocityY = newValue;
      expect(testSprite.velocity.y).to.equal(testSprite.velocityY).to.equal(newValue);
    });

    it('aliases life to lifetime', function () {
      testSprite.life = 1;
      expect(testSprite.life).to.equal(testSprite.lifetime);
      const newValue = 2;
      testSprite.lifetime = newValue;
      expect(testSprite.life).to.equal(testSprite.lifetime).to.equal(newValue);
    });

    it('aliases restitution to bounciness', function () {
      testSprite.restitution = 1;
      expect(testSprite.restitution).to.equal(testSprite.bounciness);
      const newValue = 2;
      testSprite.bounciness = newValue;
      expect(testSprite.restitution).to.equal(testSprite.bounciness).to.equal(newValue);
    });
  });

  describe('isTouching', function () {
    it('returns false if the collider and colliding sprite dont overlap', function () {
      var sprite1 = createSprite(0, 0, 100, 100);
      var sprite2 = createSprite(200, 200, 100, 100);
      var isTouching1to2 = sprite1.isTouching(sprite2);
      var isTouching2to1 = sprite2.isTouching(sprite1);
      expect(isTouching1to2).to.equal(false).and.to.equal(isTouching2to1);
    });

    it('returns true if the collider and colliding sprite overlap', function () {
      var sprite3 = createSprite(150, 150, 100, 100);
      var sprite4 = createSprite(200, 200, 100, 100);
      var isTouching3to4 = sprite3.isTouching(sprite4);
      var isTouching4to3 = sprite4.isTouching(sprite3);
      expect(isTouching3to4).to.equal(true).and.to.equal(isTouching3to4);

      var sprite5 = createSprite(101, 101, 100, 100);
      var sprite6 = createSprite(200, 200, 100, 100);
      var isTouching5to6 = sprite5.isTouching(sprite6);
      var isTouching6to5 = sprite6.isTouching(sprite5);
      expect(isTouching5to6).to.equal(true).and.to.equal(isTouching5to6);
    });

    it('does not affect the location or velocity of the sprite', function () {
      var sprite1 = createSprite(170, 170, 100, 100);
      var sprite2 = createSprite(200, 200, 100, 100);
      var isTouching1to2 = sprite1.isTouching(sprite2);
      expect(isTouching1to2).to.equal(true);
      expect(sprite1.x).to.equal(170);
      expect(sprite1.y).to.equal(170);
      expect(sprite2.x).to.equal(200);
      expect(sprite2.y).to.equal(200);
    });
  });

  describe('width, height', function () {
    describe('sprites without animations', function () {
      var sprite1;

      beforeEach(function () {
        sprite1 = createSprite(200, 200);
      });

      it('defaults to 100 by 100 when no width or height are set', function () {
        expect(sprite1.width).to.equal(100);
        expect(sprite1.height).to.equal(100);
      });

      it('gets and sets the same value', function () {
        sprite1.width = 200;
        sprite1.height = 450;
        expect(sprite1.width).to.equal(200);
        expect(sprite1.height).to.equal(450);
      });

      it('gets unscaled width and height', function () {
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

    describe('sprites with animations', function () {
      var sprite;
      beforeEach(function () {
        var image = new p5.Image(100, 100, gameLabP5.p5);
        var frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
        var sheet = new gameLabP5.p5.SpriteSheet(image, frames);
        var animation = new gameLabP5.p5.Animation(sheet);
        sprite = createSprite(0, 0);
        sprite.addAnimation('label', animation);
      });

      it('defaults to image height and width when no width or height are set', function () {
        expect(sprite.width).to.equal(50);
        expect(sprite.height).to.equal(50);
      });

      it('gets and sets the same value', function () {
        sprite.width = 150;
        sprite.height = 200;
        expect(sprite.width).to.equal(150);
        expect(sprite.height).to.equal(200);
      });

      it('gets unscaled width and height', function () {
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

  describe('getScaledWidth, getScaledHeight', function () {
    describe('sprites without animations', function () {
      it('returns width and height when no scale is set', function () {
        var sprite1 = createSprite(200, 200);
        expect(sprite1.getScaledWidth()).to.equal(100);
        expect(sprite1.getScaledHeight()).to.equal(100);
        sprite1.width = 200;
        sprite1.height = 400;
        expect(sprite1.getScaledWidth()).to.equal(200);
        expect(sprite1.getScaledHeight()).to.equal(400);
      });

      it('gets scaled values', function () {
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

    describe('sprites with animations', function () {
      var sprite1;
      beforeEach(function () {
        sprite1 = createSprite(0, 0);
        sprite1.addAnimation('label', createTestAnimation());
      });

      it('returns width and height when no scale is set', function () {
        expect(sprite1.getScaledWidth()).to.equal(50);
        expect(sprite1.getScaledHeight()).to.equal(50);
        sprite1.width = 200;
        sprite1.height = 400;
        expect(sprite1.getScaledWidth()).to.equal(200);
        expect(sprite1.getScaledHeight()).to.equal(400);
      });

      it('gets scaled values', function () {
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
  });

  describe('setAnimation', function () {
    const ANIMATION_LABEL = 'animation1',
          SECOND_ANIMATION_LABEL = 'animation2';
    let sprite, projectAnimations;

    beforeEach(function () {
      sprite = createSprite(0, 0);

      // We manually preload animations onto p5.projectAnimations for the use of
      // setAnimation.
      projectAnimations = {
        [ANIMATION_LABEL]: createTestAnimation(8),
        [SECOND_ANIMATION_LABEL]: createTestAnimation(10)
      };
      gameLabP5.p5.projectAnimations = projectAnimations;
    });

    it('throws if the named animation is not found in the project', function () {
      expect(() => {
        sprite.setAnimation('fakeAnimation');
      }).to.throw(`Unable to find an animation named "fakeAnimation".  Please make sure the animation exists.`);
    });

    it('makes the named animaiton the current animation, if the animation is found', function () {
      sprite.setAnimation(ANIMATION_LABEL);

      // Current animation label should be animation label
      expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);

      // Current animation will be a clone of the project animation:
      expectAnimationsAreClones(sprite.animation, projectAnimations[ANIMATION_LABEL]);
    });

    it('changes the animation to first frame and plays it by default', function () {
      sprite.setAnimation(ANIMATION_LABEL);

      // Animation is at frame 1
      expect(sprite.animation.getFrame()).to.equal(0);

      // Animation is playing
      expect(sprite.animation.playing).to.be.true;
    });

    describe('repeat call', function () {
      beforeEach(function () {
        // Set first animation and advance a few frames, to simulate an
        // animation in the middle of playback.
        sprite.setAnimation(ANIMATION_LABEL);
        sprite.animation.changeFrame(3);
      });

      it('resets the current frame if called with a new animation', function () {
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);

        sprite.setAnimation(SECOND_ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(SECOND_ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(0);
      });

      it('does not reset the current frame if called with the current animation', function () {
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);

        sprite.setAnimation(ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.getFrame()).to.equal(3);
      });

      it('unpasuses a paused sprite if called with a new animation', function () {
        sprite.pause();
        expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.false;

        sprite.setAnimation(SECOND_ANIMATION_LABEL);

        expect(sprite.getAnimationLabel()).to.equal(SECOND_ANIMATION_LABEL);
        expect(sprite.animation.playing).to.be.true;
      });

      it('does not unpause a paused sprite if called with the current animation', function () {
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
        const description = `called with ${same ? 'the current' : 'a new'} animation`;
        const label = same ? ANIMATION_LABEL : SECOND_ANIMATION_LABEL;
        it(`does not pause a playing sprite if ${description}`, function () {
          expect(sprite.getAnimationLabel()).to.equal(ANIMATION_LABEL);
          expect(sprite.animation.playing).to.be.true;

          sprite.setAnimation(label);

          expect(sprite.getAnimationLabel()).to.equal(label);
          expect(sprite.animation.playing).to.be.true;
        });
      });
    });
  });

  describe('collision types using AABBOps', function () {
    let sprite, spriteTarget;

    beforeEach(function () {
      // sprite in to the left, moving right
      // spriteTarget in to the right, stationary
      sprite = createSprite(281, 100, 20, 20);
      spriteTarget = createSprite(300, 100, 20, 20);
      sprite.velocity.x = 3;
      spriteTarget.velocity.x = 0;

      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('stops movement of colliding sprite when sprites bounce', function () {
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

    it('stops movement of colliding sprite when sprites collide', function () {
      // sprite stops moving, spriteTarget stops moving
      const collide = sprite.collide(spriteTarget);

      expect(collide).to.equal(true);

      expect(sprite.position.x).to.equal(280);
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3); // collide causes no movement, but velocity holds
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.update();
      spriteTarget.update();

      expect(sprite.position.x).to.equal(283); // moves forward on update
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.collide(spriteTarget);

      expect(sprite.position.x).to.equal(280); // displaced back to original position
      expect(spriteTarget.position.x).to.equal(300);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('continues movement of colliding sprite when sprites displace', function () {
      // sprite continues moving, spriteTarget gets pushed by sprite
      const displace = sprite.displace(spriteTarget);

      expect(displace).to.equal(true);
      expect(sprite.position.x).to.equal(281);
      expect(spriteTarget.position.x).to.equal(301);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0); // spriteTarget does move, but velocity is 0

      sprite.update();
      spriteTarget.update();

      expect(displace).to.equal(true);
      expect(sprite.position.x).to.equal(284);
      expect(spriteTarget.position.x).to.equal(301);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      sprite.displace(spriteTarget);

      expect(displace).to.equal(true);
      expect(sprite.position.x).to.equal(284);
      expect(spriteTarget.position.x).to.equal(304);
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);
    });

    it('reverses direction of colliding sprite when sprites bounceOff', function () {
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

    it('continues movement of colliding sprite when sprites overlap', function () {
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
  });

  describe('collisions with groups', function () {
    let sprite, spriteTarget1, spriteTarget2, group;
    let gameLabP5Stateful, createStatefulGroup, createStatefulSprite;

    beforeEach(function () {
      gameLabP5Stateful = createStatefulGameLabP5();
      createStatefulGroup = gameLabP5Stateful.p5.createGroup.bind(gameLabP5Stateful.p5);
      createStatefulSprite = gameLabP5Stateful.p5.createSprite.bind(gameLabP5Stateful.p5);
      spriteTarget1 = createStatefulSprite(0, 0, 100, 100);
      spriteTarget2 = createStatefulSprite(400, 400, 100, 100);
      sprite = createStatefulSprite(200, 200, 100, 100);
      group = createStatefulGroup();
      group.add(spriteTarget1);
      group.add(spriteTarget2);
    });

    it('isTouching returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.isTouching(group);
      }
      expect(result).to.equal(false);
    });

    it('isTouching returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.isTouching(group);
      }
      expect(result2).to.equal(true);
    });

    it('collide returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.collide(group);
      }
      expect(result).to.equal(false);
    });

    it('collide returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.collide(group);
      }
      expect(result2).to.equal(true);
    });

    it('bounce returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.bounce(group);
      }
      expect(result).to.equal(false);
    });

    it('bounce returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.bounce(group);
      }
      expect(result2).to.equal(true);
    });

    it('bounceOff returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.bounceOff(group);
      }
      expect(result).to.equal(false);
    });

    it('bounceOff returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.bounceOff(group);
      }
      expect(result2).to.equal(true);
    });

    it('displace returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.displace(group);
      }
      expect(result).to.equal(false);
    });

    it('displace returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.displace(group);
      }
      expect(result2).to.equal(true);
    });

    it('overlap returns false when sprite touches nothing in the group', function () {
      let result;
      for (let i = 0; i < group.length + 1; i++) {
        result = sprite.overlap(group);
      }
      expect(result).to.equal(false);
    });

    it('overlap returns true when sprite touches anything in the group', function () {
      spriteTarget1.x = sprite.x;
      spriteTarget1.y = sprite.y;

      let result2;
      for (let i = 0; i < group.length + 1; i++) {
        result2 = sprite.overlap(group);
      }
      expect(result2).to.equal(true);
    });
  });

  describe('animation.goToFrame()', function () {
    var animation;

    beforeEach(function () {
      animation = createTestAnimation(10); // with 10 frames
      animation.frameDelay = 1; // One update() call = one frame
    });

    it('plays a paused animation when target != current', function () {
      var start = 2;
      for (var target = 0; target < 5; target++) {
        if (target !== start) {
          animation.changeFrame(start);
          animation.stop();
          expect(animation.playing).to.be.false;

          animation.goToFrame(target);
          expect(animation.playing).to.be.true;
        }
      }
    });

    it('does not play a paused animation when target == current', function () {
      for (var startAndTarget = 0; startAndTarget < 5; startAndTarget++) {
        animation.changeFrame(startAndTarget);
        animation.stop();
        expect(animation.playing).to.be.false;

        animation.goToFrame(startAndTarget);
        expect(animation.playing).to.be.false;
      }
    });

    it('never pauses a playing animation immediately', function () {
      var start = 2;
      for (var target = 0; target < 5; target++) {
        animation.changeFrame(start);
        animation.play();
        expect(animation.playing).to.be.true;

        animation.goToFrame(target);
        expect(animation.playing).to.be.true;
      }
    });

    it('plays the animation forward to the target frame when target > current', function () {
      animation.changeFrame(1);
      animation.goToFrame(4);

      // Verify state on each frame
      expect(animation.getFrame()).to.equal(1);

      animation.update();
      expect(animation.getFrame()).to.equal(2);

      animation.update();
      expect(animation.getFrame()).to.equal(3);

      animation.update();
      expect(animation.getFrame()).to.equal(4);

      // Note the animation stops at the target frame.
      animation.update();
      expect(animation.getFrame()).to.equal(4);
    });

    it('plays the animation backward to the target frame when target < current', function () {
      animation.changeFrame(5);
      animation.goToFrame(2);

      // Verify state on each frame
      expect(animation.getFrame()).to.equal(5);

      animation.update();
      expect(animation.getFrame()).to.equal(4);

      animation.update();
      expect(animation.getFrame()).to.equal(3);

      animation.update();
      expect(animation.getFrame()).to.equal(2);

      // Note the animation stops at the target frame.
      animation.update();
      expect(animation.getFrame()).to.equal(2);
    });

    it('pauses the frame after it reaches the target frame', function () {
      // When going forward
      animation.changeFrame(5);
      animation.goToFrame(7);
      expect(animation.playing).to.be.true;

      animation.update();
      animation.update();
      expect(animation.getFrame()).to.equal(7);
      expect(animation.playing).to.be.true;

      animation.update();
      expect(animation.getFrame()).to.equal(7);
      expect(animation.playing).to.be.false;

      // When going backward
      animation.changeFrame(4);
      animation.goToFrame(2);
      expect(animation.playing).to.be.true;

      animation.update();
      animation.update();
      expect(animation.getFrame()).to.equal(2);
      expect(animation.playing).to.be.true;

      animation.update();
      expect(animation.getFrame()).to.equal(2);
      expect(animation.playing).to.be.false;
    });

    it('pauses on the next frame when target == current', function () {
      animation.changeFrame(5);
      animation.goToFrame(5);
      expect(animation.playing).to.be.true;

      animation.update();
      expect(animation.playing).to.be.false;
    });

    describe('when target frame is out of bounds', function () {
      it('does not affect play behavior', function () {
        // Play forwards
        animation.changeFrame(5);
        animation.play();
        expect(animation.getFrame()).to.equal(5);

        // Verify playing forwards
        animation.update();
        expect(animation.getFrame()).to.equal(6);

        // Try to go to a negative frame.
        // Unless ignored, we'd expect the animation to start going backwards
        animation.goToFrame(-1);
        animation.update();
        expect(animation.getFrame()).to.equal(7);

        // Play backwards (correctly this time)
        animation.goToFrame(0);
        animation.update();
        expect(animation.getFrame()).to.equal(6);

        // Try going to a positive frame out of bounds
        // Unless ignored, we'd expect the animation to run forward again
        animation.goToFrame(animation.images.length);
        animation.update();
        expect(animation.getFrame()).to.equal(5);
      });

      it('does not affect play state', function () {
        animation.stop();
        expect(animation.playing).to.be.false;

        animation.goToFrame(-1);
        expect(animation.playing).to.be.false;

        animation.goToFrame(animation.images.length);
        expect(animation.playing).to.be.false;
      });
    });
  });

  function createTestAnimation(frameCount = 1) {
    let image = new p5.Image(100, 100, gameLabP5.p5);
    let frames = [];
    for (var i = 0; i < frameCount; i++) {
      frames.push({name: i, frame: {x: 0, y: 0, width: 50, height: 50}});
    }
    let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
    return new gameLabP5.p5.Animation(sheet);
  }
});
