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

  describe('mouseDidMove method', function () {
    beforeEach(function () {
      // Create an element with default playspace dimensions to make unit
      // testing mouse input easier.
      const fakePlaySpaceElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 400,
          height: 400
        })
      };
      gameLabP5.p5._curElement.elt = fakePlaySpaceElement;
    });

    it('returns true when the mouse moved since the last frame', function () {
      // Create a user-draw function that captures mouse values since the
      // bug we're fixing has to do with sequencing within the draw loop.
      let mouseX, mouseY, pmouseX, pmouseY, mouseDidMove;
      gameLabP5.p5.draw = function () {
        mouseX = gameLabP5.p5.mouseX;
        mouseY = gameLabP5.p5.mouseY;
        pmouseX = gameLabP5.p5.pmouseX;
        pmouseY = gameLabP5.p5.pmouseY;
        mouseDidMove = gameLabP5.p5.mouseDidMove();
      };

      // Set an initial mouse position
      gameLabP5.p5._onmousemove({
        type: 'mousemove',
        clientX: 200,
        clientY: 210
      });

      // Simulate advancing a few frames to get past first-frame weirdness around
      // previous mouse position values.
      gameLabP5.p5._draw();
      gameLabP5.p5._draw();

      // Initial state: Mouse positions are the same, mouseDidMove is false.
      expect(mouseX).to.equal(pmouseX).to.equal(200);
      expect(mouseY).to.equal(pmouseY).to.equal(210);
      expect(mouseDidMove).to.be.false;

      // Simulate a mouse movement
      gameLabP5.p5._onmousemove({
        type: 'mousemove',
        clientX: 201,
        clientY: 211
      });

      // Advance a frame to pick up the new values
      gameLabP5.p5._draw();

      // New state: Mouse positions are different
      expect(mouseX).to.equal(201);
      expect(pmouseX).to.equal(200);
      expect(mouseY).to.equal(211);
      expect(pmouseY).to.equal(210);
      expect(mouseDidMove).to.be.true;

      // Simulate advancing a frame WITHOUT moving the mouse
      gameLabP5.p5._draw();

      // Previous position catches up with current position, mouseDidMove is false again.
      expect(mouseX).to.equal(pmouseX).to.equal(201);
      expect(mouseY).to.equal(pmouseY).to.equal(211);
      expect(mouseDidMove).to.be.false;
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
