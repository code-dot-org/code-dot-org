import {Workspace} from 'blockly/core';

import {GeneratedEffect} from '../types';

import {generatePreviewCode} from './generatePreviewCode';

// given a generated effect, returns the appropriate blockly preview code
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
