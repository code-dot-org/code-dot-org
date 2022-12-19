import GoogleBlockly from 'blockly/core';
import DeuteranopiaTheme from '@blockly/theme-deuteranopia';
import TritanopiaTheme from '@blockly/theme-tritanopia';

// styles for color vision deficiency themes
const CVDStyles = {
  // colors chosen from 15-color or 24-color palette for colorblindness at http://mkweb.bcgsc.ca/colorblind/palettes.mhtml#15-color-palette-for-colorbliness
  default: {
    colourPrimary: '00DCB5' // aquamarine
  },
  behavior_blocks: {
    colourPrimary: '#00E307' // radioactive green
  },
  dance_blocks: {
    colourPrimary: '#9400E6' // veronica
  },
  event_blocks: {
    colourPrimary: '#008169' // deep sea
  },
  music_blocks: {
    colourPrimary: '#FFCFE2' // azalea
  },
  sprite_blocks: {
    colourPrimary: '#F60239' // tractor red
  },
  setup_blocks: {
    colourPrimary: 'FFAC3B' // frenzee
  },
  world_blocks: {
    colourPrimary: '#450270' // christalle
  }
};

const cdoDeuteranopiaStyles = {
  ...DeuteranopiaTheme.blockStyles,
  ...CVDStyles
};

const cdoTritanopiaStyles = {
  ...TritanopiaTheme.blockStyles,
  ...CVDStyles
};

export const CdoDeuteranopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoDeuteronopia',
  {
    base: DeuteranopiaTheme,
    blockStyles: cdoDeuteranopiaStyles
  }
);

export const CdoTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoTritanopia',
  {
    base: TritanopiaTheme,
    blockStyles: cdoTritanopiaStyles
  }
);
