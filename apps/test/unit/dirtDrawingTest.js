import {assert} from '../util/configuredChai';
import {sandboxDocumentBody} from "../util/testUtils";

function setGlobals() {
  document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';
  svg = document.getElementById('svgMaze');
}

var DirtDrawer = require('@cdo/apps/maze/dirtDrawer');
var MazeMap = require('@cdo/apps/maze/mazeMap');
var Cell = require('@cdo/apps/maze/cell');

var svg;

function createFakeSkin() {
  return {
    dirt: "http://fakedirt.png"
  };
}

describe("DirtDrawer", function () {
  sandboxDocumentBody();

  // The actual values of these are ignored by most of these tests
  var dirtMap = MazeMap.parseFromOldValues([
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ], [
    [0, 1, 2, 10, 11, -1, -2, -10, -11],
    [0, 1, 2, 10, 11, -1, -2, -10, -11],
    [0, 1, 2, 10, 11, -1, -2, -10, -11]
  ], Cell);

  var skin = createFakeSkin();

  it("spriteIndexForDirt", function () {
    assert.equal(DirtDrawer.spriteIndexForDirt(-11), 0);
    assert.equal(DirtDrawer.spriteIndexForDirt(-10), 1);
    assert.equal(DirtDrawer.spriteIndexForDirt(-9), 2);
    assert.equal(DirtDrawer.spriteIndexForDirt(-8), 3);
    assert.equal(DirtDrawer.spriteIndexForDirt(-7), 4);
    assert.equal(DirtDrawer.spriteIndexForDirt(-6), 5);
    assert.equal(DirtDrawer.spriteIndexForDirt(-5), 6);
    assert.equal(DirtDrawer.spriteIndexForDirt(-4), 7);
    assert.equal(DirtDrawer.spriteIndexForDirt(-3), 8);
    assert.equal(DirtDrawer.spriteIndexForDirt(-2), 9);
    assert.equal(DirtDrawer.spriteIndexForDirt(-1), 10);
    assert.equal(DirtDrawer.spriteIndexForDirt(0), -1);
    assert.equal(DirtDrawer.spriteIndexForDirt(1), 11);
    assert.equal(DirtDrawer.spriteIndexForDirt(2), 12);
    assert.equal(DirtDrawer.spriteIndexForDirt(3), 13);
    assert.equal(DirtDrawer.spriteIndexForDirt(4), 14);
    assert.equal(DirtDrawer.spriteIndexForDirt(5), 15);
    assert.equal(DirtDrawer.spriteIndexForDirt(6), 16);
    assert.equal(DirtDrawer.spriteIndexForDirt(7), 17);
    assert.equal(DirtDrawer.spriteIndexForDirt(8), 18);
    assert.equal(DirtDrawer.spriteIndexForDirt(9), 19);
    assert.equal(DirtDrawer.spriteIndexForDirt(10), 20);
    assert.equal(DirtDrawer.spriteIndexForDirt(11), 21);
  });

  it("createImage", function () {
    setGlobals();
    var drawer = new DirtDrawer(dirtMap, skin.dirt, svg);

    var row = 2;
    var col = 3;

    var image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    var clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    assert.equal(image, undefined, 'image doesnt exist to start');
    assert.equal(clip, undefined, 'clipPath doesnt exist to start');

    drawer.getOrCreateImage_('dirt', row, col);

    image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    assert.notEqual(image, undefined, 'image got created');
    assert.notEqual(clip, undefined, 'clipPath got created');
    assert.notEqual(clip.childNodes, undefined, 'clipPath has children');
    var rect = clip.childNodes[0];
    assert.notEqual(rect, undefined, "clipPath has a child");

    assert.equal(rect.getAttribute('x'), 150);
    assert.equal(rect.getAttribute('y'), 100);
    assert.equal(rect.getAttribute('width'), 50);
    assert.equal(rect.getAttribute('height'), 50);

    assert.equal(image.getAttribute('xlink:href'), skin.dirt);
    assert.equal(image.getAttribute('height'), 50);
    assert.equal(image.getAttribute('width'), 1100);
    assert.equal(image.getAttribute('clip-path'), 'url(#' + DirtDrawer.cellId('dirtClip', row, col) + ')');
  });

  describe("updateItemImage", function () {
    var drawer;
    var row = 0;
    var col = 0;
    var dirtId = DirtDrawer.cellId('', row, col);

    beforeEach(function () {
      setGlobals();
      drawer = new DirtDrawer(dirtMap, skin.dirt, svg);
    });

    it("update from nonExistent to hidden", function () {
      assert.equal(document.getElementById(dirtId), null, 'image starts out nonexistent');
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      assert.equal(document.getElementById(dirtId), null, 'image still doesnt exist');
    });

    it("update from nonExistent to visible", function () {
      assert.equal(document.getElementById(dirtId), null, 'image starts out nonexistent');
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      assert.notEqual(document.getElementById(dirtId), null, 'image now exists');
    });

    it("update from visible to hidden", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'visible');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'hidden');
    });

    it("update from visible to visible", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      assert.equal(image.getAttribute('x'), 50 * col);
      assert.equal(image.getAttribute('y'), 50 * row);

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      // make sure we updated x/y
      assert.equal(image.getAttribute('x'), 50 * (col - 2));
      assert.equal(image.getAttribute('y'), 50 * row);
    });

    it("update from hidden to visible", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'image is hidden');

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      // make sure we updated x/y
      assert.equal(image.getAttribute('x'), 50 * (col - 2));
      assert.equal(image.getAttribute('y'), 50 * row);
    });

    it("update from hidden to hidden", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'image is hidden');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'hidden');
    });
  });

});
