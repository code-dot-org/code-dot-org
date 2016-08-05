/** @file Test of our p5.play wrapper object */
import {assert, expect} from '../../util/configuredChai';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('GameLabP5', function () {
  let gameLabP5;

  beforeEach(function () {
    gameLabP5 = createGameLabP5();
  });

  describe('mouseIsOver method', function () {
    let sprite;

    beforeEach(function () {
      sprite = gameLabP5.p5.createSprite(0, 0);
      sprite.setCollider("circle", 0, 0, 100);
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
    var edgeGroup;

    beforeEach(function () {
      edgeGroup = gameLabP5.p5.createEdgeSprites();
    });

    it('returns a group of sprites', function () {
      expect(edgeGroup).to.equal(gameLabP5.p5.edges);
      expect(edgeGroup.contains(gameLabP5.p5.rightEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.leftEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.bottomEdge)).to.equal(true);
      expect(edgeGroup.contains(gameLabP5.p5.topEdge)).to.equal(true);
      expect(edgeGroup.maxDepth()).to.equal(4);
    });

    it('creates edge sprites off screen', function () {
      assert.containSubset(gameLabP5.p5.leftEdge, {position: {x: -50, y: 200}, width: 100, height: 400});
      assert.containSubset(gameLabP5.p5.rightEdge, {position: {x: 450, y: 200}, width: 100, height: 400});
      assert.containSubset(gameLabP5.p5.bottomEdge, {position: {x: 200, y: 450}, width: 400, height: 100});
      assert.containSubset(gameLabP5.p5.topEdge, {position: {x: 200, y: -50}, width: 400, height: 100});
    });

  });
});
