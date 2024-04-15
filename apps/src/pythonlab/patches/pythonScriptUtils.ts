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

export function importFileCode(
  source: MultiFileSource,
  excludedFileName: string
) {
  let result = `
import importlib
importlib.invalidate_caches()
`;
  for (const file of Object.values(source.files)) {
    if (file.name !== excludedFileName) {
      const filePath = getModuleName(file.id, source);
      result += `
importlib.reload(${filePath})
`;
    }
  }
  console.log({importCode: result});
  return result;
}

export function removeFileCode(
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
  console.log({removeCode: result});
  return result;
  //   let result = `
  // import os
  // import importlib
  // `;
  //   for (const file of Object.values(source.files)) {
  //     if (file.name !== excludedFileName) {
  //       result += `os.remove("${getFilePath(file.id, source)}")\n`;
  //     }
  //   }
  //   result += 'importlib.invalidate_caches()\n';
  //   return result;
}

// export function includeImportedFiles(sources: MultiFileSource, script: string) {
//   let wrappedScript = script;
//   for (const file of Object.values(sources.files)) {
//     if (file.name !== 'main.py') {
//       wrappedScript = importFileCode(file.name, file.contents) + wrappedScript;
//     }
//   }
//   return wrappedScript;
// }

// Write all sources to the Pyodide file system.
// This enables python files to import from other files in the project.
export function writeSources(
  sources: MultiFileSource,
  currentFolderId: string,
  currentPath: string,
  pyodide: PyodideInterface
) {
  // Find all files in this folder and write them.
  Object.values(sources.files)
    .filter(f => f.folderId === currentFolderId)
    .forEach(file => {
      console.log(`writing file ${currentPath}${file.name}`);
      pyodide.FS.writeFile(`${currentPath}${file.name}`, file.contents);
    });
  Object.values(sources.folders)
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
      writeSources(sources, folder.id, newPath + '/', pyodide);
    });
}

// Remove all source files from the Pyodide file system.
// This ensures any deleted file is not available to be imported,
// which could cause confusion.
export function clearSources(
  pyodide: PyodideInterface,
  sources: MultiFileSource
) {
  console.log('skipping clear');
  // console.log('loaded packages before clear');
  // console.log(pyodide.loadedPackages);
  // Object.values(sources.files).forEach(file => {
  //   const filePath = getFilePath(file.id, sources);
  //   try {
  //     console.log(`overwriting and unlinking ${filePath}`);
  //     pyodide.FS.writeFile(filePath, '');
  //     pyodide.FS.unlink(filePath);
  //   } catch (e) {
  //     // TODO: log error better. We catch this because it should not prevent
  //     // future runs.
  //     console.warn(`error unlinking Pyodide file ${filePath}, ${e}`);
  //   }
  // });
  // console.log('getting file info post clear...');
  const pathData = pyodide.FS.analyzePath('/', true);
  console.log({pathData});
}

// For the given fileId, return the full path to the file, including the file name.
// const getFilePath = (fileId: string, source: MultiFileSource) => {
//   let path = source.files[fileId].name;
//   let folderId = source.files[fileId].folderId;
//   while (source.folders[folderId]) {
//     path = source.folders[folderId].name + '/' + path;
//     folderId = source.folders[folderId].parentId;
//   }
//   return path;
// };

const getModuleName = (fileId: string, source: MultiFileSource) => {
  let path = source.files[fileId].name.replace('.py', '');
  let folderId = source.files[fileId].folderId;
  while (source.folders[folderId]) {
    path = source.folders[folderId].name + '.' + path;
    folderId = source.folders[folderId].parentId;
  }
  return path;
};
