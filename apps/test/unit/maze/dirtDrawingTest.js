import { expect } from '../../util/configuredChai';
import DirtDrawer from '@cdo/apps/maze/dirtDrawer';
import MazeMap from '@cdo/apps/maze/mazeMap';
import Cell from '@cdo/apps/maze/cell';

let svg;

function setGlobals() {
  expect(document.getElementById('svgMaze')).to.be.null;
  svg = document.createElement('div');
  svg.id = 'svgMaze';
  svg.innerHTML = '<div class="pegman-location"></div>';
  document.body.appendChild(svg);
}

function cleanupGlobals() {
  document.body.removeChild(svg);
  expect(document.getElementById('svgMaze')).to.be.null;
}

function createFakeSkin() {
  return {
    dirt: "http://fakedirt.png"
  };
}

describe("DirtDrawer", function () {
  beforeEach(setGlobals);
  afterEach(cleanupGlobals);

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
    expect(DirtDrawer.spriteIndexForDirt(-11)).to.equal(0);
    expect(DirtDrawer.spriteIndexForDirt(-10)).to.equal(1);
    expect(DirtDrawer.spriteIndexForDirt(-9)).to.equal(2);
    expect(DirtDrawer.spriteIndexForDirt(-8)).to.equal(3);
    expect(DirtDrawer.spriteIndexForDirt(-7)).to.equal(4);
    expect(DirtDrawer.spriteIndexForDirt(-6)).to.equal(5);
    expect(DirtDrawer.spriteIndexForDirt(-5)).to.equal(6);
    expect(DirtDrawer.spriteIndexForDirt(-4)).to.equal(7);
    expect(DirtDrawer.spriteIndexForDirt(-3)).to.equal(8);
    expect(DirtDrawer.spriteIndexForDirt(-2)).to.equal(9);
    expect(DirtDrawer.spriteIndexForDirt(-1)).to.equal(10);
    expect(DirtDrawer.spriteIndexForDirt(0)).to.equal(-1);
    expect(DirtDrawer.spriteIndexForDirt(1)).to.equal(11);
    expect(DirtDrawer.spriteIndexForDirt(2)).to.equal(12);
    expect(DirtDrawer.spriteIndexForDirt(3)).to.equal(13);
    expect(DirtDrawer.spriteIndexForDirt(4)).to.equal(14);
    expect(DirtDrawer.spriteIndexForDirt(5)).to.equal(15);
    expect(DirtDrawer.spriteIndexForDirt(6)).to.equal(16);
    expect(DirtDrawer.spriteIndexForDirt(7)).to.equal(17);
    expect(DirtDrawer.spriteIndexForDirt(8)).to.equal(18);
    expect(DirtDrawer.spriteIndexForDirt(9)).to.equal(19);
    expect(DirtDrawer.spriteIndexForDirt(10)).to.equal(20);
    expect(DirtDrawer.spriteIndexForDirt(11)).to.equal(21);
  });

  it("createImage", function () {
    var drawer = new DirtDrawer(dirtMap, skin.dirt, svg);

    var row = 2;
    var col = 3;

    var image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    var clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    expect(image).to.be.null;
    expect(clip).to.be.null;

    drawer.getOrCreateImage_('dirt', row, col);

    image = document.getElementById(DirtDrawer.cellId('dirt', row, col));
    clip = document.getElementById(DirtDrawer.cellId('dirtClip', row, col));

    expect(image).not.to.be.undefined;
    expect(clip).not.to.be.undefined;
    expect(clip.childNodes).not.to.be.undefined;
    var rect = clip.childNodes[0];
    expect(rect).not.to.be.undefined;

    expect(parseInt(rect.getAttribute('x'))).to.equal(150);
    expect(parseInt(rect.getAttribute('y'))).to.equal(100);
    expect(parseInt(rect.getAttribute('width'))).to.equal(50);
    expect(parseInt(rect.getAttribute('height'))).to.equal(50);

    expect(image.getAttribute('xlink:href')).to.equal(skin.dirt);
    expect(parseInt(image.getAttribute('height'))).to.equal(50);
    expect(parseInt(image.getAttribute('width'))).to.equal(1100);
    expect(image.getAttribute('clip-path')).to.equal('url(#' + DirtDrawer.cellId('dirtClip', row, col) + ')');
  });

  describe("updateItemImage", function () {
    var drawer;
    var row = 0;
    var col = 0;
    var dirtId = DirtDrawer.cellId('', row, col);

    beforeEach(function () {
      drawer = new DirtDrawer(dirtMap, skin.dirt, svg);
    });

    it("update from nonExistent to hidden", function () {
      expect(document.getElementById(dirtId)).to.be.null;
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      expect(document.getElementById(dirtId)).to.be.null;
    });

    it("update from nonExistent to visible", function () {
      expect(document.getElementById(dirtId)).to.be.null;
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      expect(document.getElementById(dirtId)).not.to.be.null;
    });

    it("update from visible to hidden", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      var image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('visible');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');
    });

    it("update from visible to visible", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      var image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('visible');
      expect(parseInt(image.getAttribute('x'))).to.equal(50 * col);
      expect(parseInt(image.getAttribute('y'))).to.equal(50 * row);

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('visible');
      // make sure we updated x/y
      expect(parseInt(image.getAttribute('x'))).to.equal(50 * (col - 2));
      expect(parseInt(image.getAttribute('y'))).to.equal(50 * row);
    });

    it("update from hidden to visible", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      var image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');

      drawer.map_.setValue(row, col, -9);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('visible');
      // make sure we updated x/y
      expect(parseInt(image.getAttribute('x'))).to.equal(50 * (col - 2));
      expect(parseInt(image.getAttribute('y'))).to.equal(50 * row);
    });

    it("update from hidden to hidden", function () {
      // create image
      drawer.map_.setValue(row, col, -11);
      drawer.updateItemImage(row, col);
      // hide it
      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);

      var image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');

      drawer.map_.setValue(row, col, 0);
      drawer.updateItemImage(row, col);
      image = document.getElementById(dirtId);
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');
    });
  });

});
