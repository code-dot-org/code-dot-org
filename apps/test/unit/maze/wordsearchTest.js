import { expect } from '../../util/configuredChai';

import WordSearch from '@cdo/apps/maze/wordsearch';

function setGlobals() {
  document.body.innerHTML = '<svg id="svgMaze"></svg>';
}

describe("wordsearch: letterValue", function () {
  expect(WordSearch.START_CHAR).not.to.be.undefined;

  it("letterValue", function () {
    expect(WordSearch.letterValue('A', true)).to.equal('A');
    expect(WordSearch.letterValue('B', true)).to.equal('B');
    expect(WordSearch.letterValue('Z', true)).to.equal('Z');

    expect(WordSearch.letterValue('Ax', true)).to.equal('A');
    expect(WordSearch.letterValue('Bx', true)).to.equal('B');
    expect(WordSearch.letterValue('Zx', true)).to.equal('Z');

    expect(WordSearch.letterValue(2, true)).to.equal(WordSearch.START_CHAR);
  });
});

describe("wordsearch: randomLetter", function () {
  it ("randomLetter without restrictions", function () {
    for (var i = 0; i < 100; i++) {
      expect(WordSearch.randomLetter()).to.match(/^[A-Z]$/);
    }
  });

  it ("randomLetter with restrictions", function () {
    var allChars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
      "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var letter = WordSearch.randomLetter(allChars.slice(0, -1));
    expect(letter).to.equal('Z');

    for (var i = 0; i < 200; i++) {
      letter = WordSearch.randomLetter(['A']);
      expect(letter).to.match(/^[B-Z]$/);
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
