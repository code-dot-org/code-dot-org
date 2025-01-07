import * as GoogleBlockly from 'blockly/core';

import {Themes} from '../constants';

import cdoTheme from './cdoTheme';

// Jigsaw levels feature a "ghost" block image. The font size here
// ensures that numbered blocks looks like the embedded .png file.
export default GoogleBlockly.Theme.defineTheme(Themes.JIGSAW, {
  base: cdoTheme,
  fontStyle: {
    size: 24,
  },
});
