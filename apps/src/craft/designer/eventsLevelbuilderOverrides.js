/**
 * @file Mapping to inject more properties into levelbuilder levels.
 * Keyed by "puzzle_number", which is the order of a given level in its script.
 */

module.exports = {
  1: {
    songs: ['vignette4-intro'],
  },
  2: {
    songs: ['vignette5-shortpiano'],
  },
  3: {
    songs: [
      'vignette5-shortpiano',
      'vignette4-intro'
    ],
  },
  4: {
    songs: [
      'vignette5-shortpiano',
      'vignette4-intro'
    ],
    songDelay: 4000,
    showMovementBanner: true,
  },
  5: {
    songs: [
      'vignette7-funky-chirps-short',
      'vignette4-intro',
    ],
  },
  6: {
    songs: [
      'vignette1',
      'vignette4-intro',
    ],
    songDelay: 4000,
  },
  7: {
    songs: [
      'vignette7-funky-chirps-short',
      'vignette4-intro',
      'vignette1',
    ],
  },
  8: {
    songs: [
      'vignette5-shortpiano',
      'vignette1',
      'vignette4-intro',
      'vignette2-quiet',
      'vignette3',
    ],
  },
  9: {
    songs: [
      'vignette5-shortpiano',
      'vignette7-funky-chirps-short',
      'vignette4-intro',
      'vignette1',
    ],

  },
  10: {
    songs: [
      'vignette4-intro',
      'vignette5-shortpiano',
      'vignette7-funky-chirps-short',
      'vignette2-quiet',
      'vignette3',
    ],
  },
};
