/**
 * @file Mapping to inject more properties into levelbuilder levels.
 * Keyed by "puzzle_number", which is the order of a given level in its script.
 */

var i18n = require('../locale');

module.exports = {
  1: {
    appSpecificFailError: i18n.level1FailureMessage(),
    tooFewBlocksMsg: i18n.level1TooFewBlocksMessage(),
    songs: ['vignette4-intro']
  },
  2: {
    appSpecificFailError: i18n.level2FailureMessage(),
    tooFewBlocksMsg: i18n.level2TooFewBlocksMessage(),
    songs: ['vignette5-shortpiano']
  },
  3: {
    appSpecificFailError: i18n.level3FailureMessage(),
    tooFewBlocksMsg: i18n.level3TooFewBlocksMessage(),
    songs: ['vignette2-quiet', 'vignette5-shortpiano', 'vignette4-intro']
  },
  4: {
    appSpecificFailError: i18n.level4FailureMessage(),
    tooFewBlocksMsg: i18n.level4FailureMessage(),
    songs: [
      'vignette3',
      'vignette2-quiet',
      'vignette5-shortpiano',
      'vignette4-intro'
    ],
    songDelay: 4000
  },
  5: {
    appSpecificFailError: i18n.level5FailureMessage(),
    tooFewBlocksMsg: i18n.level5FailureMessage(),
    songs: [
      'vignette7-funky-chirps-short',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette3'
    ]
  },
  6: {
    appSpecificFailError: i18n.level6FailureMessage(),
    tooFewBlocksMsg: i18n.level6FailureMessage(),
    songs: ['vignette1', 'vignette2-quiet', 'vignette4-intro', 'vignette3'],
    songDelay: 4000
  },
  7: {
    appSpecificFailError: i18n.level7FailureMessage(),
    tooFewBlocksMsg: i18n.level7FailureMessage(),
    songs: [
      'vignette2-quiet',
      'vignette7-funky-chirps-short',
      'vignette4-intro',
      'vignette1',
      'vignette3'
    ]
  },
  8: {
    appSpecificFailError: i18n.level8FailureMessage(),
    tooFewBlocksMsg: i18n.level8FailureMessage(),
    songs: [
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette1',
      'vignette4-intro',
      'vignette3'
    ]
  },
  9: {
    appSpecificFailError: i18n.level9FailureMessage(),
    tooFewBlocksMsg: i18n.level9FailureMessage(),
    songs: [
      'vignette3',
      'vignette5-shortpiano',
      'vignette7-funky-chirps-short',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1'
    ]
  },
  10: {
    appSpecificFailError: i18n.level10FailureMessage(),
    tooFewBlocksMsg: i18n.level10FailureMessage(),
    songs: [
      'vignette4-intro',
      'vignette3',
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette7-funky-chirps-short'
    ]
  },
  11: {
    appSpecificFailError: i18n.level11FailureMessage(),
    tooFewBlocksMsg: i18n.level11FailureMessage(),
    songs: ['vignette7-funky-chirps-short', 'vignette3', 'vignette2-quiet']
  },
  12: {
    appSpecificFailError: i18n.level12FailureMessage(),
    tooFewBlocksMsg: i18n.level12FailureMessage(),
    songs: [
      'vignette5-shortpiano',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1'
    ]
  },
  13: {
    appSpecificFailError: i18n.level13FailureMessage(),
    tooFewBlocksMsg: i18n.level13FailureMessage(),
    songs: ['vignette1', 'vignette3', 'vignette2-quiet', 'vignette4-intro']
  },
  14: {
    songs: [
      'vignette8-free-play',
      'vignette3',
      'vignette2-quiet',
      'vignette4-intro',
      'vignette1'
    ]
  }
};
