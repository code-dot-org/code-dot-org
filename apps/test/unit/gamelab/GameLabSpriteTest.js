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
    it('defaults to 100 by 100 when no width or height are set for non-animated sprites', function () {
      var sprite1 = createSprite(200, 200);
      expect(sprite1.width).to.equal(100);
      expect(sprite1.height).to.equal(100);
    });

    it('gets and sets the same value for non-animated sprites', function () {
      var sprite1 = createSprite(200, 200);
      sprite1.width = 200;
      sprite1.height = 450;
      expect(sprite1.width).to.equal(200);
      expect(sprite1.height).to.equal(450);
    });

    it('gets unscaled width and height for non-animated sprites', function () {
      var sprite1 = createSprite(200, 200);
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

  describe('getScaledWidth, getScaledHeight', function () {
    it('returns width and height when no scale is set for non-animated sprites', function () {
      var sprite1 = createSprite(200, 200);
      expect(sprite1.getScaledWidth()).to.equal(100);
      expect(sprite1.getScaledHeight()).to.equal(100);
      sprite1.width = 200;
      sprite1.height = 400;
      expect(sprite1.getScaledWidth()).to.equal(200);
      expect(sprite1.getScaledHeight()).to.equal(400);
    });

    it('gets scaled values for non-animated sprites', function () {
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
});
