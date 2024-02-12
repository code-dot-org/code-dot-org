import {linter, Diagnostic} from '@codemirror/lint';
import cssValidator from 'w3c-css-validator';

export const cssLinter = linter(async view => {
  const diagnostics: Diagnostic[] = [];
  const docLines = view.state.doc.toString().split('\n');
  const result = await cssValidator.validateText(view.state.doc.toString());
  result.errors.forEach(error => {
    let errorIndex = 0;
    for (let i = 0; i < error.line - 1; i++) {
      errorIndex += docLines[i].length + 1;
    }
    diagnostics.push({
      from: errorIndex,
      to: errorIndex + docLines[error.line - 1].length,
      severity: 'error',
      message: error.message,
    });
  });
  return diagnostics;
});
