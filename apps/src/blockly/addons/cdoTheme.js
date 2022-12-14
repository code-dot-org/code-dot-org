import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import DeuteranopiaTheme from '@blockly/theme-deuteranopia';
import HighContrastTheme from '@blockly/theme-highcontrast';
import TritanopiaTheme from '@blockly/theme-tritanopia';

export const cdoBlockStyles = {
  default: {
    colourPrimary: '00b0bc'
  },
  colour_blocks: {
    // Duplicates definition from core Blockly
    colourPrimary: '#0093c9'
  },
  logic_blocks: {
    // Duplicates definition from core Blockly
    colourPrimary: '#5d80a3'
  },
  loop_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#f218a2'
  },
  math_blocks: {
    // Duplicates definition from core Blockly
    colourPrimary: '#77669e'
  },
  procedure_blocks: {
    // Intentionally overrides definition from core Blockly
    colourPrimary: '#509918'
  },
  text_blocks: {
    // Duplicates definition from core Blockly
    colourPrimary: '#5ba58c'
  },
  variable_blocks: {
    // Duplicates definition from core Blockly
    colourPrimary: '#9e6b93'
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
    blockStyles: cdoBlockStyles
  }
);

export const CdoDeuteranopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoDeuteronopia',
  {
    base: DeuteranopiaTheme
  }
);

export const CdoTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoTritanopia',
  {
    base: TritanopiaTheme
  }
);
