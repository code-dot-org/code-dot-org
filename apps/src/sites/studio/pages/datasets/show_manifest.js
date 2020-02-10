import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import data, {setLibraryManifest} from '@cdo/apps/storage/redux/data';
import {getStore, registerReducers} from '@cdo/apps/redux';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import ManifestEditor from '@cdo/apps/storage/levelbuilder/ManifestEditor';

$(document).ready(function() {
  const manifest = getScriptData('libraryManifest');
  registerReducers({data});
  const store = getStore();
  store.dispatch(setLibraryManifest(manifest));
  ReactDOM.render(
    <Provider store={store}>
      <ManifestEditor />
    </Provider>,
    document.querySelector('.manifest_editor')
  );
  initializeCodeMirror('content', 'application/json', {callback: onChange});
});

function onChange(editor) {
  try {
    const newManifest = JSON.parse(editor.getValue());
    getStore().dispatch(setLibraryManifest(newManifest));
  } catch (e) {
    // There is a JSON error, so set the manifest to {} so we can show an error
    // instead of the library preview
    getStore().dispatch(setLibraryManifest({}));
  }
}
