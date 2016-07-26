var P5 = require("script!@cdo/apps/../lib/p5play/p5");
var P5Play = require("script!@cdo/apps/../lib/p5play/p5.play");
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';

describe('GameLabP5', function () {
  describe('mouseIsOver method', function () {
    var gameLabP5;
    var sprite;

    beforeEach(function () {
      gameLabP5 = new GameLabP5();
      gameLabP5.init({onExecutionStarting: sinon.spy(), onPreload: sinon.spy(), onSetup: sinon.spy(), onDraw: sinon.spy()});
      gameLabP5.startExecution();

      sprite = gameLabP5.p5.createSprite(0, 0);
      sprite.setCollider("circle", 0, 0, 100);
    });

    afterEach(function () {
      gameLabP5.resetExecution();
    });

    it('returns true when the mouse is within the circle collider', function () {
      gameLabP5.p5.mouseX = 0;
      gameLabP5.p5.mouseY = 0;
      expect(gameLabP5.p5.mouseIsOver(sprite)).to.equal(true);
      gameLabP5.p5.mouseX = 99;
      gameLabP5.p5.mouseY = 0;
      expect(gameLabP5.p5.mouseIsOver(sprite)).to.equal(true);
    });

    it('returns false when the mouse is outside the circle collider', function () {
      gameLabP5.p5.mouseX = 200;
      gameLabP5.p5.mouseY = 200;
      expect(gameLabP5.p5.mouseIsOver(sprite)).to.equal(false);
      gameLabP5.p5.mouseX = 100;
      gameLabP5.p5.mouseY = 0;
      expect(gameLabP5.p5.mouseIsOver(sprite)).to.equal(false);
    });

  });
});
