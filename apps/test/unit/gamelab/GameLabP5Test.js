var P5 = require("script!@cdo/apps/../lib/p5play/p5");
var P5Play = require("script!@cdo/apps/../lib/p5play/p5.play");
import GameLabP5 from '@cdo/apps/gamelab/GameLabP5';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import {assert} from '../../util/configuredChai';

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

  describe('createEdgeSprites method', function () {
    var gameLabP5;
    var sprite;

    beforeEach(function () {
      gameLabP5 = new GameLabP5();
      gameLabP5.init({onExecutionStarting: sinon.spy(), onPreload: sinon.spy(), onSetup: sinon.spy(), onDraw: sinon.spy()});
      gameLabP5.startExecution();
    });

    afterEach(function () {
      gameLabP5.resetExecution();
    });

    it('returns a group of sprites', function () {
      var edgeGroup = gameLabP5.p5.createEdgeSprites();
      expect(edgeGroup).to.equal(gameLabP5.p5.edges);
      expect(edgeGroup.contains(gameLabP5.p5.rightEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.leftEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.bottomEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.topEdge)).to.equal(true);
      expect(edgeGroup.maxDepth()).to.equal(4);
    });

    it('creates edge sprites off screen', function () {
      var edgeGroup = gameLabP5.p5.createEdgeSprites();
      assert.containSubset(gameLabP5.p5.leftEdge, {position: {x: -50, y: 200}, width: 100, height: 400});
      assert.containSubset(gameLabP5.p5.rightEdge, {position: {x: 450, y: 200}, width: 100, height: 400});
      assert.containSubset(gameLabP5.p5.bottomEdge, {position: {x: 200, y: 450}, width: 400, height: 100});
      assert.containSubset(gameLabP5.p5.topEdge, {position: {x: 200, y: -50}, width: 400, height: 100});
    });

  });
});
