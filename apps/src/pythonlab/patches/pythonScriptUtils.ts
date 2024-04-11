import {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';

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

export function writeSources(
  sources: MultiFileSource,
  currentFolderId: string,
  currentPath: string,
  pyodide: PyodideInterface
) {
  // Need to make sure we don't recreate things every time
  // (although that seems to be quick so maybe is fine)
  // and delete old files/folders.
  // write all files in this folder
  Object.values(sources.files)
    .filter(f => f.folderId === currentFolderId)
    .forEach(file => {
      console.log('about to write file');
      console.log({
        path: `${currentPath}${file.name}`,
        contents: file.contents,
      });
      pyodide.FS.writeFile(`${currentPath}${file.name}`, file.contents);
    });
  Object.values(sources.folders)
    .filter(f => f.parentId === currentFolderId)
    .forEach(folder => {
      // create folder
      const newPath =
        currentPath.length === 0
          ? `${folder.name}`
          : `${currentPath}${folder.name}`;

      console.log({newPath});
      pyodide.FS.mkdir(newPath);
      // recurse to get all child folders
      writeSources(sources, folder.id, newPath + '/', pyodide);
    });
}

export function clearSources(pyodide: PyodideInterface) {
  console.log('clearing sources?');
  console.log(pyodide.FS.cwd());
}
