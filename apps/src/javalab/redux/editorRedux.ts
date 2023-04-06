/**
 * Redux store for editor-specific Java Lab state.
 */

const {
  fileMetadataForEditor,
  updateAllSourceFileOrders
} = require('@cdo/apps/javalab/JavalabFileHelper');
const {
  JavalabEditorDialog
} = require('@cdo/apps/javalab/JavalabEditorDialogManager');
import _ from 'lodash';
import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Sources {
  [key: string]: {
    text: string;
    tabOrder: number;
    isVisible?: boolean;
    isValidation?: boolean;
  };
}

interface FileMetadata {
  [key: string]: string;
}

interface JavalabEditorState {
  fileMetadata: FileMetadata;
  orderedTabKeys: string[];
  activeTabKey: string;
  lastTabKeyIndex: number;
  sources: Sources;
  validation: Sources;
  editorOpenDialogName: string | null;
  newFileError: string | null;
  renameFileError: string | null;
  editTabKey: string | null;
}

const initialSources: Sources = {
  'MyClass.java': {text: '', tabOrder: 0, isVisible: true, isValidation: false}
};

const {fileMetadata, orderedTabKeys, activeTabKey, lastTabKeyIndex} =
  fileMetadataForEditor(initialSources);

// exported for testing
export const initialState: JavalabEditorState = {
  fileMetadata,
  orderedTabKeys,
  activeTabKey,
  lastTabKeyIndex,
  sources: initialSources,
  validation: {},
  editorOpenDialogName: null,
  newFileError: null,
  renameFileError: null,
  editTabKey: null
};

