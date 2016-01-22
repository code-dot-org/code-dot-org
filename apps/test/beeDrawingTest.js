var testUtils = require('./util/testUtils');

testUtils.setupLocales();

function setGlobals() {
  document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';

  assert(document, 'have a document');
  assert(document.getElementById('svgMaze'), 'document has an svgMaze');
  assert(document.getElementsByClassName('pegman-location').length, 1);
}

var Bee = require('@cdo/apps/maze/bee');
var BeeItemDrawer = require('@cdo/apps/maze/beeItemDrawer');
var DirtDrawer = require('@cdo/apps/maze/dirtDrawer');
var cellId = require('@cdo/apps/maze/mazeUtils').cellId;
var assert = testUtils.assert;

function createFakeSkin() {
  // BeeItemDrawer takes a skin as an input. Rather than load the actual skin,
  // we'll just fake those fields that we need
  return {
    redFlower: 'redFlower.png',
    purpleFlower: 'purpleFlower.png',
    honey: 'honey.png',
    flowerComb: 'flowercomb.png',
    numbers: 'numbers.png'
  };
}

var skin = createFakeSkin();

var Q = 0; // question mark index
var FC = 12; // flower comb index

function validateImages(setup, defaultFlower) {

  // create a 1 row map with all of our values
  var rawDirtMap = [setup.map(function (item) { return item[0]; })];
  var map = [setup.map(function (item) { return item[1]; })];
  var dirtMap = [setup.map(function (item) { return item[2]; })];
  var initialDirtMap = [setup.map(function (item) { return item[3]; })];

  var fakeMaze = {
    map: map
  };

  // create a config with a level based on the contraints from setup
  var config = {
    level: {
      honeyGoal: 1,
      map: map,
      flowerType: defaultFlower,
      startDirection: 1,
      initialDirt: initialDirtMap,
      rawDirt: rawDirtMap
    }
  };

  // create a bee with a shim maze
  var bee = new Bee(fakeMaze, null, config);

  var drawer = new BeeItemDrawer(dirtMap, skin, bee);

  var row = 0;

  // col is the column in our 1 row map, which is the equivalent to the row
  // of the same number in our setup list
  setup.forEach(function (item, col) {
    var running = item[4];
    var expectedCloud = item[5];
    var expectedText = item[6];
    var imgType = item[7];

    drawer.updateItemImage(row, col, running);

    var img = document.getElementById(cellId('beeItem', 0, col));
    var counter = document.getElementById(cellId('counter', 0, col));
    var cloud = document.getElementById(cellId('cloud', 0, col));

    try {
      assert.equal(img === null, imgType === null, JSON.stringify(item) + '    ' + col + '     ');

      if (img) {
        assert.equal(img.getAttribute('xlink:href'), skin[imgType]);
        assert.equal(img.getAttribute('visibility'), 'visible');
        assert.equal(img.getAttribute('x'), 50 * col);
        assert.equal(img.getAttribute('width'), 50);
      }

      if (counter) {
        var actualText = counter.firstChild.nodeValue;
        assert.equal(actualText, expectedText);
      }

      var actualCloud =
          !!(cloud && (cloud.getAttribute('visibility') == 'visible'));
      assert.equal(actualCloud, expectedCloud);

    } catch (exc) {
      // output which item is failing
      if (exc.message) {
        console.log(exc.message + ' for index #' + col);
      }
      throw exc;
    }
  });

}

