import type {PyodideInterface} from 'pyodide';

import type {
  MultiFileSource,
  ProjectFile,
  ProjectFolder,
} from '@code-dot-org/core/api';

// NOTE: this module runs inside the pyodide web worker, so it must not import
// from `@code-dot-org/codebridge`. That package's entry pulls in React and
// browser-only code, which throws `window is not defined` in a worker. The three
// values below are therefore duplicated from codebridge (constants.ts and
// utils/multiFileSource.ts) rather than imported; keep them in sync.
export const DEFAULT_FOLDER_ID = '0';

/** Next available file id, one past the current max numeric id. */
const getNextFileId = (files: ProjectFile[]): string =>
  String(Math.max(0, ...files.map(f => Number(f.id))) + 1);

/** Next available folder id, one past the current max numeric id. */
const getNextFolderId = (folders: ProjectFolder[]): string =>
  String(Math.max(0, ...folders.map(f => Number(f.id))) + 1);

// Moving the project between the pyodide virtual filesystem and the lab's
// MultiFileSource. Ported from apps/src/pythonlab/pythonHelpers/pythonScriptUtils.ts.
//
// The filesystem is scratch space: `writeSource` populates it before a run, and
// `getUpdatedSourceAndDeleteFiles` drains it afterwards — folding files the
// program created or changed back into the project and removing everything, so
// the next run starts from the project alone and never inherits stale state.

/** Folders hidden from the project. `.matplotlib` is auto-created on import. */
const HIDDEN_FOLDERS = ['.matplotlib'];

/**
 * A node in pyodide's virtual filesystem. `contents` is a Uint8Array for files
 * but a record of child nodes for directories, which pyodide's types do not
 * distinguish.
 */
interface PyodidePathContent {
  name: string;
  mode: number;
  contents: Record<string, PyodidePathContent>;
}

/** Create a folder in the pyodide FS if it is not already there. */
function createFolderIfNotExists(path: string, pyodide: PyodideInterface) {
  try {
    pyodide.FS.mkdir(path);
  } catch {
    // Already exists; nothing to do.
  }
}

/**
 * Write the project into the pyodide filesystem, recreating its folder tree so
 * imports between files resolve.
 */
export function writeSource(
  source: MultiFileSource,
  currentFolderId: string,
  currentPath: string,
  pyodide: PyodideInterface,
) {
  Object.values(source.files)
    .filter(file => file.folderId === currentFolderId)
    .forEach(file => {
      pyodide.FS.writeFile(`${currentPath}${file.name}`, file.contents);
    });
  Object.values(source.folders)
    .filter(folder => folder.parentId === currentFolderId)
    .forEach(folder => {
      const newPath = `${currentPath}${folder.name}`;
      createFolderIfNotExists(newPath, pyodide);
      writeSource(source, folder.id, `${newPath}/`, pyodide);
    });
}

/**
 * Walk the working directory, folding every file into a copy of `source` (adding
 * new ones, overwriting changed ones) and deleting it from the filesystem as it
 * goes. Returns the updated project; the filesystem is left empty.
 *
 * `skippedFilenames` are still deleted but not written back — used for files the
 * lab injects that must not land in the student's project.
 */
export function getUpdatedSourceAndDeleteFiles(
  source: MultiFileSource,
  id: string,
  pyodide: PyodideInterface,
  sendMessage: (message: {
    type: 'internal_error';
    message: string;
    id: string;
  }) => void,
  skippedFilenames: string[] = [],
): MultiFileSource {
  const workingDir = pyodide.FS.cwd();
  const directoryNode = pyodide.FS.lookupPath(workingDir, {})
    .node as unknown as {
    contents: Record<string, PyodidePathContent>;
  };
  // structuredClone rather than a hand-rolled deep copy: the source is plain data.
  const newSource = structuredClone(source);
  updateAndDeleteSourceWithContents(
    Object.values(directoryNode.contents),
    newSource,
    `${workingDir}/`,
    DEFAULT_FOLDER_ID,
    id,
    pyodide,
    sendMessage,
    skippedFilenames,
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
  sendMessage: (message: {
    type: 'internal_error';
    message: string;
    id: string;
  }) => void,
  skippedFilenames: string[],
) {
  contents.forEach(content => {
    const fullPath = currentPath + content.name;

    if (pyodide.FS.isFile(content.mode)) {
      // Skipped files are still deleted below, just not written back.
      if (!skippedFilenames.includes(content.name)) {
        const file = Object.values(source.files).find(
          f => f.name === content.name && f.folderId === folderId,
        );
        try {
          const newContents = pyodide.FS.readFile(fullPath, {
            encoding: 'utf8',
          }) as unknown as string;
          if (file) {
            file.contents = newContents;
          } else {
            const newFileId = getNextFileId(Object.values(source.files));
            source.files[newFileId] = {
              id: newFileId,
              folderId,
              name: content.name,
              language: 'python',
              contents: newContents,
              open: false,
              active: false,
            };
          }
        } catch {
          sendMessage({
            type: 'internal_error',
            message: `Failed to read file ${fullPath}`,
            id,
          });
        }
      }
      try {
        pyodide.FS.unlink(fullPath);
      } catch {
        sendMessage({
          type: 'internal_error',
          message: `Failed to unlink ${fullPath}`,
          id,
        });
      }
      return;
    }

    // Do not create or descend into folders that should stay hidden.
    if (
      !pyodide.FS.isDir(content.mode) ||
      HIDDEN_FOLDERS.includes(content.name)
    ) {
      return;
    }

    const newPath = `${fullPath}/`;
    const existingFolder = Object.values(source.folders).find(
      f => f.name === content.name && f.parentId === folderId,
    );
    let newFolderId: string;
    if (existingFolder) {
      newFolderId = existingFolder.id;
    } else {
      createFolderIfNotExists(newPath, pyodide);
      newFolderId = getNextFolderId(Object.values(source.folders));
      source.folders[newFolderId] = {
        id: newFolderId,
        name: content.name,
        parentId: folderId,
        open: false,
      };
    }

    updateAndDeleteSourceWithContents(
      Object.values(content.contents),
      source,
      newPath,
      newFolderId,
      id,
      pyodide,
      sendMessage,
      skippedFilenames,
    );

    try {
      pyodide.FS.rmdir(newPath);
    } catch {
      sendMessage({
        type: 'internal_error',
        message: `Failed to remove directory ${newPath}`,
        id,
      });
    }
  });
}
