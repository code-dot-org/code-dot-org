import * as GoogleBlockly from 'blockly/core';

import {Themes} from '../constants';

import cdoTheme from './cdoTheme';

export default GoogleBlockly.Theme.defineTheme(Themes.JIGSAW, {
  base: cdoTheme,
  fontStyle: {
    size: 24,
  },
});
