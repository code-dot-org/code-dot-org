import {linter, Diagnostic} from '@codemirror/lint';
import {HTMLHint} from 'htmlhint';

export const htmlLinter = linter(view => {
  const errors = HTMLHint.verify(view.state.doc.toString());
  const diagnostics: Diagnostic[] = [];
  const docLines = view.state.doc.toString().split('\n');
  errors.forEach(error => {
    let errorIndex = 0;
    for (let i = 0; i < error.line - 1; i++) {
      errorIndex += docLines[i].length + 1;
    }
    errorIndex += error.col - 1;
    diagnostics.push({
      from: errorIndex,
      to: errorIndex,
      severity: error.type,
      message: error.message,
    });
  });
  console.log('done linting!');
  return diagnostics;
});
