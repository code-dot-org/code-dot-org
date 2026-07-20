import {linter, type Diagnostic} from '@codemirror/lint';
import type {Extension} from '@codemirror/state';
import js from '@eslint/js';
import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';
import {HTMLHint} from 'htmlhint';
import type {Ruleset} from 'htmlhint/types';

// Editor linting, keyed by language. Ported from the legacy Codebridge editor
// (apps/src/codebridge/Editor/Editor.tsx, which pushes these extensions per file
// extension) and apps/src/weblab2/htmlLinter.ts.
//
// CSS linting is deliberately absent: legacy's cssLinter is an unwired prototype
// that calls a `stylelint` global nothing provides, so there is nothing to port.

/**
 * The HTML rules. Deliberately small — this set came from the Web Development
 * unit's move off Bramble/slowparse, not from htmlhint's defaults, and flagging
 * more than students can act on is worse than flagging less.
 * See code-dot-org/code-dot-org#73857.
 */
const htmlRuleset: Ruleset = {
  'attr-value-double-quotes': true,
  'spec-char-escape': true,
  'tag-pair': true,
};

/** HTMLHint findings as CodeMirror diagnostics. Exported for testing. */
export const getHtmlLintDiagnostics = (source: string): Diagnostic[] => {
  const errors = HTMLHint.verify(source, htmlRuleset);
  const docLines = source.split('\n');
  return errors.map(error => {
    // HTMLHint reports line/column; CodeMirror wants a document offset.
    let errorIndex = 0;
    for (let i = 0; i < error.line - 1; i++) {
      errorIndex += docLines[i].length + 1;
    }
    errorIndex += error.col - 1;
    return {
      from: errorIndex,
      to: errorIndex,
      severity: error.type,
      message: error.message,
    };
  });
};

const htmlLinter = linter(view =>
  getHtmlLintDiagnostics(view.state.doc.toString()),
);

// eslint's recommended rules, run in the browser against the student's file.
const jsLintConfig = {
  ...js.configs.recommended,
  languageOptions: {globals: {...globals.browser}},
};

const jsLinter = linter(view => {
  const messages = new eslint.Linter().verify(
    view.state.doc.toString(),
    jsLintConfig,
  );
  const doc = view.state.doc;
  return messages.map(message => {
    // eslint lines/columns are 1-based; a message without an end position marks
    // a single point.
    const from = Math.min(
      doc.line(Math.max(message.line, 1)).from + message.column - 1,
      doc.length,
    );
    const to =
      message.endLine != null && message.endColumn != null
        ? Math.min(
            doc.line(message.endLine).from + message.endColumn - 1,
            doc.length,
          )
        : from;
    return {
      from,
      to,
      severity: message.severity === 2 ? 'error' : 'warning',
      message: message.message,
    } satisfies Diagnostic;
  });
});

/**
 * The lint extensions for a language id, or none if we do not lint it. Keyed by
 * the same identifiers as `CodebridgeConfig.languageMapping`.
 */
export const lintExtensionsFor = (languageId: string): Extension[] => {
  if (languageId === 'javascript') {
    return [jsLinter];
  }
  if (languageId === 'html') {
    return [htmlLinter];
  }
  return [];
};
