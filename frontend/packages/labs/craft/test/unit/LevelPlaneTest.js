import { describe, it, expect } from 'vitest';

import FacingDirection from '../../src/js/game/LevelMVC/FacingDirection';
import LevelBlock from '../../src/js/game/LevelMVC/LevelBlock';
import LevelPlane from '../../src/js/game/LevelMVC/LevelPlane';
import Position from '../../src/js/game/LevelMVC/Position';

it('get blocks', () => {
  const data = [
    'grass', 'dirt', 'stone', 'sand',
    'water', 'lava', 'water', 'lava',
    'grass', 'dirt', 'stone', 'sand',
  ];
  const plane = new LevelPlane(data, 4, 3, null, "actionPlane");

  expect(plane.getBlockAt(new Position(0, 0)).blockType).toBe('grass');
  expect(plane.getBlockAt(new Position(2, 1)).blockType).toBe('water');
  expect(plane.getBlockAt(new Position(2, 2)).blockType).toBe('stone');
  expect(plane.getBlockAt(new Position(1, 0)).blockType).toBe('dirt');
  expect(plane.getBlockAt(new Position(-1, -1))).toBeUndefined();
  expect(plane.getBlockAt(new Position(4, 1))).toBeUndefined();
  expect(plane.getBlockAt(new Position(2, 3))).toBeUndefined();

  expect(plane.getOrthogonalBlocks(new Position(1, 1))).toEqual({
    north: {block: new LevelBlock('dirt'), relative: FacingDirection.South},
    south: {block: new LevelBlock('dirt'), relative: FacingDirection.North},
    east: {block: new LevelBlock('water'), relative: FacingDirection.West},
    west: {block: new LevelBlock('water'), relative: FacingDirection.East},
  });

  expect(plane.getOrthogonalBlocks(new Position(2, 0))).toEqual({
    north: {block: undefined, relative: FacingDirection.South},
    south: {block: new LevelBlock('water'), relative: FacingDirection.North},
    east: {block: new LevelBlock('sand'), relative: FacingDirection.West},
    west: {block: new LevelBlock('dirt'), relative: FacingDirection.East},
  });

  expect(plane.getOrthogonalBlocks(new Position(2, 3))).toEqual({
    north: {block: new LevelBlock('stone'), relative: FacingDirection.South},
    south: {block: undefined, relative: FacingDirection.North},
    east: {block: undefined, relative: FacingDirection.West},
    west: {block: undefined, relative: FacingDirection.East},
  });

});

