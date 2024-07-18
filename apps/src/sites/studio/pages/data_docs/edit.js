import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

import DataDocFormEditor from '../../../../lib/levelbuilder/data-docs-editor/DataDocFormEditor';

$(document).ready(() => {
  const store = getStore();
  const {dataDocKey, dataDocName, dataDocContent} = getScriptData('dataDoc');
  const root = createRoot(document.getElementById('edit-data-doc'));

  root.render(
    <Provider store={store}>
      <DataDocFormEditor
        dataDocKey={dataDocKey}
        originalDataDocName={dataDocName}
        originalDataDocContent={dataDocContent}
      />
    </Provider>
  );
});
