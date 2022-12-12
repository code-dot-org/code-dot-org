import GoogleBlockly from 'blockly/core';

export default GoogleBlockly.Theme.defineTheme('modern', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: {
    colour_blocks: {
      colourPrimary: '#0093c9'
    },
    procedure_blocks: {
      colourPrimary: '#509918'
    },
    loop_blocks: {
      colourPrimary: '#f218a2'
    }
  },
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
