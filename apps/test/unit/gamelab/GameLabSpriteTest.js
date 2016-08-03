/* global p5 */
import "script!@cdo/apps/../lib/p5play/p5";
import "script!@cdo/apps/../lib/p5play/p5.play";
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import JSInterpreter from '@cdo/apps/JSInterpreter';
import {injectJSInterpreter} from '@cdo/apps/gamelab/GameLabSprite';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';

describe('GameLabSprite', function () {
  var gameLabP5;
  let createSprite;

  beforeEach(function () {
    gameLabP5 = new GameLabP5();
    gameLabP5.init({onExecutionStarting: sinon.spy(), onPreload: sinon.spy(), onSetup: sinon.spy(), onDraw: sinon.spy()});
    gameLabP5.startExecution();

    var interpreter = {getCurrentState: function () {return {};}};
    injectJSInterpreter(interpreter);
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
  });

  afterEach(function () {
    gameLabP5.resetExecution();
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
        var image = new p5.Image(100, 100, gameLabP5.p5);
        var frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
        var sheet = new gameLabP5.p5.SpriteSheet(image, frames);
        var animation = new gameLabP5.p5.Animation(sheet);
        sprite1 = createSprite(0, 0);
        sprite1.addAnimation('label', animation);
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

  describe('collision types using AABBOps', function () {
    var sprite, spriteTarget;

    beforeEach(function () {
      // sprite in to the left, moving right
      // spriteTarget in to the right, stationary
      sprite = createSprite(281, 100, 20, 20);
      spriteTarget = createSprite(300, 100, 20, 20);
      sprite.velocity.x = 3;
      spriteTarget.velocity.x = 0;
    });

    it('stops movement of colliding sprite when sprites bounce', function () {
      // sprite stops moving, spriteTarget moves right
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      var bounce = sprite.bounce(spriteTarget);

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
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      var collide = sprite.collide(spriteTarget);

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
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      var displace = sprite.displace(spriteTarget);

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
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      var bounceOff = sprite.bounceOff(spriteTarget);

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
      expect(sprite.velocity.x).to.equal(3);
      expect(spriteTarget.velocity.x).to.equal(0);

      var overlap = sprite.overlap(spriteTarget);

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
});
