import cdoBlockStyles from './cdoBlockStyles.mjs';
import nearestColor from 'nearest-color';

if (!nearestColor) {
  console.log('Try: yarn add nearest-color');
}

// These are the core Blockly styles that we have historically never overridden.
const coreBlocklyStyles = {
  list_blocks: {
    colourPrimary: '#745ba5'
  },
  logic_blocks: {
    colourPrimary: '#5b80a5'
  },
  math_blocks: {
    colourPrimary: '#5b67a5'
  },
  text_blocks: {
    colourPrimary: '#5ba58c'
  },
  variable_blocks: {
    colourPrimary: '#a55b99'
  }
};

const blockStyles = {
  ...coreBlocklyStyles,
  ...JSON.parse(JSON.stringify(cdoBlockStyles))
};

var accessiblePalette = {
  // The colors here come Martin Krzywinski's 24-color palette for colorblindness:
  // http://mkweb.bcgsc.ca/colorblind/palettes.mhtml#top
  // http://mkweb.bcgsc.ca/colorblind/palettes/24.color.blindness.palette.txt
  // The above list was filtered down to just those that provide adequate contrast with white text.
  color_003D30: '#003D30',
  color_5A0A33: '#5A0A33',
  color_005745: '#005745',
  color_810D49: '#810D49',
  color_00735C: '#00735C',
  color_AB0D61: '#AB0D61',
  color_009175: '#009175',
  color_D80D7B: '#D80D7B',
  color_FF2E95: '#FF2E95',
  color_00306F: '#00306F',
  color_460B70: '#460B70',
  color_00489E: '#00489E',
  color_6B069F: '#6B069F',
  color_005FCC: '#005FCC',
  color_8E06CD: '#8E06CD',
  color_0079FA: '#0079FA',
  color_B40AFC: '#B40AFC',
  color_ED0DFD: '#ED0DFD',
  color_004002: '#004002',
  color_5F0914: '#5F0914',
  color_005A01: '#005A01',
  color_86081C: '#86081C',
  color_007702: '#007702',
  color_B20725: '#B20725',
  color_009503: '#009503',
  color_DE0D2E: '#DE0D2E',
  color_FF4235: '#FF4235'
};

console.log(
  '\x1b[33m%s\x1b[0m',
  'Copy the following values into cdoAccessible.js:'
);

// Each color in our standard palette is mapped to a new "nearest" color from the accesible palette.
for (const [, value] of Object.entries(blockStyles)) {
  const nearestAvailableColor = nearestColor.from(accessiblePalette);
  value.colourPrimary = nearestAvailableColor(value.colourPrimary).value;
  // Remove the color from the available palette so we don't assign it twice.
  delete accessiblePalette['color_' + value.colourPrimary.slice(1)];
}

console.log(blockStyles);
console.log(
  '\x1b[33m%s\x1b[0m',
  'After copying, enter:',
  'yarn remove nearest-color'
);
