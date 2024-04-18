import {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  getNextFileId,
  getNextFolderId,
} from '@cdo/apps/weblab2/CDOIDE/cdoIDEContext/utils';
import {DEFAULT_FOLDER_ID} from '@cdo/apps/weblab2/CDOIDE/constants';

import {PyodideMessage, PyodidePathContent} from '../types';

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
  const result = [];
  for (const file of Object.values(source.files)) {
    if (file.name !== excludedFileName) {
      const filePath = getModuleName(file.id, source);
      result.push(`
if "${filePath}" in sys.modules:
  del sys.modules['${filePath}']
`);
    }
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
// We want a clean working directory for each run.
// TODO: determine if we want to do the following:
// - look for deleted folders or files.
// - send an error message if a non-csv/txt file is updated (this is currently ignored).
// - process hidden folders (we currently ignore them).
export function getUpdatedSourceAndDeleteFiles(
  source: MultiFileSource,
  id: string,
  pyodide: PyodideInterface,
  sendMessage: (message: PyodideMessage) => void
) {
  const workingDir = pyodide.FS.cwd();
  // TODO: we should log an error for every new, non .csv or .txt file.
  // should we do anything with a deleted csv or txt file??
  const directoryData = pyodide.FS.lookupPath(workingDir, {}).node;
  const directoryContents = Object.values(
    directoryData.contents
  ) as PyodidePathContent[];
  const newSource = {...source};
  updateAndDeleteSourceWithContents(
    directoryContents,
    newSource,
    workingDir + '/',
    DEFAULT_FOLDER_ID,
    id,
    pyodide,
    sendMessage
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
  sendMessage: (message: PyodideMessage) => void
) {
  contents.forEach(content => {
    const fileExtension = content.name.split('.').pop();
    const fullPath = currentPath + content.name;
    if (pyodide.FS.isFile(content.mode)) {
      if (fileExtension === 'csv' || fileExtension === 'txt') {
        const file = Object.values(source.files).find(
          f => f.name === content.name
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
              language: fileExtension,
              contents: newContents,
            };
          } else {
            file.contents = newContents;
          }
        } catch (e) {
          console.warn(`could not read file ${content.name}, ${e}`);
        }
      } else {
        if (!Object.values(source.files).some(f => f.name === content.name)) {
          sendMessage({
            type: 'error',
            message: `You cannot write a ${fileExtension} file in Python Lab`,
            id: id,
          });
        }
      }
      // Delete the file now that we have handled it.
      pyodide.FS.unlink(fullPath);
      // Do not create or iterate through folders that start with '.' as these are hidden folders.
    } else if (
      pyodide.FS.isDir(content.mode) &&
      !content.name.startsWith('.')
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
        sendMessage
      );
      // Now that we've handled the contents, delete the folder.
      pyodide.FS.rmdir(newPath);
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
