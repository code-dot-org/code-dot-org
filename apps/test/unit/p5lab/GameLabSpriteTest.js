/* @file Test of our p5.play Sprite wrapper object */
/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {sandboxDocumentBody} from '../../util/testUtils';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('P5SpriteWrapper', function() {
  let p5Wrapper, createSprite;

  // Using the aggressive sandbox here because the P5 library generates
  // a default canvas when it's not attached to an existing one.
  sandboxDocumentBody();

  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    createSprite = p5Wrapper.p5.createSprite.bind(p5Wrapper.p5);
  });

  describe('property aliases', function() {
    let testSprite;

    beforeEach(function() {
      testSprite = createSprite();
    });

    it('aliases position.x to positionX', function() {
      testSprite.position.x = 1;
      expect(testSprite.position.x).to.equal(testSprite.x);
      const newValue = 2;
      testSprite.x = newValue;
      expect(testSprite.position.x)
        .to.equal(testSprite.x)
        .to.equal(newValue);
    });

    it('aliases position.y to positionY', function() {
      testSprite.position.y = 1;
      expect(testSprite.position.y).to.equal(testSprite.y);
      const newValue = 2;
      testSprite.y = newValue;
      expect(testSprite.position.y)
        .to.equal(testSprite.y)
        .to.equal(newValue);
    });

    it('aliases velocity.x to velocityX', function() {
      testSprite.velocity.x = 1;
      expect(testSprite.velocity.x).to.equal(testSprite.velocityX);
      const newValue = 2;
      testSprite.velocityX = newValue;
      expect(testSprite.velocity.x)
        .to.equal(testSprite.velocityX)
        .to.equal(newValue);
    });

    it('aliases velocity.y to velocityY', function() {
      testSprite.velocity.y = 1;
      expect(testSprite.velocity.y).to.equal(testSprite.velocityY);
      const newValue = 2;
      testSprite.velocityY = newValue;
      expect(testSprite.velocity.y)
        .to.equal(testSprite.velocityY)
        .to.equal(newValue);
    });

    it('aliases life to lifetime', function() {
      testSprite.life = 1;
      expect(testSprite.life).to.equal(testSprite.lifetime);
      const newValue = 2;
      testSprite.lifetime = newValue;
      expect(testSprite.life)
        .to.equal(testSprite.lifetime)
        .to.equal(newValue);
    });

    it('aliases restitution to bounciness', function() {
      testSprite.restitution = 1;
      expect(testSprite.restitution).to.equal(testSprite.bounciness);
      const newValue = 2;
      testSprite.bounciness = newValue;
      expect(testSprite.restitution)
        .to.equal(testSprite.bounciness)
        .to.equal(newValue);
    });
  });

  describe('isTouching', function() {
    it('returns false if the collider and colliding sprite dont overlap', function() {
      var sprite1 = createSprite(0, 0, 100, 100);
      var sprite2 = createSprite(200, 200, 100, 100);
      var isTouching1to2 = sprite1.isTouching(sprite2);
      var isTouching2to1 = sprite2.isTouching(sprite1);
      expect(isTouching1to2)
        .to.equal(false)
        .and.to.equal(isTouching2to1);
    });

    it('returns true if the collider and colliding sprite overlap', function() {
      var sprite3 = createSprite(150, 150, 100, 100);
      var sprite4 = createSprite(200, 200, 100, 100);
      var isTouching3to4 = sprite3.isTouching(sprite4);
      sprite4.isTouching(sprite3);
      expect(isTouching3to4)
        .to.equal(true)
        .and.to.equal(isTouching3to4);

      var sprite5 = createSprite(101, 101, 100, 100);
      var sprite6 = createSprite(200, 200, 100, 100);
      var isTouching5to6 = sprite5.isTouching(sprite6);
      sprite6.isTouching(sprite5);
      expect(isTouching5to6)
        .to.equal(true)
        .and.to.equal(isTouching5to6);
    });

    it('does not affect the location of the sprite', function() {
      var sprite1 = createSprite(170, 170, 100, 100);
      var sprite2 = createSprite(200, 200, 100, 100);
      var isTouching1to2 = sprite1.isTouching(sprite2);
      expect(isTouching1to2).to.equal(true);
      expect(sprite1.x).to.equal(170);
      expect(sprite1.y).to.equal(170);
      expect(sprite2.x).to.equal(200);
      expect(sprite2.y).to.equal(200);
    });

    it('does not affect the velocity of the sprites', function() {
      var sprite1 = createSprite(170, 170, 100, 100);
      var sprite2 = createSprite(200, 200, 100, 100);
      sprite1.velocityX = 1;
      sprite1.velocityY = 1;
      sprite2.velocityX = 0;
      sprite2.velocityY = 0;
      var isTouching1to2 = sprite1.isTouching(sprite2);
      expect(isTouching1to2).to.equal(true);
      expect(sprite1.velocityX).to.equal(1);
      expect(sprite1.velocityY).to.equal(1);
      expect(sprite2.velocityX).to.equal(0);
      expect(sprite2.velocityY).to.equal(0);
    });
  });

  describe('play()', function() {
    // Plays/resumes the sprite's current animation.
    // If the animation is currently playing, this has no effect.
    // If the animation is stopped at the last frame, this will restart the
    // animation from the beginning.
    // If the animation is stopped at any other frame, this will resume playing
    // the animation at that frame.

    const LOOPING_ANIMATION = 'looping-animation',
      NON_LOOPING_ANIMATION = 'non-looping-animation';
    let sprite;

    beforeEach(function() {
      sprite = createSprite(0, 0);

      // Manually preload animations onto p5._predefinedSpriteAnimations
      p5Wrapper.p5._predefinedSpriteAnimations = {
        [LOOPING_ANIMATION]: createTestAnimation(3, true),
        [NON_LOOPING_ANIMATION]: createTestAnimation(3, false)
      };
    });
    it('has no effect on a playing, looping animation', function() {
      sprite.setAnimation(LOOPING_ANIMATION);
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.update(); // The test animation frameDelay=1, so this advances a frame.
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(1);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(1);

      sprite.update();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(2);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(2);

      sprite.update();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);
    });

    it('has no effect on a playing, non-looping animation until it reaches the final frame', function() {
      sprite.setAnimation(NON_LOOPING_ANIMATION);
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.update(); // The test animation frameDelay=1, so this advances a frame.
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(1);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(1);

      sprite.update();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(2);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(2);

      // No more frames to play for a non-looping animation
      sprite.update();
      expect(sprite.animation.playing).to.be.false;
      expect(sprite.animation.getFrame()).to.equal(2);

      // Restart the animation
      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);

      sprite.update();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(1);
    });

    it('resumes a stopped, looping animation at the current frame', function() {
      sprite.setAnimation(LOOPING_ANIMATION);
      for (var i = 0; i < 3; i++) {
        sprite.animation.changeFrame(i);
        sprite.pause();
        expect(sprite.animation.playing).to.be.false;
        expect(sprite.animation.getFrame()).to.equal(i);

        sprite.play();
        expect(sprite.animation.playing).to.be.true;
        expect(sprite.animation.getFrame()).to.equal(i);
      }
    });

    it('resumes a stopped, non-looping animation at the current frame if at a nonterminal frame', function() {
      sprite.setAnimation(NON_LOOPING_ANIMATION);
      for (var i = 0; i < 2; i++) {
        sprite.animation.changeFrame(i);
        sprite.pause();
        expect(sprite.animation.playing).to.be.false;
        expect(sprite.animation.getFrame()).to.equal(i);

        sprite.play();
        expect(sprite.animation.playing).to.be.true;
        expect(sprite.animation.getFrame()).to.equal(i);
      }
    });

    it('resumes a stopped, non-looping animation at the first frame if at the terminal frame', function() {
      sprite.setAnimation(NON_LOOPING_ANIMATION);
      sprite.animation.changeFrame(2);
      sprite.pause();
      expect(sprite.animation.playing).to.be.false;
      expect(sprite.animation.getFrame()).to.equal(2);

      sprite.play();
      expect(sprite.animation.playing).to.be.true;
      expect(sprite.animation.getFrame()).to.equal(0);
    });
  });

  describe('sprite.displace(sprite)', function() {
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
      expect(spriteA.displace(spriteB)).to.be.false;
      expect(spriteB.displace(spriteA)).to.be.false;
    });

    it('true if sprites overlap', function() {
      moveAToB(spriteA, spriteB);
      expect(spriteA.displace(spriteB)).to.be.true;

      moveAToB(spriteA, spriteB);
      expect(spriteB.displace(spriteA)).to.be.true;
    });

    it('calls callback once if sprites overlap', function() {
      expect(callCount).to.equal(0);

      moveAToB(spriteA, spriteB);
      spriteA.displace(spriteB, testCallback);
      expect(callCount).to.equal(1);

      moveAToB(spriteA, spriteB);
      spriteB.displace(spriteA, testCallback);
      expect(callCount).to.equal(2);
    });

    it('does not call callback if sprites do not overlap', function() {
      expect(callCount).to.equal(0);
      spriteA.displace(spriteB, testCallback);
      expect(callCount).to.equal(0);
      spriteB.displace(spriteA, testCallback);
      expect(callCount).to.equal(0);
    });

    describe('passes collider and collidee to callback', function() {
      it('A-B', function() {
        moveAToB(spriteA, spriteB);
        spriteA.displace(spriteB, testCallback);
        expect(pairs).to.deep.equal([[spriteA.name, spriteB.name]]);
      });

      it('B-A', function() {
        moveAToB(spriteA, spriteB);
        spriteB.displace(spriteA, testCallback);
        expect(pairs).to.deep.equal([[spriteB.name, spriteA.name]]);
      });
    });

    it('does not reposition either sprite when sprites do not overlap', function() {
      var initialPositionA = spriteA.position.copy();
      var initialPositionB = spriteB.position.copy();

      spriteA.displace(spriteB);

      expectVectorsAreClose(spriteA.position, initialPositionA);
      expectVectorsAreClose(spriteB.position, initialPositionB);

      spriteB.displace(spriteA);

      expectVectorsAreClose(spriteA.position, initialPositionA);
      expectVectorsAreClose(spriteB.position, initialPositionB);
    });

    describe('displaces the callee out of collision when sprites do overlap', function() {
      it('to the left', function() {
        spriteA.position.x = spriteB.position.x - 1;

        var expectedPositionA = spriteA.position.copy();
        var expectedPositionB = spriteA.position.copy().add(SIZE, 0);

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });

      it('to the right', function() {
        spriteA.position.x = spriteB.position.x + 1;

        var expectedPositionA = spriteA.position.copy();
        var expectedPositionB = spriteA.position.copy().add(-SIZE, 0);

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });

      it('caller and callee reversed', function() {
        spriteA.position.x = spriteB.position.x + 1;

        var expectedPositionA = spriteB.position.copy().add(SIZE, 0);
        var expectedPositionB = spriteB.position.copy();

        spriteB.displace(spriteA);

        expectVectorsAreClose(spriteA.position, expectedPositionA);
        expectVectorsAreClose(spriteB.position, expectedPositionB);
      });
    });

    it('does not change velocity of either sprite when sprites do not overlap', function() {
      var initialVelocityA = spriteA.velocity.copy();
      var initialVelocityB = spriteB.velocity.copy();

      spriteA.displace(spriteB);

      expectVectorsAreClose(spriteA.velocity, initialVelocityA);
      expectVectorsAreClose(spriteB.velocity, initialVelocityB);

      spriteB.displace(spriteA);

      expectVectorsAreClose(spriteA.velocity, initialVelocityA);
      expectVectorsAreClose(spriteB.velocity, initialVelocityB);
    });

    describe('does not change callee velocity', function() {
      it('when caller velocity is zero', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 0;
        spriteB.velocity.x = 2;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('when caller velocity is nonzero', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteB.velocity.x = -1;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('when only displaced along x axis', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteA.velocity.y = 0.5;
        spriteB.velocity.x = -1;
        spriteB.velocity.y = 3;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('when only displaced along y axis', function() {
        spriteA.position.x = spriteB.position.x;
        spriteA.position.y = spriteB.position.y + 1;
        spriteA.velocity.x = 2;
        spriteA.velocity.y = 3;
        spriteB.velocity.x = -1;
        spriteB.velocity.y = 1.5;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteA.displace(spriteB);

        expectVectorsAreClose(spriteA.velocity, expectedVelocityA);
        expectVectorsAreClose(spriteB.velocity, expectedVelocityB);
      });

      it('caller and callee reversed', function() {
        spriteA.position.x = spriteB.position.x - 1;
        spriteA.velocity.x = 2;
        spriteB.velocity.x = -1;

        var expectedVelocityA = spriteA.velocity.copy();
        var expectedVelocityB = spriteB.velocity.copy();

        spriteB.displace(spriteA);

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