//   0 1 2 3 4 5
// 0 *   ┌───┐
// 1   ┌─┤   │
// 2 ──┼─┴──   │
// 3   │     ──┘
it('redstone wires', () => {
  const data = new Array(24).fill('');
  const plane = new LevelPlane(data, 6, 4, null, "actionPlane");

  // Place the test pattern.
  plane.setBlockAt(new Position(0, 0), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(2, 0), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(3, 0), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(4, 0), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(1, 1), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(2, 1), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(4, 1), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(0, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(1, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(2, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(3, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(5, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(1, 3), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(4, 3), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(5, 3), new LevelBlock('redstoneWire'));

  let expected = [
    '',          null,        'DownRight', 'Horizontal','DownLeft',  null,
    null,        'DownRight', 'TLeft',     null,        'Vertical',  null,
    'Horizontal','Cross',     'TUp',       'Horizontal',null,        'Vertical',
    null,        'Vertical',  null,        null,        'Horizontal','UpLeft',
  ].map(wire => wire === null ? '' : `redstoneWire${wire}`);

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

  // Destroy a few wires.
  plane.setBlockAt(new Position(2, 1), new LevelBlock(''));
  plane.setBlockAt(new Position(3, 0), new LevelBlock(''));
  plane.setBlockAt(new Position(0, 2), new LevelBlock(''));
  plane.setBlockAt(new Position(5, 3), new LevelBlock(''));

  expected = [
    '',          null,        '',          null,        'Vertical',   null,
    null,        'Vertical',  null,        null,        'Vertical',   null,
    null,        'TRight',    'Horizontal','Horizontal',null,         '',
    null,        'Vertical',  null,        null,        '',           null,
  ].map(wire => wire === null ? '' : `redstoneWire${wire}`);

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Before:              After:
// ║   ║     ║          ║ ╔══     ║
//   ║         ║          ║       ╔══
//           ║                    ║
//   ║       ║            ║       ║
// ║   ║   ║            ║ ╚══   ══╗
//           ║                    ║
//
it('rail connections: T-junctions', () => {
  const data = [
    'rails',  '',       'rails',  '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       '',       'rails',
    '',       '',       '',       '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       'rails',  '',
    'rails',  '',       'rails',  '',       'rails',  '',       '',
    '',       '',       '',       '',       '',       'rails',  '',
  ];
  const plane = new LevelPlane(data, 7, 6, null, "actionPlane");

  expect(plane.setBlockAt(new Position(1, 0), new LevelBlock('rails')).blockType).toBe('railsSouthEast');
  expect(plane.setBlockAt(new Position(5, 1), new LevelBlock('rails')).blockType).toBe('railsSouthEast');
  expect(plane.setBlockAt(new Position(1, 4), new LevelBlock('rails')).blockType).toBe('railsNorthEast');
  expect(plane.setBlockAt(new Position(5, 4), new LevelBlock('rails')).blockType).toBe('railsSouthWest');

  const expected = [
    'rails',  'railsSE','railsW', '',       '',       'rails',  '',
    '',       'railsN', '',       '',       '',       'railsSE','railsW',
    '',       '',       '',       '',       '',       'railsNS','',
    '',       'railsS', '',       '',       '',       'railsN', '',
    'rails',  'railsNE','railsW', '',       'railsE', 'railsSW','',
    '',       '',       '',       '',       '',       'railsN', '',
  ].map(rail => {
    return rail.replace('N', 'North').replace('S', 'South').replace('E', 'East').replace('W', 'West');
  });

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Before:              After:
// ║   ║     ║          ═════     ║
//   ║         ║          ║       ═══
//           ║                    ║
//   ║       ║            ║       ║
// ║   ║   ║            ═════   ═══
//           ║                    ║
//
it('rail connections: unpowered T-junctions', () => {
  const data = [
    'rails',  '',       'rails',  '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       '',       'rails',
    '',       '',       '',       '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       'rails',  '',
    'rails',  '',       'rails',  '',       'rails',  '',       '',
    '',       '',       '',       '',       '',       'rails',  '',
  ];
  const plane = new LevelPlane(data, 7, 6, null, "actionPlane");

  expect(plane.setBlockAt(new Position(1, 0), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');
  expect(plane.setBlockAt(new Position(5, 1), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');
  expect(plane.setBlockAt(new Position(1, 4), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');
  expect(plane.setBlockAt(new Position(5, 4), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');

  const expected = [
    'railsE',  'railsUEW','railsW',  '',        '',        'rails',   '',
    '',        'rails',   '',        '',        '',        'railsUEW','railsW',
    '',        '',        '',        '',        '',        'railsS',  '',
    '',        'rails',   '',        '',        '',        'railsN',  '',
    'railsE',  'railsUEW','railsW',  '',        'railsE',  'railsUEW','',
    '',        '',        '',        '',        '',        'rails',   '',
  ].map(rail => {
    return rail.replace('U', 'Unpowered').replace('N', 'North').replace('S', 'South').replace('E', 'East').replace('W', 'West');
  });

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Place four tracks in a circle.
// 1:      2:     3:     4:
//   ║     ═══    ╔══    ╔═╗
//                ║      ╚═╝
//
it('rail connections: 2x2 loop', () => {
  const data = new Array(4).fill('');
  const plane = new LevelPlane(data, 2, 2, null, "actionPlane");

  expect(plane.setBlockAt(new Position(1, 0), new LevelBlock('rails')).blockType).toBe('rails');
  expect(plane.setBlockAt(new Position(0, 0), new LevelBlock('rails')).blockType).toBe('railsEast');
  expect(plane.setBlockAt(new Position(0, 1), new LevelBlock('rails')).blockType).toBe('railsNorth');
  expect(plane.setBlockAt(new Position(1, 1), new LevelBlock('rails')).blockType).toBe('railsNorthWest');

  const expected = [
    'railsSouthEast', 'railsSouthWest',
    'railsNorthEast', 'railsNorthWest',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Place a longer minecart track.
// Order:       Track:
//  1 3         ══╗
//    2 A B       ║ ╔══
//    4 9 8       ║ ╚═╗
//    5 6 7       ╚═══╝
it('rail connections: longer track', () => {
  const data = new Array(16).fill('');
  const plane = new LevelPlane(data, 4, 4, null, "actionPlane");

  plane.setBlockAt(new Position(0, 0), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 1), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 0), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 2), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 3), new LevelBlock('rails'));
  plane.setBlockAt(new Position(2, 3), new LevelBlock('rails'));
  plane.setBlockAt(new Position(3, 3), new LevelBlock('rails'));
  plane.setBlockAt(new Position(3, 2), new LevelBlock('rails'));
  plane.setBlockAt(new Position(2, 2), new LevelBlock('rails'));
  plane.setBlockAt(new Position(2, 1), new LevelBlock('rails'));
  plane.setBlockAt(new Position(3, 1), new LevelBlock('rails'));

  const expected = [
    'railsEast',      'railsSouthWest', '',               '',
    '',               'railsNorthSouth','railsSouthEast', 'railsWest',
    '',               'railsNorthSouth','railsNorthEast', 'railsSouthWest',
    '',               'railsNorthEast', 'railsEastWest',  'railsNorthWest',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Destroying part of a track should leave T-junctions intact. Don't heal the
// curved track into a straight segment.
//
// Before:   After:
//    ║         ║
// X══╗        ═╗
//    ║         ║
it('rail connections: destroy block', () => {
  const data = new Array(9).fill('');
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(0, 1), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 1), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 2), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 0), new LevelBlock('rails'));

  // Destroy track block.
  plane.setBlockAt(new Position(0, 1), new LevelBlock(''));

  const expected = [
    '',               'rails','',
    '',               'railsSouthWest', '',
    '',               'railsNorth','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

// Placing track after a previously-destroyed T-junction should heal it
//
// Before:   After:
//              ║
//   ═╗         ║
//    ║         ║
it('rail connections: destroy block', () => {
  const data = new Array(9).fill('');
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(1, 2), new LevelBlock('rails'));
  plane.setBlockAt(new Position(1, 1), new LevelBlock('rails'));
  plane.setBlockAt(new Position(0, 1), new LevelBlock('rails'));

  // Destroy track block.
  plane.setBlockAt(new Position(0, 1), new LevelBlock(''));

  let expected = [
    '', '','',
    '', 'railsSouthWest', '',
    '', 'railsNorth','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

  plane.setBlockAt(new Position(1, 0), new LevelBlock('rails'));

  expected = [
    '', 'railsSouth','',
    '', 'railsNorthSouth', '',
    '', 'railsNorth','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T        T║
//              ║
//           X  ║
it('redstone charge: place block', () => {
  const data = [
    '','railsRedstoneTorch',      '',
    '','',                        '',
    '','',                        '',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(2, 0), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(2, 1), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(2, 2), new LevelBlock('redstoneWire'));
  plane.setBlockAt(new Position(0, 2), new LevelBlock('redstoneWire'));

  const expected = [
    '',         'railsRedstoneTorch','redstoneWireDownLeftOn',
    '',                  '',         'redstoneWireVerticalOn',
    'redstoneWire',      '',         'redstoneWireVerticalOn',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('powered rails: vertical charge propagation', () => {
  const data = [
    '', 'railsRedstoneTorch',       '',
    '', 'railsUnpoweredSouth', '',
    '', 'railsUnpoweredNorth', '',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.refreshRedstone();
  expect(plane.getBlockAt(new Position(1, 1)).blockType).toBe("railsPoweredSouth");
  expect(plane.getBlockAt(new Position(1, 2)).blockType).toBe("railsPoweredNorth");

});

it('powered rails: horizontal charge propagation', () => {
  const data = [
    '', '', '',
    'railsRedstoneTorch', 'railsUnpoweredEast', 'railsUnpoweredWest',
    '', '', '',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.refreshRedstone();
  expect(plane.getBlockAt(new Position(1, 1)).blockType).toBe("railsPoweredEast");
  expect(plane.getBlockAt(new Position(2, 1)).blockType).toBe("railsPoweredWest");

});

// Powered: =
// Unpowered: -
//
// Before:              After:
//            T                    T
// T║   |     ║         T═════     ║
//    |         |          |       --
//            |                    |
//    |       |            |       |
// T║   |   |           T═════    --
//            ║                    ║
//            T                    T
it('powered rails: only propagate along straight lines', () => {
  const TORCH = "railsRedstoneTorch";
  const RAILS = "railsUnpowered";
  const EMPTY = "";
  const data = [
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, TORCH, EMPTY,
    TORCH, RAILS, EMPTY, RAILS, EMPTY, EMPTY, RAILS, EMPTY,
    EMPTY, EMPTY, RAILS, EMPTY, EMPTY, EMPTY, EMPTY, RAILS,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAILS, EMPTY,
    EMPTY, EMPTY, RAILS, EMPTY, EMPTY, EMPTY, RAILS, EMPTY,
    TORCH, RAILS, EMPTY, RAILS, EMPTY, RAILS, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAILS, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, TORCH, EMPTY,
  ];
  const plane = new LevelPlane(data, 8, 8, null, "actionPlane");

  expect(plane.setBlockAt(new Position(2, 1), new LevelBlock('railsUnpowered')).blockType).toBe('railsPoweredEastWest');
  expect(plane.setBlockAt(new Position(2, 5), new LevelBlock('railsUnpowered')).blockType).toBe('railsPoweredEastWest');
  expect(plane.setBlockAt(new Position(6, 2), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');
  expect(plane.setBlockAt(new Position(6, 5), new LevelBlock('railsUnpowered')).blockType).toBe('railsUnpoweredEastWest');

  const expected = [
    '',       '',         '',         '',        '', '',        'railsT',   '',
    'railsT', 'railsPE',  'railsPEW', 'railsPW', '', '',        'railsP',   '',
    '',       '',         'railsU',   '',        '', '',        'railsUEW', 'railsUW',
    '',       '',         '',         '',        '', '',        'railsUS',  '',
    '',       '',         'railsU',   '',        '', '',        'railsUNS', '',
    'railsT', 'railsPE',  'railsPEW', 'railsPW', '', 'railsUE', 'railsUEW', '',
    '',       '',         '',         '',        '', '',        'railsP',   '',
    '',       '',         '',         '',        '', '',        'railsT',   '',
  ].map(rail => {
    return rail
        .replace('T', 'RedstoneTorch')
        .replace('U', 'Unpowered')
        .replace('P', 'Powered')
        .replace('N', 'North')
        .replace('S', 'South')
        .replace('E', 'East')
        .replace('W', 'West');
  });

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T║       T
//     ║        ║
//  X  ║     X  ║
it('redstone charge: destroy block', () => {
  const data = [
    '',         'railsRedstoneTorch','redstoneWireDownLeftOn',
    '',                  '',         'redstoneWireVerticalOn',
    'redstoneWire',      '',         'redstoneWireVerticalOn',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(2, 0), new LevelBlock(''));

  const expected = [
    '',         'railsRedstoneTorch',            '',
    '',                  '',         'redstoneWireVertical',
    'redstoneWire',      '',         'redstoneWireVertical',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T║        ║
//     ║        ║
//  X  ║     X  ║
it('torch charge: destroy block', () => {
  const data = [
    '',         'railsRedstoneTorch','redstoneWireDownLeftOn',
    '',                  '',         'redstoneWireVerticalOn',
    'redstoneWire',      '',         'redstoneWireVerticalOn',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(1, 0), new LevelBlock(''));

  const expected = [
    '',                  '',         'redstoneWireVertical',
    '',                  '',         'redstoneWireVertical',
    'redstoneWire',      '',         'redstoneWireVertical',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
// X   ║     X  T║
//     ║         ║
//     ║         ║
it('torch charge: place block', () => {
  const data = [
    'redstoneWire','',      'redstoneWireVertical',
    '',            '',      'redstoneWireVertical',
    '',            '',      'redstoneWireVertical',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(1, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    'redstoneWire',         '',         'redstoneWireVerticalOn',
    '',                     '',         'redstoneWireVerticalOn',
    '',            'railsRedstoneTorch','redstoneWireUpLeftOn',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('iron door open: place block', () => {
  const data = [
    'redstoneWireVertical','',      '',
    'redstoneWireVertical','',      '',
    'doorIron',            '',      'doorIron',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(1, 0), new LevelBlock('railsRedstoneTorch'));

  expect(plane.getBlockAt(new Position(2, 2)).isOpen).toBe(false);
  expect(plane.getBlockAt(new Position(0, 2)).isOpen).toBe(true);

});

it('iron door close: destroy block', () => {
  const data = [
    'railsRedstoneTorch',    '','',
    'redstoneWireVerticalOn','','',
    'doorIron',              '','doorIron',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(0, 0), new LevelBlock(''));

  expect(plane.getBlockAt(new Position(2, 2)).isOpen).toBe(false);
  expect(plane.getBlockAt(new Position(1, 2)).isOpen).toBe(false);

});

it('piston activate: place block', () => {
  const data = [
    '','','grass','pistonLeft','','pistonRight','grass','',
    '','','','redstoneWireVertical','','redstoneWireVertical','','',
    '','','grass','redstoneWireVertical','','redstoneWireVertical','','',
    '','','pistonUp','redstoneWireUpLeft','','redstoneWireUpRight','pistonDown','',
    '','','','','','','grass','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(4, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOn','','pistonRightOn','pistonArmRight','grass',
    '','','grass','redstoneWireVerticalOn','','redstoneWireVerticalOn','','',
    '','','pistonArmUp','redstoneWireTRightOn','railsRedstoneTorch','redstoneWireTLeftOn','','',
    '','','pistonUpOn','redstoneWireUpLeftOn','','redstoneWireUpRightOn','pistonDownOn','',
    '','','','','','','pistonArmDown','',
    '','','','','','','grass','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston deactivate: destroy block', () => {
  const data = [
    '','grass','pistonArmLeft','pistonLeftOn','','pistonRightOn','pistonArmRight','grass',
    '','','grass','redstoneWireVerticalOn','','redstoneWireVerticalOn','','',
    '','','pistonArmUp','redstoneWireTRightOn','railsRedstoneTorch','redstoneWireTLeftOn','','',
    '','','pistonUpOn','redstoneWireUpLeftOn','','redstoneWireUpRightOn','pistonDownOn','',
    '','','','','','','pistonArmDown','',
    '','','','','','','grass','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(4, 2), new LevelBlock(''));

  const expected = [
    '','grass','','pistonLeft','','pistonRight','','grass',
    '','','grass','redstoneWireVertical','','redstoneWireVertical','','',
    '','','','redstoneWireVertical','','redstoneWireVertical','','',
    '','','pistonUp','redstoneWireUpLeft','','redstoneWireUpRight','pistonDown','',
    '','','','','','','','',
    '','','','','','','grass','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('sticky piston activate: place block', () => {
  const data = [
    '','','grass','pistonLeftSticky','','pistonRightSticky','grass','',
    '','','','redstoneWireVertical','','redstoneWireVertical','','',
    '','','grass','redstoneWireVertical','','redstoneWireVertical','','',
    '','','pistonUpSticky','redstoneWireUpLeft','','redstoneWireUpRight','pistonDownSticky','',
    '','','','','','','grass','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(4, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOnSticky','','pistonRightOnSticky','pistonArmRight','grass',
    '','','grass','redstoneWireVerticalOn','','redstoneWireVerticalOn','','',
    '','','pistonArmUp','redstoneWireTRightOn','railsRedstoneTorch','redstoneWireTLeftOn','','',
    '','','pistonUpOnSticky','redstoneWireUpLeftOn','','redstoneWireUpRightOn','pistonDownOnSticky','',
    '','','','','','','pistonArmDown','',
    '','','','','','','grass','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('sticky piston deactivate: destroy block', () => {
  const data = [
    '','grass','pistonArmLeft','pistonLeftOnSticky','','pistonRightOnSticky','pistonArmRight','grass',
    '','','grass','redstoneWireVerticalOn','','redstoneWireVerticalOn','','',
    '','','pistonArmUp','redstoneWireTRightOn','railsRedstoneTorch','redstoneWireTLeftOn','','',
    '','','pistonUpOnSticky','redstoneWireUpLeftOn','','redstoneWireUpRightOn','pistonDownOnSticky','',
    '','','','','','','pistonArmDownSticky','',
    '','','','','','','grass','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(4, 2), new LevelBlock(''));

  const expected = [
    '','','grass','pistonLeftSticky','','pistonRightSticky','grass','',
    '','','','redstoneWireVertical','','redstoneWireVertical','','',
    '','','grass','redstoneWireVertical','','redstoneWireVertical','','',
    '','','pistonUpSticky','redstoneWireUpLeft','','redstoneWireUpRight','pistonDownSticky','',
    '','','','','','','grass','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy torch: adjacent to piston', () => {
  const data = [
    '','','railsRedstoneTorch','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy torch: not adjacent to piston', () => {
  const data = [
    '','railsRedstoneTorch','grass','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy door: adjacent to piston', () => {
  const data = [
    '','','doorIron','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy door: not adjacent to piston', () => {
  const data = [
    '','doorIron','grass','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy pressure Plate: adjacent to piston', () => {
  const data = [
    '','','pressurePlateUp','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy door: not adjacent to piston', () => {
  const data = [
    '','pressurePlateUp','grass','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy redstoneWire: adjacent to piston', () => {
  const data = [
    '','','redstoneWireHorizontal','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston destroy redstoneWire: not adjacent to piston', () => {
  const data = [
    '','redstoneWireHorizontal','grass','pistonLeft','','','','',
    '','','','redstoneWireVertical','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(3, 2), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','grass','pistonArmLeft','pistonLeftOn','','','','',
    '','','','redstoneWireVerticalOn','','','','',
    '','','','railsRedstoneTorch','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('piston directional power: torch at arm side', () => {
  const data = [
    '','','','pistonLeft','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(2, 0), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','railsRedstoneTorch','pistonLeft','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('sticky piston directional power: torch at arm side', () => {
  const data = [
    '','','','pistonLeftSticky','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(2, 0), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','railsRedstoneTorch','pistonLeftSticky','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('certain objets arent weakly charged', () => {
  const data = [
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'pistonUp','','pistonUp','','pistonUp','','pistonUp','',
    'pressurePlateUp','','doorIron','','pistonRight','','grass','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(0, 5), new LevelBlock('railsRedstoneTorch'));
  plane.setBlockAt(new Position(2, 5), new LevelBlock('railsRedstoneTorch'));
  plane.setBlockAt(new Position(4, 5), new LevelBlock('railsRedstoneTorch'));
  plane.setBlockAt(new Position(6, 5), new LevelBlock('railsRedstoneTorch'));

  const expected = [
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','pistonArmUp','',
    'pistonUp','','pistonUp','','pistonUp','','pistonUpOn','',
    'pressurePlateUp','','doorIron','','pistonRightOn','pistonArmRight','grass','',
    'railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('Sticky piston grabbing, do not pull', () => {
  const data = [
    '','','','','','','','',
    '','','','','','','','',
    'pressurePlateUp','','railsRedstoneTorch','','torch','','redstoneWire','',
    'pistonArmUp','','pistonArmUp','','pistonArmUp','','pistonArmUp','',
    'pistonUpOnSticky','','pistonUpOnSticky','','pistonUpOnSticky','','pistonUpOnSticky','',
    'railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(0, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(2, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(4, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(6, 5), new LevelBlock(''));

  const expected = [
    '','','','','','','','',
    '','','','','','','','',
    'pressurePlateUp','','railsRedstoneTorch','','torch','','redstoneWire','',
    '','','','','','','','',
    'pistonUpSticky','','pistonUpSticky','','pistonUpSticky','','pistonUpSticky','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('Sticky piston grabbing, do pull', () => {
  const data = [
    '','','','','','','','',
    '','','','','','','','',
    'grass','','bedrock','','railsSouth','','netherrack','',
    'pistonArmUp','','pistonArmUp','','pistonArmUp','','pistonArmUp','',
    'pistonUpOnSticky','','pistonUpOnSticky','','pistonUpOnSticky','','pistonUpOnSticky','',
    'railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','','railsRedstoneTorch','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(0, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(2, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(4, 5), new LevelBlock(''));
  plane.setBlockAt(new Position(6, 5), new LevelBlock(''));

  const expected = [
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'grass','','bedrock','','railsSouth','','netherrack','',
    'pistonUpSticky','','pistonUpSticky','','pistonUpSticky','','pistonUpSticky','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('Weak Charge: placeblock', () => {
  const data = [
    '','','','','','','','',
    '','pistonRight','','','','','','',
    'railsRedstoneTorch','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(0, 1), new LevelBlock('grass'));

  const expected = [
    '','','','','','','','',
    'grass','pistonRightOn','pistonArmRight','','','','','',
    'railsRedstoneTorch','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('weak charge: destroy block', () => {
  const data = [
    '','','','','','','','',
    'grass','pistonRightOn','pistonArmRight','','','','','',
    'railsRedstoneTorch','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];
  const plane = new LevelPlane(data, 8, 6, null, "actionPlane");

  plane.setBlockAt(new Position(0, 1), new LevelBlock(''));

  const expected = [
    '','','','','','','','',
    '','pistonRight','','','','','','',
    'railsRedstoneTorch','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
  ];

  expect(plane._data.map(block => block.blockType)).toEqual(expected);

});

it('conduit activation/deactivation: placing and removing prismarine', () => {
  const data = [
    '',          '',          '',          '',          '',          '',
    '',          '',          'prismarine','prismarine','prismarine','',
    'prismarine','',          '',          '',          'prismarine','',
    'prismarine','',          'conduit',   '',          'prismarine','',
    'prismarine','',          '',          '',          'prismarine','',
    'prismarine','prismarine','prismarine','prismarine','prismarine','',
  ];
  const plane = new LevelPlane(data, 6, 6, null, "actionPlane");

  // Add prismarine to a valid activation index, but fail to complete the ring
  plane.setBlockAt(new Position(1, 1), new LevelBlock('prismarine'));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(false);

  // Add prismarine, so we have the right amount, but not in the proper configuration
  plane.setBlockAt(new Position(1, 0), new LevelBlock('prismarine'));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(false);

  // Complete the prismarine ring
  plane.setBlockAt(new Position(0, 1), new LevelBlock('prismarine'));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(true);

  // Disrupt ring of air around prismarine
  plane.setBlockAt(new Position(1, 2), new LevelBlock('prismarine'));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(false);

  // Reactivate by removing disruptive block
  plane.setBlockAt(new Position(1, 2), new LevelBlock(''));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(true);

  // Break ring of prismarine
  plane.setBlockAt(new Position(0, 1), new LevelBlock(''));
  expect(plane.getBlockAt(new Position(2, 3)).isActivatedConduit).toBe(false);

});
