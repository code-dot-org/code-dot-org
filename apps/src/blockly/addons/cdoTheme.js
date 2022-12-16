import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import DeuteranopiaTheme from '@blockly/theme-deuteranopia';
import HighContrastTheme from '@blockly/theme-highcontrast';
import TritanopiaTheme from '@blockly/theme-tritanopia';

// Intentionally override definition from core Blockly
const coreBlocklyOverrides = {
  colour_blocks: {
    colourPrimary: '#0093c9'
  },
  loop_blocks: {
    colourPrimary: '#f218a2'
  },
  procedure_blocks: {
    colourPrimary: '#509918'
  }
};

const cdoCustomStyles = {
  default: {
    colourPrimary: '#00b0bc'
  },
  behavior_blocks: {
    colourPrimary: '#20cc4e'
  },
  dance_blocks: {
    colourPrimary: '#7435b2'
  },
  event_blocks: {
    colourPrimary: '#00bc3e'
  },
  music_blocks: {
    colourPrimary: '#5b67a5'
  },
  sprite_blocks: {
    colourPrimary: '#b2353f'
  },
  setup_blocks: {
    colourPrimary: '#fca400'
  },
  world_blocks: {
    colourPrimary: '#5b5ba5'
  }
};

// takes a hex rgb value such as '#5b67a5' and darkens the color by decreasing
// each color channel by 25%, e.g., to '#454e7c'
const convertToHighContrast = hexColor => {
  const red = darkenValue(hexColor.substring(1, 3));
  const green = darkenValue(hexColor.substring(3, 5));
  const blue = darkenValue(hexColor.substring(5, 7));
  return `#${red}${green}${blue}`;
};

// decreases a 2-digit hex value to 75% of its value
const darkenValue = hexValue => {
  const dec = Math.round(parseInt(hexValue, 16) * 0.75);
  let darkenHexValue = dec.toString(16);
  let len = darkenHexValue.length;
  for (let i = 0; i < 2 - len; i++) {
    darkenHexValue = '0' + darkenHexValue;
  }
  return darkenHexValue;
};

const getCdoHighContrastStylesObject = obj => {
  let highConstrastObj = {};
  Object.keys(obj).forEach(key => {
    highConstrastObj[key] = {
      colourPrimary: convertToHighContrast(obj[key].colourPrimary)
    };
  });
  return highConstrastObj;
};

const cdoHighContrastStyles = {
  ...HighContrastTheme.blockStyles,
  ...getCdoHighContrastStylesObject({
    ...coreBlocklyOverrides,
    ...cdoCustomStyles
  })
};

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

export const cdoBlockStyles = {
  ...coreBlocklyOverrides,
  ...cdoCustomStyles
};

export const CdoTheme = GoogleBlockly.Theme.defineTheme('modern', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: cdoBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});

export const CdoDarkTheme = GoogleBlockly.Theme.defineTheme('cdoDark', {
  base: DarkTheme,
  blockStyles: cdoBlockStyles
});

export const CdoHighContrastTheme = GoogleBlockly.Theme.defineTheme(
  'cdoHighContrast',
  {
    base: HighContrastTheme,
    blockStyles: cdoHighContrastStyles
  }
);

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
