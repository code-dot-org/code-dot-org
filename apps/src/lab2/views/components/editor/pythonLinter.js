// import {
//   Workspace,
//   Diagnostic as RuffDiagnostic,
//   initSync,
// } from '@astral-sh/ruff-api';
import * as ruff_wasm from '@astral-sh/ruff-wasm-bundler';
import {linter} from '@codemirror/lint';

export function getPythonLinter() {
  ruff_wasm.initSync();
  const ruffWorkspace = new ruff_wasm.Workspace({
    'line-length': 88,
    'indent-width': 2,
    format: {
      'indent-style': 'space',
      'quote-style': 'double',
    },
  });
  return linter(view => {
    const doc = view.state.doc;
    const diagnostics = [];
    const diagnosticResults = ruffWorkspace.check(doc.toString());
    diagnosticResults.forEach(d => {
      diagnostics.push({
        from: doc.line(d.location.row).from + d.location.column - 1,
        to: doc.line(d.end_location.row).from + d.end_location.column - 1,
        severity: d.message.indexOf('Error:') >= 0 ? 'error' : 'warning',
        message: d.code ? d.code + ': ' + d.message : d.message,
      });
    });
    return diagnostics;
  });
}
