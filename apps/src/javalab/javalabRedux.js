const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const SET_EDITOR_TEXT = 'javalab/SET_EDITOR_TEXT';
const SET_FILENAME = 'javalab/SET_FILENAME';
const SET_FILES = 'javalab/SET_FILES';
const CREATE_UPDATE_FILE = 'javalab/CREATE_UPDATE_FILE';
const RENAME_FILE = 'javalab/RENAME_FILE';
const DELETE_FILE = 'javalab/DELETE_FILE';
const SET_FILES_LOADED = 'javalab/SET_FILES_LOADED';

const initialState = {
  consoleLogs: [],
  files: {},
  editorText: '',
  filename: 'MyClass.java',
  fileEntries: null,
  filesLoaded: false
};

export const appendInputLog = input => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'input', text: input}
});

export const appendOutputLog = output => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'output', text: output}
});

export const setEditorText = editorText => ({
  type: SET_EDITOR_TEXT,
  editorText
});

export const setFileName = filename => ({
  type: SET_FILENAME,
  filename
});

// export const setFileEntries = fileEntries => ({
//   type: SET_FILES,
//   fileEntries
// });

// export const createOrUpdateFile = (fileName, fileContent) => ({
//   type: CREATE_UPDATE_FILE,
//   fileName,
//   fileContent
// });

// export const renameFile = (oldFileName, newFileName) => ({
//   type: RENAME_FILE,
//   oldFileName,
//   newFileName
// });

// export const deleteFile = fileName => ({
//   type: DELETE_FILE,
//   fileName
// });

export const setFilesLoaded = filesLoaded => ({
  type: SET_FILES_LOADED,
  filesLoaded
});

export default function reducer(state = initialState, action) {
  if (action.type === APPEND_CONSOLE_LOG) {
    return {
      ...state,
      consoleLogs: [...state.consoleLogs, action.log]
    };
  }
  if (action.type === SET_EDITOR_TEXT) {
    return {
      ...state,
      editorText: action.editorText
    };
  }
  if (action.type === SET_FILENAME) {
    return {
      ...state,
      filename: action.filename
    };
  }
  if (action.type === SET_FILES) {
    return {
      ...state,
      fileEntries: action.fileEntries
    };
  }
  if (action.type === CREATE_UPDATE_FILE) {
    const files = {...state.files};
    files[action.fileName] = action.fileContent;
    return {
      ...state,
      files
    };
  }
  if (action.type === RENAME_FILE) {
    const files = {...state.files};
    if (action.newFileName === action.oldFileName) {
      return state;
    }
    files[action.newFileName] = files[action.oldFileName];
    var deleted = delete files[action.oldFileName];
    console.log('attempted to delete, result was ' + deleted);
    return {
      ...state,
      files
    };
  }
  if (action.type === DELETE_FILE) {
    const files = {...state.files};
    delete files[action.fileName];
    return {
      ...state,
      files
    };
  }
  if (action.type === SET_FILES_LOADED) {
    return {
      ...state,
      filesLoaded: action.filesLoaded
    };
  }
  return state;
}
