var testUtils = require('./util/testUtils');
var WordSearch = testUtils.requireWithGlobalsCheckSrcFolder('maze/wordsearch');
var assert = testUtils.assert;
var jsdom = require('jsdom').jsdom;

function setGlobals() {
  var html = '<html><head></head><body><svg id="svg"></svg></body></html>';
  global.document = jsdom(html);
  global.window = global.document.parentWindow;
  global.Blockly = {
    SVG_NS: "http://www.w3.org/2000/svg"
  };
}


describe("wordsearch: letterValue", function () {
  var letterValue = WordSearch.__testonly__.letterValue;
  var START_CHAR = WordSearch.__testonly__.START_CHAR;

  assert(START_CHAR !== undefined);

  it("letterValue", function () {
    assert.equal(letterValue('A', true), 'A');
    assert.equal(letterValue('B', true), 'B');
    assert.equal(letterValue('Z', true), 'Z');

    assert.equal(letterValue('Ax', true), 'A');
    assert.equal(letterValue('Bx', true), 'B');
    assert.equal(letterValue('Zx', true), 'Z');

    assert.equal(letterValue(2, true), START_CHAR);
  });
});

describe("wordsearch: randomLetter", function () {
  var randomLetter = WordSearch.__testonly__.randomLetter;

  it ("randomLetter without restrictions", function () {
    for (var i = 0; i < 100; i++) {
      assert((/^[A-Z]$/).test(randomLetter()));
    }
  });

  it ("randomLetter with restrictions", function () {
    var allChars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
      "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var letter = randomLetter(allChars.slice(0, -1));
    assert.equal(letter, 'Z', 'all other chars were restricted');

    for (var i = 0; i < 200; i++) {
      letter = randomLetter(['A']);
      assert((/^[B-Z]$/).test(letter), "failed on : " + letter);
    }
  });
});

describe("wordsearch: drawMapTiles", function () {
  it ("simple wordsearch", function () {
    // Create a fake maze.
    var map = [
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-',   2, 'R', 'U', 'N', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-']
    ];

    // create our fake document
    setGlobals();

    var wordSearch = new WordSearch('RUN', map);
    // Not currently doing any validation, so mostly just making sure no
    // exceptions are thrown.
    wordSearch.drawMapTiles(document.getElementById('svg'));
  });

});
