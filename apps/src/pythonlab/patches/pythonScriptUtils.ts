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
  Object.values(sources.files)
    .filter(f => f.folderId === currentFolderId)
    .forEach(file => {
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
      try {
        pyodide.FS.readdir(newPath);
      } catch (e) {
        // folder doesn't exist, create it
        pyodide.FS.mkdir(newPath);
      }
      // recurse to get all child folders
      writeSources(sources, folder.id, newPath + '/', pyodide);
    });
}

export function clearSources(
  pyodide: PyodideInterface,
  sources: MultiFileSource
) {
  Object.values(sources.files).forEach(file => {
    const filePath = getFilePath(file.id, sources);
    try {
      pyodide.FS.unlink(filePath);
    } catch (e) {
      // TODO: log error better
      console.warn(`error unlinking Pyodide file`);
    }
  });
}

const getFilePath = (fileId: string, source: MultiFileSource) => {
  let path = source.files[fileId].name;
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path = source.folders[folderId].name + '/' + path;
    folderId = source.folders[folderId].parentId;
  }
  return path;
};
