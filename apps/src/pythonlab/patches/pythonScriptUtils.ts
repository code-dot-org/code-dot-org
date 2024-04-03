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
  const patches = [
    {contents: PATCH_MATPLOTLIB, shouldPrepend: true},
    {contents: FLUSH_STDOUT, shouldPrepend: false},
  ];
  for (const patch of patches) {
    finalCode = patch.shouldPrepend
      ? patch.contents + finalCode
      : finalCode + patch.contents;
  }
  console.log({finalCode});
  return finalCode;
}
