import {setFileName, setEditorText} from './javalabRedux';
import project from '@cdo/apps/code-studio/initApp/project';
import header from '@cdo/apps/code-studio/header';
import {getStore} from '../redux';
var filesApi = require('@cdo/apps/clientApi').files;
var assetListStore = require('../code-studio/assets/assetListStore');

// Called by Javalab when a file has been renamed
function renameProjectFile(filename, newFilename) {
  // no need to rename if the name hasn't changed
  if (filename === newFilename) {
    return;
  }
  header.showProjectSaving();
  filesApi.renameFile(
    filename,
    newFilename,
    () => {
      // at this point project.filesVersionId will be updated and we can save
      // sources as well.
      project.save();
    },
    () => {
      console.warn(`Javalab: error file ${filename} not renamed`);
      project.showSaveError_();
    }
  );
}

function onSave() {
  header.showProjectSaving();
  const filename = getStore().getState().javalab.filename;
  const editorText = getStore().getState().javalab.editorText;
  // TODO: enable multi-file
  filesApi.putFile(
    filename,
    editorText,
    () => {
      // at this point project.filesVersionId will be updated and we can save
      // sources as well.
      project.save();
    },
    () => {
      console.warn(`Javalab: error file ${filename} not renamed`);
      project.showSaveError_();
    }
  );
}

/**
 * Load the file entry list and store it as this.fileEntries
 */
function loadFiles(success, failure, version) {
  const onFilesReady = (files, filesVersionId) => {
    console.log('in onFilesReady');
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
        console.error('files API failed, status: ' + xhr.status);
        failure();
      }
    },
    version
  );
}

function populateFiles(fileEntries, success, failure) {
  console.log('in populateFiles');
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
      console.log('about to call success');
      success();
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      failure();
    });
}

module.exports = {renameProjectFile, onSave, loadFiles, populateFiles};
