import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

import DataDocFormEditor from '../../../../levelbuilder/data-docs-editor/DataDocFormEditor';

$(document).ready(() => {
  const store = getStore();
  const {dataDocKey, dataDocName, dataDocContent} = getScriptData('dataDoc');
  ReactDOM.render(
    <Provider store={store}>
      <DataDocFormEditor
        dataDocKey={dataDocKey}
        originalDataDocName={dataDocName}
        originalDataDocContent={dataDocContent}
      />
    </Provider>,
    document.getElementById('edit-data-doc')
  );
});
