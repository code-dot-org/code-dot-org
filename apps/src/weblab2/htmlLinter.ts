import {linter, Diagnostic} from '@codemirror/lint';
import {HTMLHint} from 'htmlhint';
import {Ruleset} from 'htmlhint/types';

// Note: this is the default ruleset, copied here to make it easier to make
// updates.
const htmlRuleset: Ruleset = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': true,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true,
  'title-require': true,
};

export const htmlLinter = linter(view => {
  const errors = HTMLHint.verify(view.state.doc.toString(), htmlRuleset);
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
  return diagnostics;
});