const javalabEditorSlice = createSlice({
  name: 'javalabEditor',
  initialState,
  reducers: {
    setSource: {
      reducer(
        state,
        action: PayloadAction<{
          filename: string;
          source: string;
          tabOrder: number;
          isVisible?: boolean;
          isValidation?: boolean;
        }>
      ) {
        const {
          filename,
          source,
          tabOrder,
          isVisible = true,
          isValidation = false
        } = action.payload;
        const newSources = {
          ...state.sources,
          [filename]: {text: source, tabOrder, isVisible, isValidation}
        };
        state.sources = newSources;
      },
      prepare(
        filename: string,
        source: string,
        tabOrder: number,
        isVisible: boolean = true,
        isValidation: boolean = false
      ) {
        return {payload: {filename, source, tabOrder, isVisible, isValidation}};
      }
    },
    setAllValidation(state, action: PayloadAction<Sources>) {
      state.validation = action.payload;
    },
    setAllSourcesAndFileMetadata: {
      reducer(
        state,
        action: PayloadAction<{
          sources: Sources;
          isEditingStartSources: boolean;
        }>
      ) {
        const {fileMetadata, orderedTabKeys, activeTabKey, lastTabKeyIndex} =
          fileMetadataForEditor(
            action.payload.sources,
            action.payload.isEditingStartSources
          );
        const updatedSources = updateAllSourceFileOrders(
          action.payload.sources,
          fileMetadata,
          orderedTabKeys
        );
        state.sources = updatedSources;
        state.fileMetadata = fileMetadata;
        state.orderedTabKeys = orderedTabKeys;
        state.activeTabKey = activeTabKey;
        state.lastTabKeyIndex = lastTabKeyIndex;
      },
      prepare(sources: Sources, isEditingStartSources: boolean) {
        return {payload: {sources, isEditingStartSources}};
      }
    },
    renameFile: {
      reducer(
        state,
        action: PayloadAction<{oldFilename: string; newFilename: string}>
      ) {
        const source = state.sources[action.payload.oldFilename];
        if (source !== undefined) {
          let newSources = {...state.sources};
          delete newSources[action.payload.oldFilename];
          newSources[action.payload.newFilename] = source;
          state.sources = newSources;
        } else {
          // if old filename doesn't exist, can't do a rename
          return state;
        }
      },
      prepare(oldFilename: string, newFilename: string) {
        return {payload: {oldFilename, newFilename}};
      }
    },
    sourceTextUpdated: {
      reducer(state, action: PayloadAction<{filename: string; text: string}>) {
        state.sources[action.payload.filename].text = action.payload.text;
      },
      prepare(filename: string, text: string) {
        return {payload: {filename, text}};
      }
    },
    sourceVisibilityUpdated: {
      reducer(
        state,
        action: PayloadAction<{filename: string; isVisible: boolean}>
      ) {
        state.sources[action.payload.filename].isVisible =
          action.payload.isVisible;
      },
      prepare(filename: string, isVisible: boolean) {
        return {payload: {filename, isVisible}};
      }
    },
    sourceValidationUpdated: {
      reducer(
        state,
        action: PayloadAction<{filename: string; isValidation: boolean}>
      ) {
        state.sources[action.payload.filename].isValidation =
          action.payload.isValidation;
      },
      prepare(filename: string, isValidation: boolean) {
        return {payload: {filename, isValidation}};
      }
    },
    sourceFileOrderUpdated(state) {
      const sources = _.cloneDeep(state.sources);
      const updatedSources = updateAllSourceFileOrders(
        sources,
        state.fileMetadata,
        state.orderedTabKeys
      );
      state.sources = updatedSources;
    },
    removeFile(state, action: PayloadAction<string>) {
      const filename = action.payload;
      let newSources = {...state.sources};
      delete newSources[filename];
      state.sources = newSources;
    },
    openEditorDialog(state, action: PayloadAction<string>) {
      if (JavalabEditorDialog[action.payload] !== undefined) {
        state.editorOpenDialogName = action.payload;
      }
    },
    closeEditorDialog(state) {
      state.editorOpenDialogName = null;
    },
    setEditTabKey(state, action: PayloadAction<string>) {
      state.editTabKey = action.payload;
    },
    setActiveTabKey(state, action: PayloadAction<string>) {
      state.activeTabKey = action.payload;
    },
    setFileMetadata(state, action: PayloadAction<FileMetadata>) {
      state.fileMetadata = action.payload;
    },
    setOrderedTabKeys(state, action: PayloadAction<string[]>) {
      state.orderedTabKeys = action.payload;
    },
    setAllEditorMetadata: {
      reducer(
        state,
        action: PayloadAction<{
          fileMetadata: FileMetadata;
          orderedTabKeys: string[];
          activeTabKey: string;
          lastTabKeyIndex: number;
        }>
      ) {
        state.fileMetadata = action.payload.fileMetadata;
        state.orderedTabKeys = action.payload.orderedTabKeys;
        state.activeTabKey = action.payload.activeTabKey;
        state.lastTabKeyIndex = action.payload.lastTabKeyIndex;
      },
      prepare(
        fileMetadata: FileMetadata,
        orderedTabKeys: string[],
        activeTabKey: string,
        lastTabKeyIndex: number
      ) {
        return {
          payload: {fileMetadata, orderedTabKeys, activeTabKey, lastTabKeyIndex}
        };
      }
    },
    setNewFileError(state, action: PayloadAction<string>) {
      state.newFileError = action.payload;
    },
    clearNewFileError(state) {
      state.newFileError = null;
    },
    setRenameFileError(state, action: PayloadAction<string>) {
      state.renameFileError = action.payload;
    },
    clearRenameFileError(state) {
      state.renameFileError = null;
    }
  }
});

// Selectors
// We don't have a type for the entire redux store yet, so we need to use any here.
const selectSources = (state: any) => state.javalabEditor.sources;

export const getSources = createSelector(selectSources, sources => {
  const result: Sources = {};
  for (const key in sources) {
    if (!sources[key].isValidation) {
      result[key] = {
        text: sources[key].text,
        isVisible: sources[key].isVisible,
        tabOrder: sources[key].tabOrder
      };
    }
  }
  return result;
});

export const getValidation = createSelector(selectSources, sources => {
  const validation: Sources = {};
  for (const key in sources) {
    if (sources[key].isValidation) {
      validation[key] = {
        text: sources[key].text,
        tabOrder: sources[key].tabOrder
      };
    }
  }
  return validation;
});

// Exports
export const {
  setSource,
  setAllValidation,
  setAllSourcesAndFileMetadata,
  renameFile,
  sourceTextUpdated,
  sourceVisibilityUpdated,
  sourceValidationUpdated,
  sourceFileOrderUpdated,
  removeFile,
  openEditorDialog,
  closeEditorDialog,
  setEditTabKey,
  setActiveTabKey,
  setFileMetadata,
  setOrderedTabKeys,
  setAllEditorMetadata,
  setRenameFileError,
  clearRenameFileError,
  setNewFileError,
  clearNewFileError
} = javalabEditorSlice.actions;

export default javalabEditorSlice.reducer;
