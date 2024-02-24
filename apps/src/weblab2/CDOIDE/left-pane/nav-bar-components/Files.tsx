import React from 'react';
import {useCDOIDEContext} from '../../CDOIDEContext';

import {ProjectType} from '../../types';

import './styles/files.css';

type FoldersProps = {
  newFolder: (parentId?: string) => void;
  openFolder: (folderId: string) => void;
  deleteFolder: (folderId: string) => void;
  folders: ProjectType['folders'];
  parentId?: string;
  files: ProjectType['files'];
  openFile: (fileName: string) => void;
  deleteFile: (fileName: string) => void;
  newFile: (folderId?: string) => void;
};

type Obj = {
  name: string;
  foo: string;
};

const Folders = ({
  newFolder,
  openFolder,
  deleteFolder,
  folders,
  parentId,
  files,
  openFile,
  deleteFile,
  newFile,
}: FoldersProps) => {
  const L: Record<string, Obj> = {
    X: {name: '1', foo: 'f2'},
    Y: {name: '2', foo: 'f3'},
    Z: {name: '3', foo: 'f4'},
  };

  Object.values(L).filter(l => l.name === 'able');

  return (
    <>
      {Object.values(folders)
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(f => {
          const caret = f.open ? 'V' : '>';
          return (
            <li key={f.id}>
              <span className="label">
                <span onClick={() => openFolder(f.id)}>{caret}</span>
                <span>{f.name}</span>
                <span onClick={() => newFolder(f.id)}>+</span>
                <span onClick={() => newFile(f.id)}>@</span>
                <span onClick={() => deleteFolder(f.id)}>X</span>
              </span>
              {f.open && (
                <ul>
                  <Folders
                    folders={folders}
                    newFolder={newFolder}
                    openFolder={openFolder}
                    deleteFolder={deleteFolder}
                    parentId={f.id}
                    files={files}
                    openFile={openFile}
                    deleteFile={deleteFile}
                    newFile={newFile}
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
          <li key={`${f.folderId || 0}/${f.name}`}>
            <span className="label">
              <span onClick={() => openFile(f.name)}>{f.name}</span>
              <span onClick={() => deleteFile(f.name)}>X</span>
            </span>
          </li>
        ))}
    </>
  );
};

export const Files = () => {
  const {project, setProject} = useCDOIDEContext();

  const newFolder: FoldersProps['newFolder'] = parentId => {
    const newProject = {...project, folders: {...project.folders}};

    const newFolders = Object.values(newProject.folders).filter(n =>
      n.name.match(/New Folder (\d+)/)
    );

    const newFolderName = `New Folder ${newFolders.length + 1}`;
    const newFolderId = String(Object.keys(newProject.folders).length + 1);

    newProject.folders[newFolderId] = {
      name: newFolderName,
      id: newFolderId,
      parentId,
    };

    setProject(newProject);
  };

  const newFile: FoldersProps['newFile'] = folderId => {
    const newProject = {...project, files: {...project.files}};

    const newFiles = Object.keys(newProject.files).filter(n =>
      n.match(/new_file_(\d+)/)
    );

    Object.values(newProject.files).forEach(f => {
      if (f.active) {
        newProject.files[f.name] = {...f, active: false};
      }
    });

    const newFileName = `new_file_${newFiles.length + 1}.html`;

    newProject.files[newFileName] = {
      name: newFileName,
      language: 'html',
      contents: '<html><body>This is a newly created file!</body></html>',
      open: true,
      active: true,
      folderId,
    };

    setProject(newProject);
  };

  const openFile: FoldersProps['openFile'] = fileName => {
    const activeFile = Object.values(project.files).filter(f => f.active)?.[0];

    const newProject = {
      ...project,
      files: {
        ...project.files,
        [fileName]: {...project.files[fileName], active: true, open: true},
        [activeFile.name]: {...project.files[activeFile.name], active: false},
      },
    };

    if (activeFile) {
      newProject.files[activeFile.name].active = false;
    }

    if (activeFile?.name !== fileName) {
      setProject(newProject);
    }
  };

  const deleteFile: FoldersProps['deleteFile'] = fileName => {
    const activeFile = Object.values(project.files).filter(f => f.active)?.[0];

    const newProject = {
      ...project,
      files: {
        ...project.files,
      },
    };

    delete newProject.files[fileName];

    if (activeFile && activeFile.name !== fileName) {
      newProject.files[activeFile.name].active = false;
    }

    setProject(newProject);
  };

  const deleteFolder: FoldersProps['deleteFolder'] = folderId => {
    const newProject = {
      ...project,
      folders: {
        ...project.folders,
      },
    };

    // delete the folder
    delete newProject.folders[folderId];
    // and recursively delete any of its children. Dammit.
    // this only goes a single level deep atm. This'll be fixed as this component
    // is rewritten and shorn up.
    Object.values(newProject.folders)
      .filter(f => f.parentId === folderId)
      .forEach(f => delete newProject.folders[f.id]);

    setProject(newProject);
  };

  const openFolder: FoldersProps['openFolder'] = folderId => {
    const newProject = {
      ...project,
      folders: {
        ...project.folders,
      },
    };

    // toggle its open state

    newProject.folders[folderId].open = !Boolean(
      newProject.folders[folderId].open
    );

    setProject(newProject);
  };

  return (
    <div>
      <div className="files-toolbar">
        <button type="button" onClick={() => newFolder()}>
          New Folder
        </button>
        <button type="button" onClick={() => newFile()}>
          New File
        </button>
      </div>
      <ul>
        <Folders
          folders={project.folders}
          newFolder={newFolder}
          openFolder={openFolder}
          deleteFolder={deleteFolder}
          files={project.files}
          openFile={openFile}
          deleteFile={deleteFile}
          newFile={newFile}
        />
      </ul>
    </div>
  );
};
