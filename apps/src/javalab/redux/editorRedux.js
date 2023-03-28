import {
  fileMetadataForEditor,
  updateAllSourceFileOrders
} from '@cdo/apps/javalab/JavalabFileHelper';
import {JavalabEditorDialog} from '@cdo/apps/javalab/JavalabEditorDialogManager';
import _ from 'lodash';

const RENAME_FILE = 'javalab/RENAME_FILE';
const SET_SOURCE = 'javalab/SET_SOURCE';
const SOURCE_VISIBILITY_UPDATED = 'javalab/SOURCE_VISIBILITY_UPDATED';
const SOURCE_VALIDATION_UPDATED = 'javalab/SOURCE_VALIDATION_UPDATED';
const SOURCE_FILE_ORDER_UPDATED = 'javalab/SOURCE_FILE_ORDER_UPDATED';
const SOURCE_TEXT_UPDATED = 'javalab/SOURCE_TEXT_UPDATED';
const SET_ALL_SOURCES_AND_FILE_METADATA =
  'javalab/SET_ALL_SOURCES_AND_FILE_METADATA';
const SET_ALL_VALIDATION = 'javalab/SET_ALL_VALIDATION';
const REMOVE_FILE = 'javalab/REMOVE_FILE';
const SET_EDIT_TAB_KEY = 'javalab/SET_EDIT_TAB_KEY';
const SET_ACTIVE_TAB_KEY = 'javalab/SET_ACTIVE_TAB_KEY';
const SET_FILE_METADATA = 'javalab/SET_FILE_METADATA';
const SET_ORDERED_TAB_KEYS = 'javalab/SET_ORDERED_TAB_KEYS';
const SET_ALL_EDITOR_METADATA = 'javalab/SET_EDITOR_METADATA';
const SET_NEW_FILE_ERROR = 'javalab/SET_NEW_FILE_ERROR';
const CLEAR_NEW_FILE_ERROR = 'javalab/CLEAR_NEW_FILE_ERROR';
const SET_RENAME_FILE_ERROR = 'javalab/SET_RENAME_FILE_ERROR';
const CLEAR_RENAME_FILE_ERROR = 'javalab/CLEAR_RENAME_FILE_ERROR';
const OPEN_EDITOR_DIALOG = 'javalab/OPEN_EDITOR_DIALOG';
const CLOSE_EDITOR_DIALOG = 'javalab/CLOSE_EDITOR_DIALOG';

const initialSources = {
  'MyClass.java': {text: '', tabOrder: 0, isVisible: true, isValidation: false}
};

const {
  fileMetadata,
  orderedTabKeys,
  activeTabKey,
  lastTabKeyIndex
} = fileMetadataForEditor(initialSources);

// exported for testing
export const initialState = {
  fileMetadata,
  orderedTabKeys,
  activeTabKey,
  lastTabKeyIndex,
  sources: initialSources,
  validation: {},
  editorOpenDialogName: null,
  newFileError: null,
  renameFileError: null
};

// Action creators
export const setSource = (
  filename,
  source,
  tabOrder,
  isVisible = true,
  isValidation = false
) => ({
  type: SET_SOURCE,
  filename,
  source,
  tabOrder,
  isVisible,
  isValidation
});

export const setAllValidation = validation => ({
  type: SET_ALL_VALIDATION,
  validation
});

export const setAllSourcesAndFileMetadata = (
  sources,
  isEditingStartSources
) => ({
  type: SET_ALL_SOURCES_AND_FILE_METADATA,
  sources,
  isEditingStartSources
});

export const renameFile = (oldFilename, newFilename) => ({
  type: RENAME_FILE,
  oldFilename,
  newFilename
});

// Handles updates to text within Code Mirror (ie, when text is edited)
export const sourceTextUpdated = (filename, text) => ({
  type: SOURCE_TEXT_UPDATED,
  filename,
  text
});

export const sourceVisibilityUpdated = (filename, isVisible) => ({
  type: SOURCE_VISIBILITY_UPDATED,
  filename,
  isVisible
});

export const sourceValidationUpdated = (filename, isValidation) => ({
  type: SOURCE_VALIDATION_UPDATED,
  filename,
  isValidation
});

export const sourceFileOrderUpdated = () => ({
  type: SOURCE_FILE_ORDER_UPDATED
});

export const removeFile = filename => ({
  type: REMOVE_FILE,
  filename
});

export const openEditorDialog = dialogName => ({
  type: OPEN_EDITOR_DIALOG,
  dialogName
});

export const closeEditorDialog = () => ({
  type: CLOSE_EDITOR_DIALOG
});

export const setEditTabKey = editTabKey => {
  return {
    type: SET_EDIT_TAB_KEY,
    editTabKey
  };
};

export const setActiveTabKey = activeTabKey => {
  return {
    type: SET_ACTIVE_TAB_KEY,
    activeTabKey
  };
};

export const setFileMetadata = fileMetadata => {
  return {
    type: SET_FILE_METADATA,
    fileMetadata
  };
};

export const setOrderedTabKeys = orderedTabKeys => {
  return {
    type: SET_ORDERED_TAB_KEYS,
    orderedTabKeys
  };
};

export const setAllEditorMetadata = (
  fileMetadata,
  orderedTabKeys,
  activeTabKey,
  lastTabKeyIndex
) => {
  return {
    type: SET_ALL_EDITOR_METADATA,
    fileMetadata,
    orderedTabKeys,
    activeTabKey,
    lastTabKeyIndex
  };
};

