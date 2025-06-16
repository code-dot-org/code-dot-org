import Cell from '../Cell';
import MazeController, {Configuration} from '../MazeController';
import MazeMap from '../MazeMap';
import type {Skin} from '../skin';
import WordSearch from '../WordSearch';

import {baseLevel, mockSkin} from './data';

jest.mock('../MazeController');

function setGlobals() {
  document.body.innerHTML = '<svg id="svgMaze"></svg>';
}

describe('wordsearch: letterValue', function () {
  expect(WordSearch.START_CHAR).toBeDefined();

  it('letterValue', function () {
    expect(WordSearch.letterValue('A')).toEqual('A');
    expect(WordSearch.letterValue('B')).toEqual('B');
    expect(WordSearch.letterValue('Z')).toEqual('Z');

    expect(WordSearch.letterValue('Ax')).toEqual('A');
    expect(WordSearch.letterValue('Bx')).toEqual('B');
    expect(WordSearch.letterValue('Zx')).toEqual('Z');

    expect(WordSearch.letterValue(2)).toEqual(WordSearch.START_CHAR);
  });
});

describe('wordsearch: randomLetter', function () {
  it('randomLetter without restrictions', function () {
    for (let i = 0; i < 100; i++) {
      expect(WordSearch.randomLetter()).toMatch(/^[A-Z]$/);
    }
  });

  it('randomLetter with restrictions', function () {
    const allChars = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    let letter = WordSearch.randomLetter(allChars.slice(0, -1));
    // all other chars were restricted
    expect(letter).toEqual('Z');

    for (let i = 0; i < 200; i++) {
      letter = WordSearch.randomLetter(['A']);
      expect(letter).toMatch(/^[B-Z]$/);
    }
  });
});

describe('wordsearch: drawMapTiles', function () {
  it('simple wordsearch', function () {
    // Create a fake maze.
    const map = [
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', 2, 'R', 'U', 'N', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-', '-', '-', '-'],
    ];

    // create our fake document
    setGlobals();

    const config = {
      level: {
        ...baseLevel,
        map,
      },
      skin: mockSkin,
    };

    const maze = new MazeController(
      config.level,
      config.skin as Skin,
      config as Configuration,
      {},
    );
    maze.map = MazeMap.parseFromOldValues(
      config.level.map,
      config.level.initialDirt,
      Cell,
    );

    const wordSearch = new WordSearch(maze, config);
    const svgMaze = document.getElementById('svgMaze') as unknown as
      | SVGSVGElement
      | undefined;

    if (!svgMaze) {
      fail('svg was not created');
    }

    wordSearch.createDrawer(svgMaze);
    // Not currently doing any validation, so mostly just making sure no
    // exceptions are thrown.
    wordSearch.drawMapTiles(svgMaze);
  });
});
