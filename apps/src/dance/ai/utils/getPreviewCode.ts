import {Workspace} from 'blockly/core';

import {GeneratedEffect} from '../types';
import {generatePreviewCode} from './generatePreviewCode';

export const getPreviewCode = (
  currentGeneratedEffect?: GeneratedEffect
): string => {
  if (!currentGeneratedEffect) {
    return '';
  }

  const tempWorkspace = new Workspace();
  const previewCode = generatePreviewCode(
    tempWorkspace,
    currentGeneratedEffect
  );
  tempWorkspace.dispose();
  return previewCode;
};
