import React from 'react';
import ReactDOM from 'react-dom';

import getScriptData from '@cdo/apps/util/getScriptData';

import DataDocEditAll from '../../../../levelbuilder/data-docs-editor/DataDocEditAll';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  ReactDOM.render(
    <DataDocEditAll dataDocs={dataDocs} />,
    document.getElementById('edit-all-data-docs')
  );
});
