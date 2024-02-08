import {syntaxTree} from '@codemirror/language';
import {linter, Diagnostic} from '@codemirror/lint';
//import stylelint from 'stylelint-bundle';

const cssRuleset = {
  rules: {
    'color-no-invalid-hex': true,
  },
};

export const cssLinter = linter(async view => {
  console.log('linting?');
  const diagnostics: Diagnostic[] = [];
  syntaxTree(view.state)
    .cursor()
    .iterate(node => {
      console.log({node});
    });
  //const linterResult = CSSLint.verify(view.state.doc.toString());
  // const linterResult = stylelint.lint({
  //   code: view.state.doc.toString(),
  //   config: cssRuleset,
  //   fix: false,
  // });
  // console.log({linterResult});
  console.log('linting done?');
  return diagnostics;
});
