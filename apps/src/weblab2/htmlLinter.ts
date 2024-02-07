import {linter, Diagnostic} from '@codemirror/lint';

export const htmlLinter = linter(view => {
  console.log('linting!');
  console.log({doc: view.state.doc.toString()});
  const diagnostics: Diagnostic[] = [];
  console.log('done linting!');
  return diagnostics;
});
