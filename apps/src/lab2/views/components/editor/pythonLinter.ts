import init, {
  Workspace,
  Diagnostic as RuffDiagnostic,
} from '@astral-sh/ruff-api';
import {Diagnostic as CodeMirrorDiagnostic, linter} from '@codemirror/lint';

export async function getPythonLinter() {
  await init();
  const ruffWorkspace = new Workspace({
    'line-length': 88,
    'indent-width': 2,
    format: {
      'indent-style': 'space',
      'quote-style': 'double',
    },
  });
  return linter(view => {
    const doc = view.state.doc;
    const diagnostics: CodeMirrorDiagnostic[] = [];
    const diagnosticResults = ruffWorkspace.check(doc.toString());
    diagnosticResults.forEach((d: typeof RuffDiagnostic) => {
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
