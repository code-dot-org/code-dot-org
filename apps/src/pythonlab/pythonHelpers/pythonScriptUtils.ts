import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import _ from 'lodash';
import type {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  getNextFileId,
  getNextFolderId,
} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

import {PyodideMessage, PyodidePathContent} from '../types';

import {HIDDEN_FOLDERS} from './constants';
import {TEARDOWN_CODE} from './patches';

// Returns the cleanup code to be run after the user's code.
export function getCleanupCode(source: MultiFileSource) {
  const cleanupCode = TEARDOWN_CODE;
  return cleanupCode + deleteCachedUserModules(source);
}

// Pyodide uses the same interpreter for the lifetime of the browser tab.
// In order to ensure we get updated user code for each run, we delete the
// modules created by the user code from the sys.modules cache. We must purge
// main.py too: the Run path executes it as the entry script (so it never
// enters sys.modules and the guard below makes its delete a no-op), but test
// and validation code imports it as the `main` module, and a cached copy would
// run a stale version of the student's solution.
export function deleteCachedUserModules(source: MultiFileSource) {
  const result = ['import sys'];
  for (const file of Object.values(source.files)) {
    const filePath = getModuleName(file.id, source);
    result.push(`
if "${filePath}" in sys.modules:
  del sys.modules['${filePath}']
`);
  }
  return '\n' + result.join('\n') + '\n';
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
      const newPath = `${currentPath}${folder.name}`;
      createFolderIfNotExists(newPath, pyodide);
      // Recurse to write all children of the folder (files and folders).
      writeSource(source, folder.id, newPath + '/', pyodide);
    });
}

// Iterate over the pyodide file system and update the source object with any new or updated
// csv or txt files, or new folders. If we see any other new files, send an error message.
// In addition, delete every file in the working directory to prepare for the next run.
// We want a clean working directory for each run. We skip sending any skipped files,
// these are files such as validation that do not need to be saved to the user's project.
export function getUpdatedSourceAndDeleteFiles(
  source: MultiFileSource,
  id: string,
  pyodide: PyodideInterface,
  sendMessage: (message: PyodideMessage) => void,
  skippedFilenames: string[] = []
) {
  const workingDir = pyodide.FS.cwd();
  // Pyodide types a node's `contents` as Uint8Array (correct for files), but a
  // directory node's `contents` is a record of its child nodes keyed by name.
  const directoryNode = pyodide.FS.lookupPath(workingDir, {})
    .node as unknown as {contents: Record<string, PyodidePathContent>};
  const directoryContents = Object.values(directoryNode.contents);
  const newSource = _.cloneDeep(source);
  updateAndDeleteSourceWithContents(
    directoryContents,
    newSource,
    workingDir + '/',
    DEFAULT_FOLDER_ID,
    id,
    pyodide,
    sendMessage,
    skippedFilenames
  );
  return newSource;
}

function updateAndDeleteSourceWithContents(
  contents: PyodidePathContent[],
  source: MultiFileSource,
  currentPath: string,
  folderId: string,
  id: string,
  pyodide: PyodideInterface,
  sendMessage: (message: PyodideMessage) => void,
  skippedFilenames: string[] = []
) {
  contents.forEach(content => {
    const fullPath = currentPath + content.name;
    if (pyodide.FS.isFile(content.mode)) {
      // Only update the source with files that are not skipped.
      // We still want to delete skipped files below.
      if (!skippedFilenames.includes(content.name)) {
        const file = Object.values(source.files).find(
          f => f.name === content.name && f.folderId === folderId
        );
        try {
          const newContents = pyodide.FS.readFile(fullPath, {
            encoding: 'utf8',
          });
          if (!file) {
            const newFileId = getNextFileId(Object.values(source.files));
            source.files[newFileId] = {
              id: newFileId,
              folderId,
              name: content.name,
              contents: newContents,
            };
          } else {
            file.contents = newContents;
          }
        } catch (e) {
          sendMessage({
            type: 'internal_error',
            message: `Failed to read file ${fullPath}`,
            id: id,
          });
        }
      }
      // Delete the file now that we have handled it.
      try {
        pyodide.FS.unlink(fullPath);
      } catch (e) {
        sendMessage({
          type: 'internal_error',
          message: `Failed to unlink ${fullPath}`,
          id: id,
        });
      }
      // Do not create or iterate through folders that should be hidden.
    } else if (
      pyodide.FS.isDir(content.mode) &&
      !HIDDEN_FOLDERS.includes(content.name)
    ) {
      const newPath = currentPath + content.name + '/';
      const existingFolder = Object.values(source.folders).find(
        f => f.name === content.name && f.parentId === folderId
      );
      let newFolderId = '';
      if (!existingFolder) {
        createFolderIfNotExists(newPath, pyodide);
        newFolderId = getNextFolderId(Object.values(source.folders));
        source.folders[newFolderId] = {
          id: newFolderId,
          name: content.name,
          parentId: folderId,
        };
      } else {
        newFolderId = existingFolder.id;
      }

      updateAndDeleteSourceWithContents(
        Object.values(content.contents),
        source,
        newPath,
        newFolderId,
        id,
        pyodide,
        sendMessage,
        skippedFilenames
      );
      // Now that we've handled the contents, delete the folder.
      try {
        pyodide.FS.rmdir(newPath);
      } catch (e) {
        sendMessage({
          type: 'internal_error',
          message: `Failed to remove directory ${newPath}`,
          id: id,
        });
      }
    }
  });
}

export async function importPackagesFromFiles(
  source: MultiFileSource,
  pyodide: PyodideInterface
) {
  // Loading can throw erroneous console errors if a user has a package with the same name as one
  // in the pyodide list of packages that we have not put in our repo. We can ignore these,
  // any actual import errors will be caught by the runPythonAsync call.
  for (const file of Object.values(source.files)) {
    if (file.name.endsWith('.py')) {
      await pyodide.loadPackagesFromImports(file.contents);
    }
  }
}

// Delete any python globals that were not present in
// the original globals on pyodide start (originalGlobals param).
// This allows us to ensure each pyodide run has a clean state.
export function resetGlobals(
  pyodide: PyodideInterface,
  originalGlobals: Map<string, string>
) {
  const newGlobals = pyodide.globals.toJs();
  newGlobals.forEach((_value: string, key: string) => {
    if (!originalGlobals.has(key)) {
      pyodide.globals.delete(key);
    }
  });
}

// For the given fileId, return the module version of the file. For example, a file at
// path folder1/folder2/file.py would have a module name of "folder1.folder2.file".
function getModuleName(fileId: string, source: MultiFileSource) {
  const path = [source.files[fileId].name.replace('.py', '')];
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path.unshift(source.folders[folderId].name);
    folderId = source.folders[folderId].parentId;
  }
  return path.join('.');
}

function createFolderIfNotExists(
  qualifiedFolderName: string,
  pyodide: PyodideInterface
) {
  try {
    pyodide.FS.readdir(qualifiedFolderName);
  } catch (e) {
    pyodide.FS.mkdir(qualifiedFolderName);
  }
}
