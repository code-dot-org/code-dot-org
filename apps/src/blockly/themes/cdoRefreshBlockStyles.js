// Each primary keeps the hue of its cdoBlockStyles counterpart, with OKLCH
// lightness set so white block text reads at 4.6:1 or better. Secondary is
// the lighter shadow-block fill; tertiary is the darker outline Zelos draws.
// Same keys as cdoBlockStyles.js; a key missing here falls back to it.
const cdoRefreshBlockStyles = {
  ai_blocks: {
    colourPrimary: '#566065',
    colourSecondary: '#7d878c',
    colourTertiary: '#3f484c',
  },
  default: {
    colourPrimary: '#0b828b',
    colourSecondary: '#40a7b0',
    colourTertiary: '#026269',
  },
  setup_blocks: {
    colourPrimary: '#a36903',
    colourSecondary: '#cc8c33',
    colourTertiary: '#7c5006',
  },
  event_blocks: {
    colourPrimary: '#11882f',
    colourSecondary: '#5ba963',
    colourTertiary: '#056620',
  },
  loop_blocks: {
    colourPrimary: '#bd4c89',
    colourSecondary: '#da7dab',
    colourTertiary: '#9c2c6b',
  },
  logic_blocks: {
    colourPrimary: '#027eac',
    colourSecondary: '#4da2cd',
    colourTertiary: '#055f83',
  },
  procedure_blocks: {
    colourPrimary: '#428506',
    colourSecondary: '#70a653',
    colourTertiary: '#316406',
  },
  variable_blocks: {
    colourPrimary: '#a55b99',
    // Matches primary, as in cdoBlockStyles: argument_reporter shadows.
    colourSecondary: '#a55b99',
    colourTertiary: '#853e7b',
  },
  math_blocks: {
    colourPrimary: '#6571b0',
    colourSecondary: '#8b97cc',
    colourTertiary: '#4a5491',
  },
  text_blocks: {
    colourPrimary: '#37826a',
    colourSecondary: '#6ba48f',
    colourTertiary: '#11654e',
  },
  colour_blocks: {
    colourPrimary: '#047eac',
    colourSecondary: '#4da2cd',
    colourTertiary: '#065f83',
  },
  sprite_blocks: {
    colourPrimary: '#c84a51',
    colourSecondary: '#e47c7d',
    colourTertiary: '#a52935',
  },
  world_blocks: {
    colourPrimary: '#6d6eb9',
    colourSecondary: '#9195d4',
    colourTertiary: '#515099',
  },
  behavior_blocks: {
    colourPrimary: '#0d8830',
    colourSecondary: '#5aa964',
    colourTertiary: '#026721',
  },
  location_blocks: {
    // Shifted toward amber; the same-hue yellow at this lightness is olive.
    colourPrimary: '#946800',
    colourSecondary: '#c08a2e',
    colourTertiary: '#704f00',
  },
  lab_blocks: {
    colourPrimary: '#8e5ec7',
    colourSecondary: '#ae8ae0',
    colourTertiary: '#713fa6',
  },
};

module.exports = cdoRefreshBlockStyles;
