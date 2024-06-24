import {ConfigType} from '@codebridge/types';

import {DefaultEmptyEditor, BlankEmptyEditor} from '../DefaultEmptyEditors';

export const getEmptyEditor = (config: ConfigType) => {
  if (config.blankEmptyEditor) {
    return BlankEmptyEditor;
  } else {
    return DefaultEmptyEditor;
  }
};
