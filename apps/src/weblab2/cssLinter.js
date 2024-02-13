import {linter} from '@codemirror/lint';
//import cssValidator from 'w3c-css-validator';
//import stylelint from 'stylelint-bundle';

export const cssLinter = linter(async view => {
  const diagnostics = [];
  console.log('linting?');

  //await import('stylelint-bundle');
  //const docLines = view.state.doc.toString().split('\n');
  // console.log(`stylelint: ${stylelint}`);
  // console.log({stylelint});
  // console.log({lintMethod: stylelint.lint});
  const {errored, results} = await stylelint.lint({
    code: view.state.doc.toString(),
    config: {
      customSyntax: 'sugarss',
      rules: {
        /*...*/
      },
      formatter: () => {},
    },
  });
  console.log({errored, results});
  console.log('done');
  // const result = await cssValidator.validateText(view.state.doc.toString());
  // result.errors.forEach(error => {
  //   let errorIndex = 0;
  //   for (let i = 0; i < error.line - 1; i++) {
  //     errorIndex += docLines[i].length + 1;
  //   }
  //   diagnostics.push({
  //     from: errorIndex,
  //     to: errorIndex + docLines[error.line - 1].length,
  //     severity: 'error',
  //     message: error.message,
  //   });
  // });
  return diagnostics;
});
