import cdoBlockStyles from './cdoBlockStyles.mjs';
import nearestColor from 'nearest-color';

// The colors here come Martin Krzywinski's 24-color palette for colorblindness:
// http://mkweb.bcgsc.ca/colorblind/palettes.mhtml#top
// http://mkweb.bcgsc.ca/colorblind/palettes/24.color.blindness.palette.txt
// The above list was filtered down to just those that provide adequate contrast with white text.

const themes = {
  PROTANOPIA: 'protanopia',
  DEUTERANOPIA: 'deuteranopia',
  TRITANOPIA: 'tritanopia',
};

const accessiblePalettes = {
  [themes.PROTANOPIA]: {
    color01Primary: '#460B70',
    color01Secondary: '#00306F',
    color02Primary: '#6B069F',
    color02Secondary: '#00489E',
    color03Primary: '#8E06CD',
    color03Secondary: '#005FCC',
    color04Primary: '#B40AFC',
    color04Secondary: '#0079FA',
    color05Primary: '#ED0DFD',
    color06Primary: '#5A0A33',
    color07Primary: '#810D49',
    color08Primary: '#AB0D61',
    color09Primary: '#D80D7B',
    color10Primary: '#FF2E95',
    color11Primary: '#5F0914',
    color11Secondary: '#004002',
    color12Primary: '#86081C',
    color12Secondary: '#005A01',
    color13Primary: '#B20725',
    color13Secondary: '#007702',
    color14Primary: '#DE0D2E',
    color14Secondary: '#009503',
    color15Primary: '#FF4235',
    color16Primary: '#003D30',
    color17Primary: '#005745',
    color18Primary: '#00735C',
    color19Primary: '#009175',
    color20Primary: '#566065',
  },
  [themes.DEUTERANOPIA]: {
    color01Primary: '#460B70',
    color01Secondary: '#00306F',
    color02Primary: '#6B069F',
    color02Secondary: '#00489E',
    color03Primary: '#8E06CD',
    color03Secondary: '#005FCC',
    color04Primary: '#B40AFC',
    color04Secondary: '#0079FA',
    color05Primary: '#ED0DFD',
    color06Primary: '#5F0914',
    color06Secondary: '#004002',
    color07Primary: '#86081C',
    color07Secondary: '#005A01',
    color08Primary: '#B20725',
    color08Secondary: '#007702',
    color09Primary: '#DE0D2E',
    color09Secondary: '#009503',
    color10Primary: '#FF4235',
    color11Primary: '#5A0A33',
    color11Secondary: '#003D30',
    color12Primary: '#810D49',
    color12Secondary: '#005745',
    color13Primary: '#AB0D61',
    color13Secondary: '#00735C',
    color14Primary: '#D80D7B',
    color14Secondary: '#009175',
    color15Primary: '#FF2E95',
    color16Primary: '#566065',
  },
  [themes.TRITANOPIA]: {
    color01Primary: '#004002',
    color01Secondary: '#003D30',
    color01Tertiary: '#00306F',
    color02Primary: '#005A01',
    color02Secondary: '#005745',
    color02Tertiary: '#00489E',
    color03Primary: '#007702',
    color03Secondary: '#00735C',
    color03Tertiary: '#005FCC',
    color04Primary: '#009503',
    color04Secondary: '#009175',
    color05Primary: '#5F0914',
    color05Secondary: '#5A0A33',
    color06Primary: '#86081C',
    color06Secondary: '#810D49',
    color07Primary: '#B20725',
    color07Secondary: '#AB0D61',
    color08Primary: '#DE0D2E',
    color08Secondary: '#D80D7B',
    color09Primary: '#FF4235',
    color09Secondary: '#FF2E95',
    color10Primary: '#460B70',
    color11Primary: '#6B069F',
    color12Primary: '#8E06CD',
    color13Primary: '#B40AFC',
    color14Primary: '#ED0DFD',
    color15Primary: '#0079FA',
    color16Primary: '#566065',
  },
};

Object.values(themes).forEach(theme => {
  mapBlockStylesToPalette(
    {...JSON.parse(JSON.stringify(cdoBlockStyles))},
    theme
  );
});

function mapBlockStylesToPalette(blockStyles, theme) {
  const enoughColors =
    Object.keys(accessiblePalettes[theme]).length >=
    Object.keys(blockStyles).length;

  if (enoughColors) {
    // Each color in our standard palette is mapped to a new "nearest" color from the accesible palette.
    for (const [, value] of Object.entries(blockStyles)) {
      const nearestAvailableColor = nearestColor.from(
        accessiblePalettes[theme]
      );
      const newColor = nearestAvailableColor(value.colourPrimary);
      value.colourPrimary = newColor.value;
      const colorKey = newColor.name.substring(0, 7);
      // Remove the color (and any alternates) from the available palette so we don't assign it twice.
      delete accessiblePalettes[theme][`${colorKey}Primary`];
      delete accessiblePalettes[theme][`${colorKey}Secondary`];
      delete accessiblePalettes[theme][`${colorKey}Tertiary`];
    }
    console.log(`export const ${theme}BlockStyles = `, blockStyles);
  } else {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `The accessible palette includes ${
        Object.keys(accessiblePalettes[theme]).length
      } colors, but cdoBlockStyles includes ${
        Object.keys(blockStyles).length
      } primary styles. New values cannot be determined without duplicates.`
    );
  }
}

console.log(
  '\x1b[33m%s\x1b[0m',
  'Copy the above values into cdoAccessibleStyles.js.'
);

console.log(
  '\x1b[33m%s\x1b[0m',
  'After copying, enter:',
  'yarn remove nearest-color'
);
