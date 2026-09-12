const test = require('tape');

const LevelPlane = require('../../src/js/game/LevelMVC/LevelPlane');
const LevelBlock = require('../../src/js/game/LevelMVC/LevelBlock');
const FacingDirection = require('../../src/js/game/LevelMVC/FacingDirection');
const Position = require('../../src/js/game/LevelMVC/Position');

test('get blocks', t => {
  const data = [
    'grass', 'dirt', 'stone', 'sand',
    'water', 'lava', 'water', 'lava',
    'grass', 'dirt', 'stone', 'sand',
  ];
  const plane = new LevelPlane(data, 4, 3, null, "actionPlane");

  t.equal(plane.getBlockAt(new Position(0, 0)).blockType, 'grass');
  t.equal(plane.getBlockAt(new Position(2, 1)).blockType, 'water');
  t.equal(plane.getBlockAt(new Position(2, 2)).blockType, 'stone');
  t.equal(plane.getBlockAt(new Position(1, 0)).blockType, 'dirt');
  t.equal(plane.getBlockAt(new Position(-1, -1), undefined));
  t.equal(plane.getBlockAt(new Position(4, 1)), undefined);
  t.equal(plane.getBlockAt(new Position(2, 3)), undefined);

  t.deepEqual(plane.getOrthogonalBlocks(new Position(1, 1)), {
    north: {block: new LevelBlock('dirt'), relative: FacingDirection.South},
    south: {block: new LevelBlock('dirt'), relative: FacingDirection.North},
    east: {block: new LevelBlock('water'), relative: FacingDirection.West},
    west: {block: new LevelBlock('water'), relative: FacingDirection.East},
  });

  t.deepEqual(plane.getOrthogonalBlocks(new Position(2, 0)), {
    north: {block: undefined, relative: FacingDirection.South},
    south: {block: new LevelBlock('water'), relative: FacingDirection.North},
    east: {block: new LevelBlock('sand'), relative: FacingDirection.West},
    west: {block: new LevelBlock('dirt'), relative: FacingDirection.East},
  });

  t.deepEqual(plane.getOrthogonalBlocks(new Position(2, 3)), {
    north: {block: new LevelBlock('stone'), relative: FacingDirection.South},
    south: {block: undefined, relative: FacingDirection.North},
    east: {block: undefined, relative: FacingDirection.West},
    west: {block: undefined, relative: FacingDirection.East},
  });

  t.end();
});

