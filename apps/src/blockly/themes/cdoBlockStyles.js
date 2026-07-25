// IMPORTANT! Whenever updating the styles in this file, be sure to also update
// the styles in ./cdoAccessibleStyle.js as well. The accessible styles can be generated
// using accessibleStylesGenerator.mjs.
// From this directory in your terminal, enter:
// - yarn add nearest-color
// - node accessibleStylesGenerator.mjs
// - yarn remove nearest-color
// Copy the values output by the script into cdoAccessibleStyles and commit both changes together.
//
// EXCEPTION: setup_blocks matches the lab Run button (Primary Orange,
// --background-run-primary in component-library-styles/labRunButton.css),
// and the Run button mirrors the ACTIVE theme's setup_blocks at runtime
// (utils/setupBlockColor.ts). The accessible palettes keep their own setup
// colors on purpose (cdoAccessibleStyles.js #FF4235, cdoHighContrast.js
// #996300). The generator remaps every style by nearest color, so never
// regenerate on account of setup_blocks; after regenerating for any other
// style, restore the accessible setup_blocks values.

// These block styles are used in 4 or more of our Blockly labs.
const commonBlockStyles = {
  default: {
    colourPrimary: '#00b0bc',
  },
  setup_blocks: {
    // Primary Orange; keep equal to --background-run-primary (see header).
    colourPrimary: '#f46800',
  },
  event_blocks: {
    colourPrimary: '#00bc3e',
  },
  loop_blocks: {
    colourPrimary: '#f218a2',
  },
  logic_blocks: {
    colourPrimary: '#0094ca',
  },
  procedure_blocks: {
    colourPrimary: '#509918',
  },
  variable_blocks: {
    colourPrimary: '#a55b99', // Blockly default style
    // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
    // so this only ever applies to argument_reporter blocks.
    colourSecondary: '#a55b99',
  },
  math_blocks: {
    colourPrimary: '#5b67a5', // Blockly default style
  },
  text_blocks: {
    colourPrimary: '#5ba58c', // Blockly default style
  },
  colour_blocks: {
    colourPrimary: '#0093c9',
  },
};

// Styles created for specific labs, such as Music, Dance, and Sprite Labs.
const labBlockStyles = {
  sprite_blocks: {
    // Used in Sprite Lab, Dance, Poetry
    colourPrimary: '#b2353f',
  },
  world_blocks: {
    // Used in Sprite Lab, Dance, Poetry
    colourPrimary: '#5b5ba5',
  },
  behavior_blocks: {
    // Used in Sprite Lab, Dance
    colourPrimary: '#20cc4e',
  },
  location_blocks: {
    // Used in Sprite Lab only
    colourPrimary: '#ead446',
  },
  lab_blocks: {
    // Formerly called dance_blocks, music_blocks
    colourPrimary: '#7435b2',
  },
};

// The order of the properties in this object is intentional
// as it gives priority to our most-used block styles when
// remapping to nearest colors for our accessible themes.
const cdoBlockStyles = {
  ai_blocks: {
    // Used in Dance AI Edition
    colourPrimary: '#566065', // This color is consistent across all themes so will be matched with itself.
  },
  ...commonBlockStyles,
  ...labBlockStyles,
};

module.exports = cdoBlockStyles;
