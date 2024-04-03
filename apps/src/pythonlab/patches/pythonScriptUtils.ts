import {FLUSH_STDOUT, PATCH_MATPLOTLIB} from './patches';

// Helper function that adds code to import a local file for use in the user's script.
export function importFileCode(fileName: string, fileContents: string) {
  return `
import importlib
from pathlib import Path
Path("${fileName}").write_text("""\
${fileContents}
"""
)
importlib.invalidate_caches()
`;
}

export function applyPatches(originalCode: string) {
  let finalCode = originalCode;
  // TODO: Should we always patch matplotlib? Or can we be smarter about when to patch it?
  // (patching it requires importing it, which can be slow).
  const patches = [
    {contents: PATCH_MATPLOTLIB, shouldPrepend: true},
    {contents: FLUSH_STDOUT, shouldPrepend: false},
  ];
  for (const patch of patches) {
    finalCode = patch.shouldPrepend
      ? patch.contents + '\n' + finalCode
      : finalCode + '\n' + patch.contents;
  }
  return finalCode;
}
