import {ALL_PATCHES} from './patches';

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

  for (const patch of ALL_PATCHES) {
    finalCode = patch.shouldPrepend
      ? patch.contents + '\n' + finalCode
      : finalCode + '\n' + patch.contents;
  }
  return finalCode;
}
