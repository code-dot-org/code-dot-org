/*jshint multistr: true */
/* global $ */

/**
 * @file Mapping to inject more properties into levelbuilder levels.
 * Keyed by "puzzle_number", which is the order of a given level in its script.
 */

var utils = require('../utils');

module.exports = {
  1: {
    appSpecificFailError: "You need to use commands to walk to the sheep.",
    tooFewBlocksMsg: "Try using more commands to walk to the sheep.",
    songs: ['vignette4-intro'],
  },
  2: {
    appSpecificFailError: "To chop down a tree, walk to its trunk and use the \"destroy block\" command.",
    tooFewBlocksMsg: "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command.",
    songs: ['vignette5-shortpiano'],
  },
  3: {
    appSpecificFailError: "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep.",
    tooFewBlocksMsg: "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command.",
    songs: [
      'vignette2-quiet',
      'vignette5-shortpiano',
      'vignette4-intro'
    ],
  },
  4: {
    appSpecificFailError: "You must use the \"destroy block\" command on each of the three tree trunks.",
    tooFewBlocksMsg: "You must use the \"destroy block\" command on each of the three tree trunks.",
    songs: [
      'vignette3',
      'vignette2-quiet',
      'vignette5-shortpiano',
      'vignette4-intro'
    ],
    songDelay: 4000,
  },
  5: {
    appSpecificFailError: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\".",
    tooFewBlocksMsg: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\".",
    songs: [
      'vignette7-funky-chirps-short',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette3',
    ],
  },
  6: {
    appSpecificFailError: "Place blocks on the dirt outline of the house to complete the puzzle.",
    tooFewBlocksMsg: "Place blocks on the dirt outline of the house to complete the puzzle.",
    songs: [
      'vignette1',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette3',
    ],
    songDelay: 4000,
  },
  7: {
    appSpecificFailError: "Use the \"plant\" command to place crops on each patch of dark tilled soil.",
    tooFewBlocksMsg: "Use the \"plant\" command to place crops on each patch of dark tilled soil.",
    songs: [
      'vignette2-quiet',
      'vignette7-funky-chirps-short',
      'vignette4-intro',
      'vignette1',
      'vignette3',
    ],
  },
  8: {
    appSpecificFailError: "If you touch a creeper it will explode. Sneak around them and enter your house.",
    tooFewBlocksMsg: "If you touch a creeper it will explode. Sneak around them and enter your house.",
    songs: [
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette1',
      'vignette4-intro',
      'vignette3',
    ],
  },
  9: {
    appSpecificFailError: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal.",
    tooFewBlocksMsg: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal.",
    songs: [
      'vignette3',
      'vignette5-shortpiano',
      'vignette7-funky-chirps-short',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1',
    ],

  },
  10: {
    appSpecificFailError: "Cover up the lava to walk across, then mine two of the iron blocks on the other side.",
    tooFewBlocksMsg: "Cover up the lava to walk across, then mine two of the iron blocks on the other side.",
    songs: [
      'vignette4-intro',
      'vignette3',
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette7-funky-chirps-short',
    ],
  },
  11: {
    appSpecificFailError: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources.",
    tooFewBlocksMsg: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources.",
    songs: [
      'vignette7-funky-chirps-short',
      'vignette3',
      'vignette2-quiet',
    ],
  },
  12: {
    appSpecificFailError: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava.",
    tooFewBlocksMsg: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava.",
    songs: [
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1',
    ],
  },
  13: {
    appSpecificFailError: "Place \"rail\" along the dirt path leading from your door to the edge of the map.",
    tooFewBlocksMsg: "Place \"rail\" along the dirt path leading from your door to the edge of the map.",
    songs: [
      'vignette1',
      'vignette3',
      'vignette2-quiet',
      'vignette4-intro',
    ],
  },
  14: {
    songs: [
      'vignette8-free-play',
      'vignette3',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1',
    ],
  },
};
