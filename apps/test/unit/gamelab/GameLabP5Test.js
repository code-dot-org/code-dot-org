import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';

describe('GameLabP5', function () {
  describe('mouseIsOver method', function () {
    var gameLabP5;

    beforeEach(function () {
      gameLabP5 = new GameLabP5();
      gameLabP5.init({onExecutionStarting: sinon.spy(), onPreload: sinon.spy(), onSetup: sinon.spy(), onDraw: sinon.spy()});
      gameLabP5.startExecution();
    });

    afterEach(function () {
      gameLabP5.resetExecution();
    });

    it('does not throw when checking a sprite with a circle collider', function () {
      expect(function () {
        var sprite = gameLabP5.p5.createSprite();
        sprite.setCollider("circle");
        gameLabP5.p5.mouseIsOver(sprite);
      }).not.to.throw();
    });

  });
});
