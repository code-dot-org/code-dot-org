import {ConfigType} from '@cdoide/types';

import {DefaultEmptyEditor, BlankEmptyEditor} from '../DefaultEmptyEditors';

export const getEmptyEditor = (config: ConfigType) => {
  if (config.EmptyEditorComponent) {
    return config.EmptyEditorComponent;
  } else if (config.blankEmptyEditor) {
    return BlankEmptyEditor;
  } else {
    return DefaultEmptyEditor;
  }
};
