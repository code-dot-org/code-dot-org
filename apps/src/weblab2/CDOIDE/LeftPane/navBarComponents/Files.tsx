import {
  useCDOIDEContext,
  getNextFileId,
  getNextFolderId,
} from '@cdoide/cdoIDEContext';
import {DEFAULT_FOLDER_ID} from '@cdoide/constants';
import {ProjectType, FileId, FolderId} from '@cdoide/types';
import {findFolder, getErrorMessage} from '@cdoide/utils';
import React, {useMemo} from 'react';

import './styles/files.css';

type FilesComponentProps = {
  newFolderPrompt: (parentId?: string) => void;
  folders: ProjectType['folders'];
  parentId?: string;
  files: ProjectType['files'];
  newFilePrompt: (folderId?: FolderId) => void;
  moveFilePrompt: (fileId: FileId) => void;
  renameFilePrompt: (fileId: FileId) => void;
  renameFolderPrompt: (folderId: FolderId) => void;
};

const FilesBrowser = React.memo(
  ({
    parentId,
    folders,
    files,
    newFolderPrompt,
    newFilePrompt,
    moveFilePrompt,
    renameFilePrompt,
    renameFolderPrompt,
  }: FilesComponentProps) => {
    const {openFile, deleteFile, toggleOpenFolder, deleteFolder} =
      useCDOIDEContext();

    return (
      <>
        {Object.values(folders)
          .filter(f => f.parentId === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => {
            const caret = (
              <i
                className={
                  f.open ? 'fa-solid fa-caret-down' : 'fa-solid fa-caret-right'
                }
              />
            );
            return (
              <li key={f.id + f.open}>
                <span className="label">
                  <span className="title">
                    <span
                      className="caret-container"
                      onClick={() => toggleOpenFolder(f.id)}
                    >
                      {caret}
                    </span>
                    <span>{f.name}</span>
                  </span>

                  <span className="button-bar">
                    <span onClick={() => renameFolderPrompt(f.id)}>
                      <i className="fa-solid fa-pencil" />
                    </span>
                    <span onClick={() => newFolderPrompt(f.id)}>
                      <i className="fa-solid fa-folder-plus" />
                    </span>
                    <span onClick={() => newFilePrompt(f.id)}>
                      <i className="fa-solid fa-plus" />
                    </span>
                    <span onClick={() => deleteFolder(f.id)}>
                      <i className="fa-solid fa-trash" />
                    </span>
                  </span>
                </span>
                {f.open && (
                  <ul>
                    <FilesBrowser
                      folders={folders}
                      newFolderPrompt={newFolderPrompt}
                      parentId={f.id}
                      files={files}
                      newFilePrompt={newFilePrompt}
                      moveFilePrompt={moveFilePrompt}
                      renameFilePrompt={renameFilePrompt}
                      renameFolderPrompt={renameFolderPrompt}
                    />
                  </ul>
                )}
              </li>
            );
          })}
        {Object.values(files)
          .filter(f => f.folderId === parentId)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => (
            <li key={f.id}>
              <span className="label">
                <span onClick={() => openFile(f.id)}>{f.name}</span>
                <span className="button-bar">
                  <span onClick={() => moveFilePrompt(f.id)}>
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                  <span onClick={() => renameFilePrompt(f.id)}>
                    <i className="fa-solid fa-pencil" />
                  </span>
                  <span onClick={() => deleteFile(f.id)}>
                    <i className="fa-solid fa-trash" />
                  </span>
                </span>
              </span>
            </li>
          ))}
      </>
    );
  }
);

export const Files = React.memo(() => {
  const {
    project,
    newFile,
    renameFile,
    moveFile,

    renameFolder,
    newFolder,
  } = useCDOIDEContext();

  const newFolderPrompt: FilesComponentProps['newFolderPrompt'] = useMemo(
    () =>
      (parentId = DEFAULT_FOLDER_ID) => {
        const folderId = getNextFolderId(Object.values(project.folders));

        const folderName = window.prompt('Please name your new folder');
        if (!folderName) {
          return;
        }

        const existingFolder = Object.values(project.folders).some(
          f => f.name === folderName && f.parentId === parentId
        );
        if (existingFolder) {
          alert('Folder already exists');
          return;
        }

        newFolder({parentId, folderName, folderId});
      },
    [newFolder, project.folders]
  );

  const newFilePrompt: FilesComponentProps['newFilePrompt'] = useMemo(
    () =>
      (folderId = DEFAULT_FOLDER_ID) => {
        const fileName = window
          .prompt('Please name your new file')
          ?.replace(/[^\w.]+/g, '');
        if (!fileName) {
          return;
        }

        const existingFile = Object.values(project.files).some(
          f => f.name === fileName && f.folderId === folderId
        );
        if (existingFile) {
          alert('File already exists');
          return;
        }

        /* eslint-disable-next-line */
        const [_, extension] = fileName.split('.');
        if (!extension) {
          window.alert('Files must have extensions');
          return;
        }

        const fileId = getNextFileId(Object.values(project.files));
        newFile({
          fileId,
          fileName,
          folderId,
        });
      },
    [newFile, project.files]
  );

  const moveFilePrompt: FilesComponentProps['moveFilePrompt'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];

      const destinationFolder =
        window.prompt('Please enter your destination folder') ?? '';

      try {
        const folderId = findFolder(destinationFolder.split('/'), {
          folders: Object.values(project.folders),
          required: true,
        });

        const existingFile = Object.values(project.files).some(
          f => f.name === file.name && f.folderId === folderId
        );
        if (existingFile) {
          alert('File already exists');
          return;
        }

        moveFile(fileId, folderId);
      } catch (e) {
        window.alert(getErrorMessage(e));
      }
    },
    [moveFile, project.files, project.folders]
  );

  const renameFilePrompt: FilesComponentProps['renameFilePrompt'] = useMemo(
    () => fileId => {
      const file = project.files[fileId];
      const newName = window.prompt('Rename file', file.name);
      if (newName === null || newName === file.name) {
        return;
      }

      const existingFile = Object.values(project.files).some(
        f => f.name === newName && f.folderId === file.folderId
      );
      if (existingFile) {
        alert('File already exists');
        return;
      }

      renameFile(fileId, newName);
    },
    [renameFile, project.files]
  );

  const renameFolderPrompt: FilesComponentProps['renameFolderPrompt'] = useMemo(
    () => folderId => {
      const folder = project.folders[folderId];
      const newName = window.prompt('Rename folder', folder.name);
      if (newName === null || newName === folder.name) {
        return;
      }

      const existingFolder = Object.values(project.folders).some(
        f => f.name === newName && f.parentId === folder.parentId
      );
      if (existingFolder) {
        alert('Folder already exists');
        return;
      }

      renameFolder(folder.id, newName);
    },
    [renameFolder, project.folders]
  );

  return (
    <div>
      <div className="files-toolbar">
        <button type="button" onClick={() => newFolderPrompt()}>
          <i className="fa-solid fa-folder" />
          &nbsp; New Folder
        </button>
        <button type="button" onClick={() => newFilePrompt()}>
          <i className="fa-solid fa-file" />
          &nbsp; New File
        </button>
      </div>
      <ul>
        <FilesBrowser
          parentId={DEFAULT_FOLDER_ID}
          folders={project.folders}
          newFolderPrompt={newFolderPrompt}
          files={project.files}
          newFilePrompt={newFilePrompt}
          moveFilePrompt={moveFilePrompt}
          renameFilePrompt={renameFilePrompt}
          renameFolderPrompt={renameFolderPrompt}
        />
      </ul>
    </div>
  );
});
