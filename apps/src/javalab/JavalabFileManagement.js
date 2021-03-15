import {setFileName, setEditorText, setFilesChanged} from './javalabRedux';
import project from '@cdo/apps/code-studio/initApp/project';
import {getStore} from '../redux';
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('../code-studio/assets/assetListStore');

// Called by Javalab when a file has been renamed
function renameProjectFile(filename, newFilename) {
  // no need to rename if the name hasn't changed
  if (filename === newFilename) {
    return;
  }
  filesApi.renameFile(
    filename,
    newFilename,
    () => {
      // at this point project.filesVersionId will be updated and we can save
      // sources as well.
      project.autosave();
    },
    () => {
      console.warn(`Javalab: error file ${filename} not renamed`);
      project.showSaveError_();
    }
  );
}

function onSave(success, failure) {
  // TODO: enable multi-file
  const filesChanged = getStore().getState().javalab.filesChanged;
  // only save file if file content has changed.
  if (filesChanged) {
    const filename = getStore().getState().javalab.filename;
    const editorText = getStore().getState().javalab.editorText;
    filesApi.putFile(
      filename,
      editorText,
      /* success */
      (xhr, filesVersionId) => {
        // reset files changed to false on success
        getStore().dispatch(setFilesChanged(false));
        if (success) {
          success(xhr, filesVersionId);
        }
      },
      failure
    );
  } else {
    if (success) {
      success(null, project.filesVersionId);
    }
  }
}

/**
 * Load the file entry list and store it as this.fileEntries
 */
function loadFiles(success, failure, version) {
  const onFilesReady = (files, filesVersionId) => {
    assetListStore.reset(files);
    const fileEntries = assetListStore.list().map(fileEntry => ({
      name: fileEntry.filename,
      url: filesApi.basePath(fileEntry.filename),
      versionId: fileEntry.versionId
    }));
    populateFiles(fileEntries, success, failure);
    project.filesVersionId = filesVersionId;
  };

  filesApi.getFiles(
    /* success */
    result => onFilesReady(result.files, result.filesVersionId),
    /* failure */
    xhr => {
      if (xhr.status === 404) {
        // No files in this project yet, proceed with an empty file
        // list and no start version id
        onFilesReady([], null);
      } else {
        console.error('files API failed to get files, status: ' + xhr.status);
        failure();
      }
    },
    version
  );
}

function populateFiles(fileEntries, success, failure) {
  if (fileEntries.length === 0) {
    // TODO: make starter code more customizable
    success();
  } else {
    // TODO: enable multi-file
    const fileEntry = fileEntries[0];
    requestFileEntryAndWrite(fileEntry, success, failure);
  }
}

function requestFileEntryAndWrite(fileEntry, success, failure) {
  // read the data
  $.ajax(`${fileEntry.url}?version=${fileEntry.versionId}`, {
    dataType: 'text'
  })
    .done(fileContent => {
      getStore().dispatch(setFileName(fileEntry.name));
      getStore().dispatch(setEditorText(fileContent));
      success();
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      failure();
    });
}

// set project changed to true
function onProjectChanged() {
  project.projectChanged();
}

export default {
  renameProjectFile,
  onSave,
  loadFiles,
  populateFiles,
  onProjectChanged
};
