import GoogleBlockly from 'blockly/core';

export default GoogleBlockly.Theme.defineTheme('modern', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: {},
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
