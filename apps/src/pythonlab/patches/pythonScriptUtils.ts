import {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {ALL_PATCHES} from './patches';

export function applyPatches(originalCode: string) {
  let finalCode = originalCode;

  for (const patch of ALL_PATCHES) {
    finalCode = patch.shouldPrepend
      ? patch.contents + '\n' + finalCode
      : finalCode + '\n' + patch.contents;
  }
  return finalCode;
}

// Pyodide uses the same interpreter for the lifetime of the browser tab.
// In order to ensure we get updated user code for each run, we delete the
// modules created by the user code from the sys.modules cache.
export function deleteCachedUserModules(
  source: MultiFileSource,
  excludedFileName: string
) {
  let result = '\n';
  for (const file of Object.values(source.files)) {
    if (file.name !== excludedFileName) {
      const filePath = getModuleName(file.id, source);
      result += `
if "${filePath}" in sys.modules:
  del sys.modules['${filePath}']
`;
    }
  }
  return result;
}

// Write source to the Pyodide file system.
// This enables python files to import from other files in the project.
export function writeSource(
  source: MultiFileSource,
  currentFolderId: string,
  currentPath: string,
  pyodide: PyodideInterface
) {
  // Find all files in this folder and write them.
  Object.values(source.files)
    .filter(f => f.folderId === currentFolderId)
    .forEach(file => {
      pyodide.FS.writeFile(`${currentPath}${file.name}`, file.contents);
    });
  Object.values(source.folders)
    .filter(f => f.parentId === currentFolderId)
    .forEach(folder => {
      // Create folder if it doesn't exist.
      const newPath =
        currentPath.length === 0
          ? `${folder.name}`
          : `${currentPath}${folder.name}`;
      try {
        pyodide.FS.readdir(newPath);
      } catch (e) {
        // Folder doesn't exist, create it.
        pyodide.FS.mkdir(newPath);
      }
      // Recurse to write all children of the folder (files and folders).
      writeSource(source, folder.id, newPath + '/', pyodide);
    });
}

// Remove all source files from the Pyodide file system.
// This ensures any deleted file is not available to be imported,
// which could cause confusion.
export function deleteSourceFiles(
  pyodide: PyodideInterface,
  source: MultiFileSource
) {
  Object.values(source.files).forEach(file => {
    const filePath = getFilePath(file.id, source);
    try {
      pyodide.FS.unlink(filePath);
    } catch (e) {
      // TODO: log error better. We catch this because it should not prevent
      // future runs.
      console.warn(`error unlinking Pyodide file ${filePath}, ${e}`);
    }
  });
}

// For the given fileId, return the full path to the file, including the file name.
const getFilePath = (fileId: string, source: MultiFileSource) => {
  let path = source.files[fileId].name;
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path = source.folders[folderId].name + '/' + path;
    folderId = source.folders[folderId].parentId;
  }
  return path;
};

// For the given fileId, return the module version of the file. For example, a file at
// path folder1/folder2/file.py would have a module name of "folder1.folder2.file".
const getModuleName = (fileId: string, source: MultiFileSource) => {
  let path = source.files[fileId].name.replace('.py', '');
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path = source.folders[folderId].name + '.' + path;
    folderId = source.folders[folderId].parentId;
  }
  return path;
};
