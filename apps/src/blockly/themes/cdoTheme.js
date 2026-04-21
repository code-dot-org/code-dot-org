import * as BlocklyCore from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

import cdoBlockStyles from './cdoBlockStyles.js';

export default BlocklyCore.Theme.defineTheme(Themes.MODERN, {
  base: BlocklyCore.Themes.Classic,
  blockStyles: cdoBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD',
  },
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['regular-font-weight'],
  },
  startHats: null,
});
