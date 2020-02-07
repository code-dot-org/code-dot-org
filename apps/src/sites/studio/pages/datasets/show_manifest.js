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
  initializeCodeMirror('content', 'application/json', {callback: onChange});
  ReactDOM.render(
    <Provider store={store}>
      <ManifestEditor />
    </Provider>,
    document.querySelector('.preview_container')
  );
});

function onChange(editor) {
  try {
    const newManifest = JSON.parse(editor.getValue());
    getStore().dispatch(setLibraryManifest(newManifest));
  } catch (e) {
    getStore().dispatch(setLibraryManifest({}));
  }
}
