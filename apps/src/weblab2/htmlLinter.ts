import {linter, Diagnostic} from '@codemirror/lint';
import {HTMLHint} from 'htmlhint';
import {Ruleset} from 'htmlhint/types';

// This is a minimal rulset primarily used to provide feedback to students & teachers
// in the Web Lab 2-based Web Development unit which previously used Bramble and slowparse
// Additional rules can be added as needed, see: https://github.com/code-dot-org/code-dot-org/pull/73857
const htmlRuleset: Ruleset = {
  'attr-value-double-quotes': true,
  'spec-char-escape': true,
  'tag-pair': true,
};

export const getHtmlLintDiagnostics = (source: string): Diagnostic[] => {
  const errors = HTMLHint.verify(source, htmlRuleset);
  const diagnostics: Diagnostic[] = [];
  const docLines = source.split('\n');
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
};

export const htmlLinter = linter(view => {
  return getHtmlLintDiagnostics(view.state.doc.toString());
});
