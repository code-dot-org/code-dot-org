import GoogleBlockly from 'blockly/core';
import accessibleColors from './accessibleColors';

export default GoogleBlockly.Theme.defineTheme('cdoaccessible', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: accessibleColors,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
