import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import DeuteranopiaTheme from '@blockly/theme-deuteranopia';
import HighContrastTheme from '@blockly/theme-highcontrast';
import TritanopiaTheme from '@blockly/theme-tritanopia';

const coreBlocklyOverrides = {
  colour_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#0093c9'
  },
  loop_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#f218a2'
  },
  procedure_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#509918'
  }
};
const cdoCustomStyles = {
  default: {
    colourPrimary: '00b0bc'
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

const cdoHighContrastStyles = {
  ...HighContrastTheme.blockStyles,
  colour_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#00b0bc'
  },
  loop_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#B6127A'
  },
  procedure_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#3C7312'
  },
  default: {
    colourPrimary: '00848D'
  },
  behavior_blocks: {
    colourPrimary: '#18993B'
  },
  dance_blocks: {
    colourPrimary: '#572886'
  },
  event_blocks: {
    colourPrimary: '#008D2F'
  },
  music_blocks: {
    colourPrimary: '#454E7C'
  },
  sprite_blocks: {
    colourPrimary: '#862830'
  },
  setup_blocks: {
    colourPrimary: '#BD7B00'
  },
  world_blocks: {
    colourPrimary: '#45457C'
  }
};

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
    blockStyles: {...DeuteranopiaTheme.blockStyles, ...cdoCustomStyles}
  }
);

export const CdoTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoTritanopia',
  {
    base: TritanopiaTheme,
    blockStyles: {...TritanopiaTheme.blockStyles, ...cdoCustomStyles}
  }
);
