import {assert} from '../util/configuredChai';

var WordSearch = require('@cdo/apps/maze/wordsearch');

function setGlobals() {
  document.body.innerHTML = '<svg id="svgMaze"></svg>';
}

describe("wordsearch: letterValue", function () {
  assert(WordSearch.START_CHAR !== undefined);

  it("letterValue", function () {
    assert.equal(WordSearch.letterValue('A', true), 'A');
    assert.equal(WordSearch.letterValue('B', true), 'B');
    assert.equal(WordSearch.letterValue('Z', true), 'Z');

    assert.equal(WordSearch.letterValue('Ax', true), 'A');
    assert.equal(WordSearch.letterValue('Bx', true), 'B');
    assert.equal(WordSearch.letterValue('Zx', true), 'Z');

    assert.equal(WordSearch.letterValue(2, true), WordSearch.START_CHAR);
  });
});

describe("wordsearch: randomLetter", function () {
  it ("randomLetter without restrictions", function () {
    for (var i = 0; i < 100; i++) {
      assert((/^[A-Z]$/).test(WordSearch.randomLetter()));
    }
  });

  it ("randomLetter with restrictions", function () {
    var allChars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
      "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var letter = WordSearch.randomLetter(allChars.slice(0, -1));
    assert.equal(letter, 'Z', 'all other chars were restricted');

    for (var i = 0; i < 200; i++) {
      letter = WordSearch.randomLetter(['A']);
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

    var fakeMaze = {
      map: map
    };
    var fakeStudioApp = undefined;
    var fakeConfig = {
      level: {
        searchWord: '',
        map: map
      },
      skin: {
        tiles: 'tiles.png'
      }
    };

    var wordSearch = new WordSearch(fakeMaze, fakeStudioApp, fakeConfig);
    wordSearch.createDrawer(document.getElementById('svgMaze'));
    // Not currently doing any validation, so mostly just making sure no
    // exceptions are thrown.
    wordSearch.drawMapTiles(document.getElementById('svgMaze'));
  });

});
