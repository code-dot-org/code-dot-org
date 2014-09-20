var jsdom = require('jsdom').jsdom;
var testUtils = require('./util/testUtils');

function setGlobals() {
  var html = '<html><head></head><body><div id="svgMaze"><div class="pegman-location"></div></div></body></html>';
  global.document = jsdom(html);
  global.window = global.document.parentWindow;
  global.Blockly = {
    SVG_NS: "http://www.w3.org/2000/svg"
  };
}

var DirtDrawer = testUtils.requireWithGlobalsCheckSrcFolder('maze/dirtDrawer');
var cellId = testUtils.requireWithGlobalsCheckSrcFolder('maze/mazeUtils').cellId;
var assert = testUtils.assert;

function createFakeSkin() {
  return {
    dirt: "http://fakedirt.png"
  };
}

describe("DirtDrawer", function () {
  // The actual values of these are ignored by most of these tests
  var dirtMap = [
    [0, 1, 2, 10, 11, -1, -2, -10, -11],
    [0, 1, 2, 10, 11, -1, -2, -10, -11],
    [0, 1, 2, 10, 11, -1, -2, -10, -11]
  ];

  var skin = createFakeSkin();

  it("spriteIndexForDirt", function () {
    var spriteIndexForDirt = DirtDrawer.__testonly__.spriteIndexForDirt;

    assert.equal(spriteIndexForDirt(-11), 0);
    assert.equal(spriteIndexForDirt(-10), 1);
    assert.equal(spriteIndexForDirt(-9), 2);
    assert.equal(spriteIndexForDirt(-8), 3);
    assert.equal(spriteIndexForDirt(-7), 4);
    assert.equal(spriteIndexForDirt(-6), 5);
    assert.equal(spriteIndexForDirt(-5), 6);
    assert.equal(spriteIndexForDirt(-4), 7);
    assert.equal(spriteIndexForDirt(-3), 8);
    assert.equal(spriteIndexForDirt(-2), 9);
    assert.equal(spriteIndexForDirt(-1), 10);
    assert.equal(spriteIndexForDirt(0), -1);
    assert.equal(spriteIndexForDirt(1), 11);
    assert.equal(spriteIndexForDirt(2), 12);
    assert.equal(spriteIndexForDirt(3), 13);
    assert.equal(spriteIndexForDirt(4), 14);
    assert.equal(spriteIndexForDirt(5), 15);
    assert.equal(spriteIndexForDirt(6), 16);
    assert.equal(spriteIndexForDirt(7), 17);
    assert.equal(spriteIndexForDirt(8), 18);
    assert.equal(spriteIndexForDirt(9), 19);
    assert.equal(spriteIndexForDirt(10), 20);
    assert.equal(spriteIndexForDirt(11), 21);
  });

  it("createImage", function () {
    setGlobals();
    var createImage = DirtDrawer.__testonly__.createImage;
    var drawer = new DirtDrawer(dirtMap, skin.dirt);

    var row = 2;
    var col = 3;

    var image = document.getElementById(cellId('dirt', row, col));
    var clip = document.getElementById(cellId('dirtClip', row, col));

    assert.equal(image, undefined, 'image doesnt exist to start');
    assert.equal(clip, undefined, 'clipPath doesnt exist to start');

    createImage('dirt', row, col, drawer.dirtImageInfo_);

    image = document.getElementById(cellId('dirt', row, col));
    clip = document.getElementById(cellId('dirtClip', row, col));

    assert.notEqual(image, undefined, 'image got created');
    assert.notEqual(clip, undefined, 'clipPath got created');

    var rect = clip.children[0];
    assert.notEqual(rect, undefined, "clipPath has a child");

    assert.equal(rect.getAttribute('x'), 150);
    assert.equal(rect.getAttribute('y'), 100);
    assert.equal(rect.getAttribute('width'), 50);
    assert.equal(rect.getAttribute('height'), 50);

    assert.equal(image.getAttribute('xlink:href'), skin.dirt);
    assert.equal(image.getAttribute('height'), 50);
    assert.equal(image.getAttribute('width'), 1100);
    assert.equal(image.getAttribute('clip-path'), 'url(#' + cellId('dirtClip', row, col) + ')');
  });

  describe("updateImageWithIndex_", function () {
    var drawer;
    var row = 2;
    var col = 3;
    var dirtId = cellId('dirt', row, col);

    beforeEach(function() {
      setGlobals();
      drawer = new DirtDrawer(dirtMap, skin.dirt);
    });

    it("update from nonExistent to hidden", function () {
      assert.equal(document.getElementById(dirtId), null, 'image starts out nonexistent');
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, -1);
      assert.equal(document.getElementById(dirtId), null, 'image still doesnt exist');
    });

    it("update from nonExistent to visible", function () {
      assert.equal(document.getElementById(dirtId), null, 'image starts out nonexistent');
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 0);
      assert.notEqual(document.getElementById(dirtId), null, 'image now exists');
    });

    it("update from visible to hidden", function () {
      // create image
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 0);
      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'visible');

      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, -1);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'hidden');
    });

    it("update from visible to visible", function () {
      // create image
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 0);
      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      assert.equal(image.getAttribute('x'), 50 * col);
      assert.equal(image.getAttribute('y'), 50 * row);

      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 2);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      // make sure we updated x/y
      assert.equal(image.getAttribute('x'), 50 * (col - 2));
      assert.equal(image.getAttribute('y'), 50 * row);
    });

    it("update from hidden to visible", function () {
      // create image
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 0);
      // hide it
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, -1);

      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'image is hidden');

      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 2);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'visible');
      // make sure we updated x/y
      assert.equal(image.getAttribute('x'), 50 * (col - 2));
      assert.equal(image.getAttribute('y'), 50 * row);
    });

    it("update from hidden to hidden", function () {
      // create image
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, 0);
      // hide it
      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, -1);

      var image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'image is hidden');

      drawer.updateImageWithIndex_('dirt', row, col, drawer.dirtImageInfo_, -1);
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image still exists');
      assert.equal(image.getAttribute('visibility'), 'hidden');
    });
  });

});
