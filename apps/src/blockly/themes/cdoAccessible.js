import GoogleBlockly from 'blockly/core';

// IMPORTANT! Whenever updating ./cdoBlockStyles.mjs, be sure to also update
// the styles here as well. The accessible styles can be generated using
// accessibleColors.mjs.
// From this directory in your terminal, enter:
// - yarn add nearest-color
// - node accessibleColors.mjs
// - yarn remove nearest-color

// Copy the values output by the script below.
const accessibleColors = {
  list_blocks: {colourPrimary: '#6B069F'},
  logic_blocks: {colourPrimary: '#009175'},
  math_blocks: {colourPrimary: '#00489E'},
  text_blocks: {colourPrimary: '#00735C'},
  variable_blocks: {colourPrimary: '#AB0D61'},
  colour_blocks: {colourPrimary: '#005FCC'},
  loop_blocks: {colourPrimary: '#FF2E95'},
  procedure_blocks: {colourPrimary: '#009503'},
  default: {colourPrimary: '#0079FA'},
  comment_blocks: {colourPrimary: '#8E06CD'},
  event_blocks: {colourPrimary: '#007702'},
  setup_blocks: {colourPrimary: '#FF4235'},
  world_blocks: {colourPrimary: '#460B70'},
  behavior_blocks: {colourPrimary: '#005745'},
  location_blocks: {colourPrimary: '#DE0D2E'},
  sprite_blocks: {colourPrimary: '#B20725'},
  dance_blocks: {colourPrimary: '#B40AFC'},
  flow_blocks: {colourPrimary: '#00306F'},
  music_blocks: {colourPrimary: '#810D49'}
};

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
