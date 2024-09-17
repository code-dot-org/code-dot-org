/**
 * Redux store for editor-specific Java Lab state.
 */
import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import _ from 'lodash';

import {
  fileMetadataForEditor,
  updateAllSourceFileOrders,
} from '../JavalabFileHelper';
import {JavalabEditorDialog} from '../types';

interface EditorFilesMap {
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

// JavalabEditorDialog is an enum of possible open dialogs.
// keyof typeof gives us the union type of the all the Enum keys as strings.
// https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-compile-time
type JavalabEditorDialogOptions = keyof typeof JavalabEditorDialog;

export interface JavalabEditorState {
  fileMetadata: FileMetadata;
  orderedTabKeys: string[];
  activeTabKey: string;
  lastTabKeyIndex: number;
  sources: EditorFilesMap;
  validation: EditorFilesMap;
  editorOpenDialogName: JavalabEditorDialogOptions | null;
  newFileError: string | null;
  renameFileError: string | null;
  editTabKey: string | null;
  hasCompilationError: boolean;
}

const initialSources: EditorFilesMap = {
  'MyClass.java': {text: '', tabOrder: 0, isVisible: true, isValidation: false},
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
  editTabKey: null,
  hasCompilationError: false,
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
          isValidation = false,
        } = action.payload;
        const newSources = {
          ...state.sources,
          [filename]: {text: source, tabOrder, isVisible, isValidation},
        };
        state.sources = newSources;
      },
      prepare(
        filename: string,
        source: string,
        tabOrder: number,
        isVisible = true,
        isValidation = false
      ) {
        return {payload: {filename, source, tabOrder, isVisible, isValidation}};
      },
    },
    setAllValidation(state, action: PayloadAction<EditorFilesMap>) {
      state.validation = action.payload;
    },
    setAllSourcesAndFileMetadata: {
      reducer(
        state,
        action: PayloadAction<{
          sources: EditorFilesMap;
          isEditingStartSources: boolean;
        }>
      ) {
        const {fileMetadata, orderedTabKeys, activeTabKey, lastTabKeyIndex} =
          fileMetadataForEditor(
            action.payload.sources,
            action.payload.isEditingStartSources
          );
        const sources = _.cloneDeep(action.payload.sources);
        const updatedSources = updateAllSourceFileOrders(
          sources,
          fileMetadata,
          orderedTabKeys
        );
        state.sources = updatedSources;
        state.fileMetadata = fileMetadata;
        state.orderedTabKeys = orderedTabKeys;
        state.activeTabKey = activeTabKey;
        state.lastTabKeyIndex = lastTabKeyIndex;
      },
      prepare(sources: EditorFilesMap, isEditingStartSources: boolean) {
        return {payload: {sources, isEditingStartSources}};
      },
    },
    renameFile: {
      reducer(
        state,
        action: PayloadAction<{oldFilename: string; newFilename: string}>
      ) {
        const source = state.sources[action.payload.oldFilename];
        // if the old filename doesn't exist, this is a no-op
        if (source !== undefined) {
          const newSources = {...state.sources};
          delete newSources[action.payload.oldFilename];
          newSources[action.payload.newFilename] = source;
          state.sources = newSources;
        }
      },
      prepare(oldFilename: string, newFilename: string) {
        return {payload: {oldFilename, newFilename}};
      },
    },
    sourceTextUpdated: {
      reducer(state, action: PayloadAction<{filename: string; text: string}>) {
        state.sources[action.payload.filename].text = action.payload.text;
      },
      prepare(filename: string, text: string) {
        return {payload: {filename, text}};
      },
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
      },
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
      },
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
      const newSources = {...state.sources};
      delete newSources[filename];
      state.sources = newSources;
    },
    openEditorDialog(state, action: PayloadAction<JavalabEditorDialogOptions>) {
      if (Object.values(JavalabEditorDialog).includes(action.payload)) {
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
        state.lastTabKeyIndex =
          action.payload.lastTabKeyIndex || state.lastTabKeyIndex;
      },
      prepare(
        fileMetadata: FileMetadata,
        orderedTabKeys: string[],
        activeTabKey: string,
        lastTabKeyIndex: number
      ) {
        return {
          payload: {
            fileMetadata,
            orderedTabKeys,
            activeTabKey,
            lastTabKeyIndex,
          },
        };
      },
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
    },
    setHasCompilationError(state, action: PayloadAction<boolean>) {
      state.hasCompilationError = action.payload;
    },
  },
});

// Selectors
const selectSources = (state: {javalabEditor: JavalabEditorState}) =>
  state.javalabEditor.sources;

export const getSources = createSelector(selectSources, sources => {
  const result: EditorFilesMap = {};
  for (const key in sources) {
    if (!sources[key].isValidation) {
      result[key] = {
        text: sources[key].text,
        isVisible: sources[key].isVisible,
        tabOrder: sources[key].tabOrder,
      };
    }
  }
  return result;
});

export const getValidation = createSelector(selectSources, sources => {
  const validation: EditorFilesMap = {};
  for (const key in sources) {
    if (sources[key].isValidation) {
      validation[key] = {
        text: sources[key].text,
        tabOrder: sources[key].tabOrder,
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
  clearNewFileError,
  setHasCompilationError,
} = javalabEditorSlice.actions;

export default javalabEditorSlice.reducer;
