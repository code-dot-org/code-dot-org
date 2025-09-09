import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FileId, FolderId} from '@codebridge/types';

import reducer, {
  createNewFile,
  renameFile,
  saveFile,
  setFileType,
  activateFile,
  closeFile,
  deleteFile,
  moveFile,
  moveFolder,
  createNewFolder,
  toggleOpenFolder,
  deleteFolder,
  renameFolder,
  rearrangeFiles,
  resetProjectMetadata,
  Lab2ProjectState,
  createNewExternalFile,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {
  MultiFileSource,
  ProjectSources,
  ProjectFileType,
  ProjectFile,
  ProjectFolder,
} from '@cdo/apps/lab2/types';

// Test data helpers
const createMockFile = (
  id: FileId,
  overrides: Partial<ProjectFile> = {}
): ProjectFile => ({
  id,
  name: `file${id}.txt`,
  language: 'txt',
  contents: `Content of file ${id}`,
  folderId: DEFAULT_FOLDER_ID,
  active: false,
  ...overrides,
});

const createMockFolder = (
  id: FolderId,
  overrides: Partial<ProjectFolder> = {}
): ProjectFolder => ({
  id,
  name: `folder${id}`,
  parentId: DEFAULT_FOLDER_ID,
  open: false,
  ...overrides,
});

const createMockMultiFileSource = (
  overrides: Partial<MultiFileSource> = {}
): MultiFileSource => ({
  files: {
    '1': createMockFile('1', {
      name: 'index.html',
      language: 'html',
      active: true,
    }),
    '2': createMockFile('2', {name: 'script.js', language: 'javascript'}),
  },
  folders: {
    '1': createMockFolder('1'),
  },
  openFiles: ['1'],
  ...overrides,
});

const createMockProjectSources = (
  sourceOverrides: Partial<MultiFileSource> = {}
): ProjectSources => ({
  source: createMockMultiFileSource(sourceOverrides),
  labConfig: undefined,
});

const initialState: Lab2ProjectState = {
  projectSources: undefined,
  viewingOldVersion: false,
  restoredOldVersion: false,
  hasEdited: false,
  projectTooLarge: false,
  lastSavedLabConfig: undefined,
};

describe('lab2ProjectRedux', () => {
  describe('createNewFile', () => {
    it('should create a new file in root folder', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewFile({fileName: 'newFile.txt'})
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFiles = Object.values(source.files);
      const newFile = newFiles.find(f => f.name === 'newFile.txt');

      expect(newFile).toBeDefined();
      expect(newFile?.folderId).toBe(DEFAULT_FOLDER_ID);
      expect(newFile?.contents).toBe('Add your changes to newFile.txt');
      expect(state.hasEdited).toBe(true);
    });

    it('should create a new file in specific folder with custom contents', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewFile({
          fileName: 'newFile.py',
          folderId: '1',
          contents: 'print("hello world")',
        })
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFiles = Object.values(source.files);
      const newFile = newFiles.find(f => f.name === 'newFile.py');

      expect(newFile).toBeDefined();
      expect(newFile?.folderId).toBe('1');
      expect(newFile?.contents).toBe('print("hello world")');
      expect(newFile?.language).toBe('py');
      expect(state.hasEdited).toBe(true);
    });

    it('should not create file when project sources is undefined', () => {
      const state = reducer(
        initialState,
        createNewFile({fileName: 'newFile.txt'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('createNewExternalFile', () => {
    it('should create a new external file in root folder', () => {
      const fileUrl = '/v3/assets/channelId/abc-def.png';
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewExternalFile({
          fileName: 'image.png',
          url: fileUrl,
        })
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFiles = Object.values(source.files);
      const newFile = newFiles.find(f => f.name === 'image.png');

      expect(newFile).toBeDefined();
      expect(newFile?.folderId).toBe(DEFAULT_FOLDER_ID);
      expect(newFile?.contents).toBe('');
      expect(newFile?.url).toBe(fileUrl);
      expect(newFile?.language).toBe('png');
      expect(state.hasEdited).toBe(true);
    });

    it('should create a new external file in specific folder', () => {
      const fileUrl = '/v3/assets/channelId/abc-def.png';
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewExternalFile({
          fileName: 'image.png',
          url: fileUrl,
          folderId: '1',
        })
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFiles = Object.values(source.files);
      const newFile = newFiles.find(f => f.name === 'image.png');

      expect(newFile).toBeDefined();
      expect(newFile?.folderId).toBe('1');
      expect(newFile?.contents).toBe('');
      expect(newFile?.url).toBe(fileUrl);
      expect(newFile?.language).toBe('png');
      expect(state.hasEdited).toBe(true);
    });

    it('should not create file when project sources is undefined', () => {
      const fileUrl = '/v3/assets/channelId/abc-def.png';
      const state = reducer(
        initialState,
        createNewExternalFile({fileName: 'image.png', url: fileUrl})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('renameFile', () => {
    it('should rename an existing file', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        renameFile({fileId: '1', newName: 'renamed.html'})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).files['1'].name
      ).toBe('renamed.html');
      expect(state.hasEdited).toBe(true);
    });

    it('should not rename if file does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        renameFile({fileId: 'nonexistent', newName: 'renamed.txt'})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not rename when project sources is undefined', () => {
      const state = reducer(
        initialState,
        renameFile({fileId: '1', newName: 'renamed.txt'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('saveFile', () => {
    it('should save file contents', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const newContents = '<h1>Updated HTML</h1>';
      const state = reducer(
        initialStateWithSources,
        saveFile({fileId: '1', contents: newContents})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).files['1'].contents
      ).toBe(newContents);
      expect(state.hasEdited).toBe(true);
    });

    it('should not save if file does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        saveFile({fileId: 'nonexistent', contents: 'new content'})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not save when project sources is undefined', () => {
      const state = reducer(
        initialState,
        saveFile({fileId: '1', contents: 'new content'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('setFileType', () => {
    it('should set file type', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        setFileType({fileId: '1', type: ProjectFileType.VALIDATION})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).files['1'].type
      ).toBe(ProjectFileType.VALIDATION);
      expect(state.hasEdited).toBe(true);
    });

    it('should not set type if file does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        setFileType({fileId: 'nonexistent', type: ProjectFileType.VALIDATION})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not set type when project sources is undefined', () => {
      const state = reducer(
        initialState,
        setFileType({fileId: '1', type: ProjectFileType.VALIDATION})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('activateFile', () => {
    it('should activate a file', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, activateFile('2'));

      expect(
        (state.projectSources!.source as MultiFileSource).files['2'].active
      ).toBe(true);
      expect(state.hasEdited).toBe(false); // Activating doesn't count as edit
    });

    it('should not activate when project sources is undefined', () => {
      const state = reducer(initialState, activateFile('1'));
      expect(state).toEqual(initialState);
    });
  });

  describe('closeFile', () => {
    it('should close a file', () => {
      const initialProjectSources = createMockProjectSources({
        openFiles: ['1', '2'],
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, closeFile('1'));
      const newSource = state.projectSources!.source as MultiFileSource;
      expect(newSource.files['1'].active).toBe(false);
      expect(newSource.openFiles).toEqual(['2']);
      expect(newSource.files['2'].active).toBe(true);
      expect(state.hasEdited).toBe(false); // Closing doesn't count as edit
    });

    it('should not close when project sources is undefined', () => {
      const state = reducer(initialState, closeFile('1'));
      expect(state).toEqual(initialState);
    });
  });

  describe('deleteFile', () => {
    it('should delete an existing file', () => {
      const initialProjectSources = createMockProjectSources({
        openFiles: ['1', '2'],
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, deleteFile({fileId: '1'}));

      const newSource = state.projectSources!.source as MultiFileSource;
      expect(newSource.files['1']).toBeUndefined();
      expect(newSource.openFiles).toEqual(['2']);
      expect(newSource.files['2'].active).toBe(true);
      expect(state.hasEdited).toBe(true);
    });

    it('should not delete if file does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        deleteFile({fileId: 'nonexistent'})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not delete when project sources is undefined', () => {
      const state = reducer(initialState, deleteFile({fileId: '1'}));
      expect(state).toEqual(initialState);
    });
  });

  describe('moveFile', () => {
    it('should move file to different folder', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        moveFile({fileId: '1', folderId: '1'})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).files['1'].folderId
      ).toBe('1');
      expect(state.hasEdited).toBe(true);
    });

    it('should not move if file does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        moveFile({fileId: 'nonexistent', folderId: '1'})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not move when project sources is undefined', () => {
      const state = reducer(
        initialState,
        moveFile({fileId: '1', folderId: '1'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('moveFolder', () => {
    it('should move folder to different parent', () => {
      const initialProjectSources = createMockProjectSources({
        folders: {
          '1': createMockFolder('1'),
          '2': createMockFolder('2', {parentId: '1'}),
        },
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        moveFolder({folderId: '2', parentId: DEFAULT_FOLDER_ID})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).folders['2'].parentId
      ).toBe(DEFAULT_FOLDER_ID);
      expect(state.hasEdited).toBe(true);
    });

    it('should not move if folder does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        moveFolder({folderId: 'nonexistent', parentId: DEFAULT_FOLDER_ID})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not move when project sources is undefined', () => {
      const state = reducer(
        initialState,
        moveFolder({folderId: '1', parentId: DEFAULT_FOLDER_ID})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('createNewFolder', () => {
    it('should create new folder in root', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewFolder({folderName: 'newFolder'})
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFolders = Object.values(source.folders);
      const newFolder = newFolders.find(
        (f: ProjectFolder) => f.name === 'newFolder'
      );

      expect(newFolder).toBeDefined();
      expect(newFolder?.parentId).toBe(DEFAULT_FOLDER_ID);
      expect(state.hasEdited).toBe(true);
    });

    it('should create new folder in specific parent', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        createNewFolder({folderName: 'newFolder', parentId: '1'})
      );

      const source = state.projectSources!.source as MultiFileSource;
      const newFolders = Object.values(source.folders);
      const newFolder = newFolders.find(
        (f: ProjectFolder) => f.name === 'newFolder'
      );

      expect(newFolder).toBeDefined();
      expect(newFolder?.parentId).toBe('1');
      expect(state.hasEdited).toBe(true);
    });

    it('should not create folder when project sources is undefined', () => {
      const state = reducer(
        initialState,
        createNewFolder({folderName: 'newFolder'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('toggleOpenFolder', () => {
    it('should toggle folder open state', () => {
      const initialProjectSources = createMockProjectSources({
        folders: {
          '1': createMockFolder('1', {open: false}),
        },
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, toggleOpenFolder('1'));

      expect(
        (state.projectSources!.source as MultiFileSource).folders['1'].open
      ).toBe(true);
      expect(state.hasEdited).toBe(false); // Toggling doesn't count as edit
    });

    it('should toggle folder from open to closed', () => {
      const initialProjectSources = createMockProjectSources({
        folders: {
          '1': createMockFolder('1', {open: true}),
        },
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, toggleOpenFolder('1'));

      expect(
        (state.projectSources!.source as MultiFileSource).folders['1'].open
      ).toBe(false);
      expect(state.hasEdited).toBe(false);
    });

    it('should not toggle if folder does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        toggleOpenFolder('nonexistent')
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not toggle when project sources is undefined', () => {
      const state = reducer(initialState, toggleOpenFolder('1'));
      expect(state).toEqual(initialState);
    });
  });

  describe('deleteFolder', () => {
    it('should delete an existing folder', () => {
      const initialProjectSources = {
        source: {
          files: {
            '1': createMockFile('1', {
              name: 'index.html',
              language: 'html',
            }),
            '2': createMockFile('2', {
              name: 'script.js',
              language: 'javascript',
            }),
            '3': createMockFile('3', {
              name: 'style.css',
              language: 'css',
              folderId: '1',
              active: true,
            }),
          },
          folders: {
            '1': createMockFolder('1'),
          },
          openFiles: ['1', '2', '3'],
        },
        labConfig: undefined,
      };
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(initialStateWithSources, deleteFolder('1'));

      const newSource = state.projectSources!.source as MultiFileSource;
      expect(newSource.folders['1']).toBeUndefined();
      expect(newSource.files['1'].active).toBe(true);
      expect(state.hasEdited).toBe(true);
    });

    it('should not delete if folder does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        deleteFolder('nonexistent')
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not delete when project sources is undefined', () => {
      const state = reducer(initialState, deleteFolder('1'));
      expect(state).toEqual(initialState);
    });
  });

  describe('renameFolder', () => {
    it('should rename an existing folder', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        renameFolder({folderId: '1', newName: 'renamedFolder'})
      );

      expect(
        (state.projectSources!.source as MultiFileSource).folders['1'].name
      ).toBe('renamedFolder');
      expect(state.hasEdited).toBe(true);
    });

    it('should not rename if folder does not exist', () => {
      const initialProjectSources = createMockProjectSources();
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        renameFolder({folderId: 'nonexistent', newName: 'renamed'})
      );

      expect(state).toEqual(initialStateWithSources);
    });

    it('should not rename when project sources is undefined', () => {
      const state = reducer(
        initialState,
        renameFolder({folderId: '1', newName: 'renamed'})
      );

      expect(state).toEqual(initialState);
    });
  });

  describe('rearrangeFiles', () => {
    it('should rearrange open files', () => {
      const initialProjectSources = createMockProjectSources({
        openFiles: ['1', '2'],
      });
      const initialStateWithSources = {
        ...initialState,
        projectSources: initialProjectSources,
      };

      const state = reducer(
        initialStateWithSources,
        rearrangeFiles(['2', '1'])
      );

      expect(
        (state.projectSources!.source as MultiFileSource).openFiles
      ).toEqual(['2', '1']);
      expect(state.hasEdited).toBe(false); // Rearranging doesn't count as edit
    });

    it('should not rearrange when project sources is undefined', () => {
      const state = reducer(initialState, rearrangeFiles(['1', '2']));
      expect(state).toEqual(initialState);
    });
  });

  describe('resetProjectMetadata', () => {
    it('should reset project metadata', () => {
      const stateWithMetadata = {
        ...initialState,
        hasEdited: true,
        viewingOldVersion: true,
        restoredOldVersion: true,
        projectSources: undefined,
      };

      const state = reducer(stateWithMetadata, resetProjectMetadata());

      expect(state.hasEdited).toBe(false);
      expect(state.viewingOldVersion).toBe(false);
      expect(state.restoredOldVersion).toBe(false);
    });
  });
});