//   0 1 2 3 4 5
// 0 *   ┌───┐
// 1   ┌─┤   │
// 2 ──┼─┴──   │
// 3   │     ──┘
test('redstone wires', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Before:              After:
// ║   ║     ║          ║ ╔══     ║
//   ║         ║          ║       ╔══
//           ║                    ║
//   ║       ║            ║       ║
// ║   ║   ║            ║ ╚══   ══╗
//           ║                    ║
//
test('rail connections: T-junctions', t => {
  const data = [
    'rails',  '',       'rails',  '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       '',       'rails',
    '',       '',       '',       '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       'rails',  '',
    'rails',  '',       'rails',  '',       'rails',  '',       '',
    '',       '',       '',       '',       '',       'rails',  '',
  ];
  const plane = new LevelPlane(data, 7, 6, null, "actionPlane");

  t.equal(plane.setBlockAt(new Position(1, 0), new LevelBlock('rails')).blockType, 'railsSouthEast');
  t.equal(plane.setBlockAt(new Position(5, 1), new LevelBlock('rails')).blockType, 'railsSouthEast');
  t.equal(plane.setBlockAt(new Position(1, 4), new LevelBlock('rails')).blockType, 'railsNorthEast');
  t.equal(plane.setBlockAt(new Position(5, 4), new LevelBlock('rails')).blockType, 'railsSouthWest');

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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Before:              After:
// ║   ║     ║          ═════     ║
//   ║         ║          ║       ═══
//           ║                    ║
//   ║       ║            ║       ║
// ║   ║   ║            ═════   ═══
//           ║                    ║
//
test('rail connections: unpowered T-junctions', t => {
  const data = [
    'rails',  '',       'rails',  '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       '',       'rails',
    '',       '',       '',       '',       '',       'rails',  '',
    '',       'rails',  '',       '',       '',       'rails',  '',
    'rails',  '',       'rails',  '',       'rails',  '',       '',
    '',       '',       '',       '',       '',       'rails',  '',
  ];
  const plane = new LevelPlane(data, 7, 6, null, "actionPlane");

  t.equal(plane.setBlockAt(new Position(1, 0), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');
  t.equal(plane.setBlockAt(new Position(5, 1), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');
  t.equal(plane.setBlockAt(new Position(1, 4), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');
  t.equal(plane.setBlockAt(new Position(5, 4), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');

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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Place four tracks in a circle.
// 1:      2:     3:     4:
//   ║     ═══    ╔══    ╔═╗
//                ║      ╚═╝
//
test('rail connections: 2x2 loop', t => {
  const data = new Array(4).fill('');
  const plane = new LevelPlane(data, 2, 2, null, "actionPlane");

  t.equal(plane.setBlockAt(new Position(1, 0), new LevelBlock('rails')).blockType, 'rails');
  t.equal(plane.setBlockAt(new Position(0, 0), new LevelBlock('rails')).blockType, 'railsEast');
  t.equal(plane.setBlockAt(new Position(0, 1), new LevelBlock('rails')).blockType, 'railsNorth');
  t.equal(plane.setBlockAt(new Position(1, 1), new LevelBlock('rails')).blockType, 'railsNorthWest');

  const expected = [
    'railsSouthEast', 'railsSouthWest',
    'railsNorthEast', 'railsNorthWest',
  ];

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Place a longer minecart track.
// Order:       Track:
//  1 3         ══╗
//    2 A B       ║ ╔══
//    4 9 8       ║ ╚═╗
//    5 6 7       ╚═══╝
test('rail connections: longer track', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Destroying part of a track should leave T-junctions intact. Don't heal the
// curved track into a straight segment.
//
// Before:   After:
//    ║         ║
// X══╗        ═╗
//    ║         ║
test('rail connections: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

// Placing track after a previously-destroyed T-junction should heal it
//
// Before:   After:
//              ║
//   ═╗         ║
//    ║         ║
test('rail connections: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  plane.setBlockAt(new Position(1, 0), new LevelBlock('rails'));

  expected = [
    '', 'railsSouth','',
    '', 'railsNorthSouth', '',
    '', 'railsNorth','',
  ];

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T        T║
//              ║
//           X  ║
test('redstone charge: place block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('powered rails: vertical charge propagation', t => {
  const data = [
    '', 'railsRedstoneTorch',       '',
    '', 'railsUnpoweredSouth', '',
    '', 'railsUnpoweredNorth', '',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.refreshRedstone();
  t.equal(plane.getBlockAt(new Position(1, 1)).blockType, "railsPoweredSouth");
  t.equal(plane.getBlockAt(new Position(1, 2)).blockType, "railsPoweredNorth");

  t.end();
});

test('powered rails: horizontal charge propagation', t => {
  const data = [
    '', '', '',
    'railsRedstoneTorch', 'railsUnpoweredEast', 'railsUnpoweredWest',
    '', '', '',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.refreshRedstone();
  t.equal(plane.getBlockAt(new Position(1, 1)).blockType, "railsPoweredEast");
  t.equal(plane.getBlockAt(new Position(2, 1)).blockType, "railsPoweredWest");

  t.end();
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
test('powered rails: only propagate along straight lines', t => {
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

  t.equal(plane.setBlockAt(new Position(2, 1), new LevelBlock('railsUnpowered')).blockType, 'railsPoweredEastWest');
  t.equal(plane.setBlockAt(new Position(2, 5), new LevelBlock('railsUnpowered')).blockType, 'railsPoweredEastWest');
  t.equal(plane.setBlockAt(new Position(6, 2), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');
  t.equal(plane.setBlockAt(new Position(6, 5), new LevelBlock('railsUnpowered')).blockType, 'railsUnpoweredEastWest');

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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T║       T
//     ║        ║
//  X  ║     X  ║
test('redstone charge: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
//    T║        ║
//     ║        ║
//  X  ║     X  ║
test('torch charge: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

//Placing/destroying redstoneWire should update charge propagation throughout
//a line of wire connected to a redstone torch
// Before:   After:
// X   ║     X  T║
//     ║         ║
//     ║         ║
test('torch charge: place block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('iron door open: place block', t => {
  const data = [
    'redstoneWireVertical','',      '',
    'redstoneWireVertical','',      '',
    'doorIron',            '',      'doorIron',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(1, 0), new LevelBlock('railsRedstoneTorch'));

  t.false(plane.getBlockAt(new Position(2, 2)).isOpen);
  t.true(plane.getBlockAt(new Position(0, 2)).isOpen);

  t.end();
});

test('iron door close: destroy block', t => {
  const data = [
    'railsRedstoneTorch',    '','',
    'redstoneWireVerticalOn','','',
    'doorIron',              '','doorIron',
  ];
  const plane = new LevelPlane(data, 3, 3, null, "actionPlane");

  plane.setBlockAt(new Position(0, 0), new LevelBlock(''));

  t.false(plane.getBlockAt(new Position(2, 2)).isOpen);
  t.false(plane.getBlockAt(new Position(1, 2)).isOpen);

  t.end();
});

test('piston activate: place block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston deactivate: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('sticky piston activate: place block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('sticky piston deactivate: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy torch: adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy torch: not adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy door: adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy door: not adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy pressure Plate: adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy door: not adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy redstoneWire: adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston destroy redstoneWire: not adjacent to piston', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('piston directional power: torch at arm side', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('sticky piston directional power: torch at arm side', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('certain objets arent weakly charged', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('Sticky piston grabbing, do not pull', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('Sticky piston grabbing, do pull', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('Weak Charge: placeblock', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('weak charge: destroy block', t => {
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

  t.deepEqual(plane._data.map(block => block.blockType), expected);

  t.end();
});

test('conduit activation/deactivation: placing and removing prismarine', t => {
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
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, false);

  // Add prismarine, so we have the right amount, but not in the proper configuration
  plane.setBlockAt(new Position(1, 0), new LevelBlock('prismarine'));
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, false);

  // Complete the prismarine ring
  plane.setBlockAt(new Position(0, 1), new LevelBlock('prismarine'));
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, true);

  // Disrupt ring of air around prismarine
  plane.setBlockAt(new Position(1, 2), new LevelBlock('prismarine'));
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, false);

  // Reactivate by removing disruptive block
  plane.setBlockAt(new Position(1, 2), new LevelBlock(''));
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, true);

  // Break ring of prismarine
  plane.setBlockAt(new Position(0, 1), new LevelBlock(''));
  t.deepEqual(plane.getBlockAt(new Position(2, 3)).isActivatedConduit, false);

  t.end();
});
