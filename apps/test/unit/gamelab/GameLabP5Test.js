/** @file Test of our p5.play wrapper object */
import {spy} from 'sinon';
import {assert, expect} from '../../util/configuredChai';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';
import {sandboxDocumentBody} from "../../util/testUtils";

describe('GameLabP5', function () {
  let gameLabP5;

  // Using the aggressive sandbox here because the P5 library generates
  // a default canvas when it's not attached to an existing one.
  sandboxDocumentBody();

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
        }),
        offsetWidth: 400,
        offsetHeight: 400,
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

  describe('rgb method', function () {
    it('returns the same as color method for rgb values', function () {
      expect(gameLabP5.p5.color(255, 255, 255)).to.deep.equal(gameLabP5.p5.rgb(255, 255, 255));
      expect(gameLabP5.p5.color(0, 0, 0)).to.deep.equal(gameLabP5.p5.rgb(0, 0, 0));
    });

    it('converts 0 to 1 alpha to 255 color value', function () {
      expect(gameLabP5.p5.color(255, 255, 255, 255).maxes.rgb).to.deep.equal(gameLabP5.p5.rgb(255, 255, 255, 1).maxes.rgb);
      expect(gameLabP5.p5.color(0, 0, 0, 0).maxes.rgb).to.deep.equal(gameLabP5.p5.rgb(0, 0, 0, 0).maxes.rgb);
      expect(gameLabP5.p5.color(255, 255, 255, 127.5).maxes.rgb).to.deep.equal(gameLabP5.p5.rgb(255, 255, 255, 0.5).maxes.rgb);
      expect(gameLabP5.p5.color(10, 20, 30, 63.75).maxes.rgb).to.deep.equal(gameLabP5.p5.rgb(10, 20, 30, 0.25).maxes.rgb);
    });
  });

  describe('ellipse', function () {
    let spyEllipse;
    beforeEach(function () {
      spyEllipse = spy(gameLabP5.p5, 'originalEllipse_');
    });

    afterEach(function () {
      spyEllipse.restore();
    });

    it('draws the same ellipse when called with all arguments', function () {
      gameLabP5.p5.ellipse(100, 100, 50, 50);
      gameLabP5.p5.originalEllipse_(100, 100, 50, 50);
      expect(gameLabP5.p5.originalEllipse_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalEllipse_.args[0]).to.deep.equal(gameLabP5.p5.originalEllipse_.args[1]);
    });

    it('draws a circle with radius equal to half of width, when no height given', function () {
      gameLabP5.p5.ellipse(100, 100, 60);
      gameLabP5.p5.originalEllipse_(100, 100, 60, 60);
      expect(gameLabP5.p5.originalEllipse_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalEllipse_.args[0]).to.deep.equal(gameLabP5.p5.originalEllipse_.args[1]);
    });

    it('draws a circle with diameter 50 if no width or height given', function () {
      gameLabP5.p5.ellipse(100, 100);
      gameLabP5.p5.originalEllipse_(100, 100, 50, 50);
      expect(gameLabP5.p5.originalEllipse_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalEllipse_.args[0]).to.deep.equal(gameLabP5.p5.originalEllipse_.args[1]);
    });
  });

  describe('rect', function () {
    let spyRect;
    beforeEach(function () {
      spyRect = spy(gameLabP5.p5, 'originalRect_');
    });

    afterEach(function () {
      spyRect.restore();
    });

    it('draws the same rect when called with all arguments', function () {
      gameLabP5.p5.rect(100, 100, 50, 50);
      gameLabP5.p5.originalRect_(100, 100, 50, 50);
      expect(gameLabP5.p5.originalRect_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalRect_.args[0]).to.deep.equal(gameLabP5.p5.originalRect_.args[1]);
    });

    it('draws a square with height equal to width, when no height given', function () {
      gameLabP5.p5.rect(100, 100, 60);
      gameLabP5.p5.originalRect_(100, 100, 60, 60);
      expect(gameLabP5.p5.originalRect_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalRect_.args[0]).to.deep.equal(gameLabP5.p5.originalRect_.args[1]);
    });

    it('draws a size 50 square if no width or height given', function () {
      gameLabP5.p5.rect(100, 100);
      gameLabP5.p5.originalRect_(100, 100, 50, 50);
      expect(gameLabP5.p5.originalRect_.calledTwice).to.equal(true);
      expect(gameLabP5.p5.originalRect_.args[0]).to.deep.equal(gameLabP5.p5.originalRect_.args[1]);
    });
  });
});