export const setNewFileError = error => ({
  type: SET_NEW_FILE_ERROR,
  error: error
});

export const clearNewFileError = () => ({
  type: CLEAR_NEW_FILE_ERROR
});

export const setRenameFileError = error => ({
  type: SET_RENAME_FILE_ERROR,
  error: error
});

export const clearRenameFileError = () => ({
  type: CLEAR_RENAME_FILE_ERROR
});

// Selectors
export const getSources = state => {
  let sources = {};
  const editorState = state.javalabEditor;
  for (let key in editorState.sources) {
    if (!editorState.sources[key].isValidation) {
      sources[key] = {
        text: editorState.sources[key].text,
        isVisible: editorState.sources[key].isVisible,
        tabOrder: editorState.sources[key].tabOrder
      };
    }
  }
  return sources;
};

export const getValidation = state => {
  let validation = {};
  const editorState = state.javalabEditor;
  for (let key in editorState.sources) {
    if (editorState.sources[key].isValidation) {
      validation[key] = {
        text: editorState.sources[key].text,
        tabOrder: editorState.sources[key].tabOrder
      };
    }
  }
  return validation;
};

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === SET_SOURCE) {
    let newSources = {...state.sources};
    newSources[action.filename] = {
      text: action.source,
      tabOrder: action.tabOrder,
      isVisible: action.isVisible,
      isValidation: action.isValidation
    };
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SET_ALL_VALIDATION) {
    return {
      ...state,
      validation: action.validation
    };
  }
  if (action.type === SET_ALL_SOURCES_AND_FILE_METADATA) {
    const {
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      lastTabKeyIndex
    } = fileMetadataForEditor(action.sources, action.isEditingStartSources);
    const updatedSources = updateAllSourceFileOrders(
      action.sources,
      fileMetadata,
      orderedTabKeys
    );

    return {
      ...state,
      sources: updatedSources,
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      lastTabKeyIndex
    };
  }
  if (action.type === RENAME_FILE) {
    const source = state.sources[action.oldFilename];
    if (source !== undefined) {
      let newSources = {...state.sources};
      delete newSources[action.oldFilename];
      newSources[action.newFilename] = source;
      return {
        ...state,
        sources: newSources
      };
    } else {
      // if old filename doesn't exist, can't do a rename
      return state;
    }
  }
  if (action.type === SOURCE_TEXT_UPDATED) {
    let newSources = _.cloneDeep(state.sources);
    newSources[action.filename].text = action.text;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_VISIBILITY_UPDATED) {
    let newSources = _.cloneDeep(state.sources);
    newSources[action.filename].isVisible = action.isVisible;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_VALIDATION_UPDATED) {
    let newSources = _.cloneDeep(state.sources);
    newSources[action.filename].isValidation = action.isValidation;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_FILE_ORDER_UPDATED) {
    let sources = _.cloneDeep(state.sources);
    let orderedTabKeys = state.orderedTabKeys;
    let fileMetadata = state.fileMetadata;
    const updatedSources = updateAllSourceFileOrders(
      sources,
      fileMetadata,
      orderedTabKeys
    );
    return {
      ...state,
      sources: updatedSources
    };
  }
  if (action.type === OPEN_EDITOR_DIALOG) {
    if (JavalabEditorDialog[action.dialogName] !== undefined) {
      return {
        ...state,
        editorOpenDialogName: action.dialogName
      };
    }
  }
  if (action.type === CLOSE_EDITOR_DIALOG) {
    return {
      ...state,
      editorOpenDialogName: null
    };
  }
  if (action.type === SET_EDIT_TAB_KEY) {
    return {
      ...state,
      editTabKey: action.editTabKey
    };
  }
  if (action.type === SET_ACTIVE_TAB_KEY) {
    return {
      ...state,
      activeTabKey: action.activeTabKey
    };
  }
  if (action.type === SET_ORDERED_TAB_KEYS) {
    return {
      ...state,
      orderedTabKeys: action.orderedTabKeys
    };
  }
  if (action.type === SET_FILE_METADATA) {
    return {
      ...state,
      fileMetadata: action.fileMetadata
    };
  }
  if (action.type === SET_ALL_EDITOR_METADATA) {
    return {
      ...state,
      fileMetadata: action.fileMetadata,
      orderedTabKeys: action.orderedTabKeys,
      activeTabKey: action.activeTabKey,
      lastTabKeyIndex: action.lastTabKeyIndex || state.lastTabKeyIndex
    };
  }

  if (action.type === SET_NEW_FILE_ERROR) {
    return {
      ...state,
      newFileError: action.error
    };
  }

  if (action.type === CLEAR_NEW_FILE_ERROR) {
    return {
      ...state,
      newFileError: null
    };
  }

  if (action.type === SET_RENAME_FILE_ERROR) {
    return {
      ...state,
      renameFileError: action.error
    };
  }

  if (action.type === CLEAR_RENAME_FILE_ERROR) {
    return {
      ...state,
      renameFileError: null
    };
  }
  if (action.type === REMOVE_FILE) {
    let newSources = {...state.sources};
    delete newSources[action.filename];
    return {
      ...state,
      sources: newSources
    };
  }
  return state;
}
