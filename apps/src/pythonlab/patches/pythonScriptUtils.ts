import {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {PyodidePathContent} from '../types';

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

export function getUpdatedSource(
  pyodide: PyodideInterface,
  source: MultiFileSource
) {
  const workingDir = pyodide.FS.cwd();
  // TODO: we should log an error for every new, non .csv or .txt file.
  // should we do anything with a deleted csv or txt file??
  const directoryData = pyodide.FS.lookupPath(workingDir, {}).node;
  const directoryContents = Object.values(
    directoryData.contents
  ) as PyodidePathContent[];
  const newSource = {...source};
  console.log({directoryContents});
  updateSourceWithContents(pyodide, directoryContents, newSource);
  return newSource;
}

function updateSourceWithContents(
  pyodide: PyodideInterface,
  contents: PyodidePathContent[],
  source: MultiFileSource
) {
  contents.forEach(content => {
    const fileExtension = content.name.split('.').pop();
    if (
      pyodide.FS.isFile(content.mode) &&
      (fileExtension === 'csv' || fileExtension === 'txt')
    ) {
      const file = Object.values(source.files).find(
        f => f.name === content.name
      );
      try {
        // todo: need to include directory path here
        const newContents = pyodide.FS.readFile(content.name, {
          encoding: 'utf8',
        });
        if (!file) {
          const files = Object.values(source.files);
          // We get errors if we try to use getNextFileId (perhaps due to web worker weirdness)
          // so I copied the function here.
          const newFileId = String(
            Math.max(0, ...files.map(f => Number(f.id))) + 1
          );
          source.files[newFileId] = {
            id: newFileId,
            folderId: '0',
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
    } else if (pyodide.FS.isDir(content.mode)) {
      updateSourceWithContents(
        pyodide,
        Object.values(content.contents),
        source
      );
    }
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
  const path = [source.files[fileId].name];
  addFoldersToPath(fileId, source, path);
  return path.join('/');
};

// For the given fileId, return the module version of the file. For example, a file at
// path folder1/folder2/file.py would have a module name of "folder1.folder2.file".
const getModuleName = (fileId: string, source: MultiFileSource) => {
  const path = [source.files[fileId].name.replace('.py', '')];
  addFoldersToPath(fileId, source, path);
  return path.join('.');
};

const addFoldersToPath = (
  fileId: string,
  source: MultiFileSource,
  path: string[]
) => {
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path.unshift(source.folders[folderId].name);
    folderId = source.folders[folderId].parentId;
  }
};

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
