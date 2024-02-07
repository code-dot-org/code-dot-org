import {linter, Diagnostic} from '@codemirror/lint';
import {HTMLHint} from 'htmlhint';

export const htmlLinter = linter(view => {
  console.log('linting!');
  console.log({doc: view.state.doc.toString()});
  const errors = HTMLHint.verify(view.state.doc.toString());
  console.log({errors});
  const diagnostics: Diagnostic[] = [];
  console.log('done linting!');
  return diagnostics;
});