describe("beeItemDrawer", function () {
  it ("red flower default", function () {
    setGlobals();

    // map, dirtMap, initialDirtmap, running, expected index, expected image
    var setup = [
      // everything but the last 3 rows is the same whether or not we're running
      [ 2, 2,   0,   0, true, false,  '', null],
      [ '+1', 1,   1,   1, true, false, '1', 'redFlower'],
      [ '+2', 1,   2,   2, true, false, '2', 'redFlower'],
      [ '+11', 1,  11,  11, true, false,'11', 'redFlower'],
      [ '+98', 1,  98,  98, true, false, '0', 'redFlower'], // 98 -> 0
      [ '+99', 1,  99,  99, true, false,  '', 'redFlower'], // 99 -> unlimited
      [ '-1', 1,  -1,  -1, true, false, '1', 'honey'],
      [ '-2', 1,  -2,  -2, true, false, '2', 'honey'],
      [ '-11', 1, -11, -11, true, false,'11', 'honey'],
      [ '-98', 1, -98, -98, true, false, '0', 'honey'],
      [ '-99', 1, -99, -99, true, false,  '', 'honey'],
      [ '+0', 0,   0,   1, true, false, '0', 'redFlower'],
      // red with default red - behaves same as map = 1
      [ '+1R', 'R',  1,   1, true, false, '1', 'redFlower'],
      // purple with default red
      [ '+1P', 'P',  1,   1, true, false, '1', 'purpleFlower'],
      [ '+1FC', 'FC',  1,   1, true, false, '1', 'redFlower'], // flowercomb
      [ '-1FC', 'FC', -1,  -1, true, false, '1', 'honey'],     // flowercomb
                                                         
      [ 2, 2,   0,   0, false, false,  '', null],
      [ '+1', 1,   1,   1, false, false, '1', 'redFlower'],
      [ '+2', 1,   2,   2, false, false, '2', 'redFlower'],
      [ '+11', 1,  11,  11, false, false,'11', 'redFlower'],
      [ '+98', 1,  98,  98, false, false, '0', 'redFlower'], // 98 -> 0
      [ '+99', 1,  99,  99, false, false,  '', 'redFlower'], // 99 -> unlimited
      [ '-1', 1,  -1,  -1, false, false, '1', 'honey'],
      [ '-2', 1,  -2,  -2, false, false, '2', 'honey'],
      [ '-11', 1, -11, -11, false, false,'11', 'honey'],
      [ '-98', 1, -98, -98, false, false, '0', 'honey'],
      [ '-99', 1, -99, -99, false, false,  '', 'honey'],
      [ '+0', 0,   0,   1, false, false, '0', 'redFlower'],
      [ '+1R', 'R',  1,   1, false, false, '1', 'redFlower'],
      // purple with default red
      [ '+1P', 'P',  1,   1, false, false, '?', 'purpleFlower'],
      [ '+1FC', 'FC',  1,   1, false, true,   '', 'redFlower'], // flowercomb
      [ '-1FC', 'FC', -1,  -1, false, true,   '', 'honey'],     // flowercomb
    ];

    validateImages(setup, 'redWithNectar');
  });

  it ("purple flower default", function () {
    setGlobals();

    // map, dirtMap, initialDirtmap, expected index, expected image
    var setup = [
      // everything but the last 3 rows is the same whether or not we're running
      [ 2,     2,   0,   0, true, false,  '', null],
      [ '+1',  1,   1,   1, true, false, '1', 'purpleFlower'],
      [ '+2',  1,   2,   2, true, false, '2', 'purpleFlower'],
      [ '+11', 1,  11,  11, true, false,'11', 'purpleFlower'],
      [ '+98', 1,  98,  98, true, false, '0', 'purpleFlower'], // 98 -> 0
      [ '+99', 1,  99,  99, true, false,  '', 'purpleFlower'], // 99 -> unlimited
      [ '-1',  1,  -1,  -1, true, false, '1', 'honey'],
      [ '-2',  1,  -2,  -2, true, false, '2', 'honey'],
      [ '-11', 1, -11, -11, true, false,'11', 'honey'],
      [ '-98', 1, -98, -98, true, false, '0', 'honey'],
      [ '-99', 1, -99, -99, true, false,  '', 'honey'],
      [ '+0',     0,   0,   1, true, false, '0', 'purpleFlower'],
      // red with default purple - visible whether or not running
      [ '+1R', 'R',  1,   1, true, false, '1', 'redFlower'],
      // purple with default purple - same as map = 1
      [ '+1P', 'P',  1,   1, true, false, '1', 'purpleFlower'],
      [ '+1FC','FC',  1,   1, true, false, '1', 'purpleFlower'], // flowercomb
      [ '-1FC','FC', -1,  -1, true, false, '1', 'honey'],        // flowercomb
                
      [ 2,     2,   0,   0, false, false,  '', null],
      [ '+1',  1,   1,   1, false, false, '?', 'purpleFlower'],
      [ '+2',  1,   2,   2, false, false, '?', 'purpleFlower'],
      [ '+11', 1,  11,  11, false, false, '?', 'purpleFlower'],
      [ '+98', 1,  98,  98, false, false, '?', 'purpleFlower'],
      [ '+99', 1,  99,  99, false, false, '?', 'purpleFlower'],
      [ '-1',  1,  -1,  -1, false, false, '1', 'honey'],
      [ '-2',  1,  -2,  -2, false, false, '2', 'honey'],
      [ '-11', 1, -11, -11, false, false,'11', 'honey'],
      [ '-98', 1, -98, -98, false, false, '0', 'honey'],
      [ '-99', 1, -99, -99, false, false,  '', 'honey'],
      [ '+0',     0,   0,   1, false, false, '?', 'purpleFlower'],
      // red with default purple - visible whether or not running
      [ '+1R', 'R',  1,   1, false, false, '1', 'redFlower'],
      // purple with default purple - same as map = 1
      [ '+1P', 'P',  1,   1, false, false, '?', 'purpleFlower'],
      [ '+1FC','FC',  1,   1, false, true,   '', 'purpleFlower'], // flowercomb
      [ '-1FC','FC', -1,  -1, false, true,   '', 'honey'],        // flowercomb
    ];

    validateImages(setup, 'purpleNectarHidden');
  });
});
