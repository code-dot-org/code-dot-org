import GoogleBlockly from 'blockly/core';

export default GoogleBlockly.Theme.defineTheme('modern', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: {
    colour_blocks: {
      colourPrimary: '#0093c9'
    }
  },
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD',
    workspaceBackgroundColour: '#222222'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
