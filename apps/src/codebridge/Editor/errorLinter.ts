import {Diagnostic, linter} from '@codemirror/lint';

import {getStore} from '@cdo/apps/redux';

import {ErrorDetails, ProjectFile} from '../types';

export function getErrorLinter(file: ProjectFile) {
  return linter(() => {
    const currentErrors: ErrorDetails[] =
      getStore().getState().codebridgeEditor.codeErrors;
    // todo: filter errors by file
    const diagnostics: Diagnostic[] = [];

    currentErrors.map(error => {
      diagnostics.push({
        from: error.lineNumber,
        to: error.lineNumber,
        message: error.message,
        severity: 'error',
      });
    });
    return diagnostics;
  });
}
